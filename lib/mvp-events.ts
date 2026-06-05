import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/db/prisma";
import { getIP } from "@/lib/ip";
import { redis } from "@/lib/redis";

export const MVP_EVENT_TYPES = [
  "page_view",
  "composition_tab_click",
  "generate_click",
  "generate_success",
  "generate_failed",
  "download_click",
] as const;

export type MvpEventType = (typeof MVP_EVENT_TYPES)[number];

type MvpIdentity = {
  anonymousId: string;
  sessionId: string;
  shouldSetAnonymousId: boolean;
  shouldSetSessionId: boolean;
};

type MvpEventOptions = {
  taskId?: string;
  provider?: string;
  durationMs?: number;
  metadata?: Record<string, unknown>;
};

const ANONYMOUS_COOKIE = "mvp_anonymous_id";
const SESSION_COOKIE = "mvp_session_id";
const FREE_PROVIDER_CALL_LIMIT = 2;
const GENERATING_LOCK_TTL_SECONDS = 60;
const DAY_TTL_SECONDS = 60 * 60 * 48;
const TERMINAL_TTL_SECONDS = 60 * 60 * 24 * 14;

const localDailyCounts = new Map<string, number>();
const localLocks = new Map<string, number>();
const localTaskStarts = new Map<string, number>();
const localTerminalTasks = new Set<string>();

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function isProduction() {
  return process.env.NODE_ENV === "production" || process.env.APP_ENV === "production";
}

function hasRedisConfig() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

function createId(prefix: string) {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}_${id}`;
}

function getHeader(request: Request, name: string) {
  return request.headers.get(name) || null;
}

function getPagePath(request: Request) {
  const pagePath = getHeader(request, "x-page-path");
  if (pagePath) return pagePath.slice(0, 500);

  try {
    return new URL(request.url).pathname.slice(0, 500);
  } catch {
    return null;
  }
}

function isBotUserAgent(userAgent: string | null) {
  return Boolean(
    userAgent &&
      /bot|crawler|spider|crawling|slurp|bingpreview|facebookexternalhit|preview/i.test(
        userAgent,
      ),
  );
}

function getDeviceType(userAgent: string | null) {
  if (!userAgent) return "unknown";
  if (isBotUserAgent(userAgent)) return "bot";
  if (/ipad|tablet/i.test(userAgent)) return "tablet";
  if (/mobile|iphone|android/i.test(userAgent)) return "mobile";
  return "desktop";
}

function getCountry(request: Request) {
  const geoCountry = (request as NextRequest).geo?.country;
  return (
    geoCountry ||
    getHeader(request, "x-vercel-ip-country") ||
    getHeader(request, "cf-ipcountry") ||
    null
  );
}

export function getClientIp(request: Request) {
  return getIP(request).slice(0, 45);
}

export function getMvpIdentity(request: NextRequest): MvpIdentity {
  const cached = (request as any).__mvpIdentity as MvpIdentity | undefined;
  if (cached) return cached;

  const anonymousId =
    request.cookies.get(ANONYMOUS_COOKIE)?.value || createId("anon");
  const sessionId =
    request.cookies.get(SESSION_COOKIE)?.value || createId("sess");

  const identity = {
    anonymousId,
    sessionId,
    shouldSetAnonymousId: !request.cookies.get(ANONYMOUS_COOKIE)?.value,
    shouldSetSessionId: !request.cookies.get(SESSION_COOKIE)?.value,
  };
  (request as any).__mvpIdentity = identity;

  return identity;
}

export function applyMvpCookies(response: NextResponse, identity: MvpIdentity) {
  if (identity.shouldSetAnonymousId) {
    response.cookies.set(ANONYMOUS_COOKIE, identity.anonymousId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

  if (identity.shouldSetSessionId) {
    response.cookies.set(SESSION_COOKIE, identity.sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
    });
  }
}

export async function logMvpEvent(
  request: NextRequest,
  eventType: MvpEventType,
  options: MvpEventOptions = {},
) {
  const identity = getMvpIdentity(request);
  const userAgent = getHeader(request, "user-agent");

  try {
    await prisma.$executeRaw`
      INSERT INTO polaroidai_mvp_events (
        event_type,
        anonymous_id,
        session_id,
        ip_address,
        user_agent,
        page_path,
        referer,
        country,
        device_type,
        task_id,
        provider,
        duration_ms,
        is_bot,
        metadata
      )
      VALUES (
        ${eventType},
        ${identity.anonymousId},
        ${identity.sessionId},
        ${getClientIp(request)},
        ${userAgent},
        ${getPagePath(request)},
        ${getHeader(request, "referer")},
        ${getCountry(request)},
        ${getDeviceType(userAgent)},
        ${options.taskId || null},
        ${options.provider || null},
        ${options.durationMs ?? null},
        ${isBotUserAgent(userAgent)},
        ${options.metadata ? JSON.stringify(options.metadata) : null}::jsonb
      )
    `;
  } catch (error) {
    console.error("Failed to log MVP event:", error);
  }

  return identity;
}

async function incrementDailyCounter(ip: string, counter: string) {
  const key = `mvp:daily:${todayKey()}:${ip}:${counter}`;

  if (!hasRedisConfig()) {
    if (isProduction()) {
      throw new Error("Redis is required for production generation limits");
    }

    const next = (localDailyCounts.get(key) || 0) + 1;
    localDailyCounts.set(key, next);
    return next;
  }

  try {
    const next = Number(await (redis as any).incr(key));
    await (redis as any).expire(key, DAY_TTL_SECONDS);
    return next;
  } catch (error) {
    if (isProduction()) {
      throw new Error("Redis is unavailable for production generation limits");
    }

    console.error("Redis counter failed, using local fallback:", error);
    const next = (localDailyCounts.get(key) || 0) + 1;
    localDailyCounts.set(key, next);
    return next;
  }
}

export async function recordAttemptCount(ip: string) {
  return incrementDailyCounter(ip, "attempt_count");
}

export async function recordProviderCallCount(ip: string) {
  return incrementDailyCounter(ip, "provider_call_count");
}

export async function recordSuccessCount(ip: string) {
  return incrementDailyCounter(ip, "success_count");
}

export async function acquireGeneratingLock(ip: string) {
  const key = `mvp:generating:${ip}`;

  if (!hasRedisConfig()) {
    if (isProduction()) {
      throw new Error("Redis is required for production generation locks");
    }

    const now = Date.now();
    const expiresAt = localLocks.get(key) || 0;
    if (expiresAt > now) return false;
    localLocks.set(key, now + GENERATING_LOCK_TTL_SECONDS * 1000);
    return true;
  }

  try {
    const result = await (redis as any).set(key, "1", {
      nx: true,
      ex: GENERATING_LOCK_TTL_SECONDS,
    });
    return Boolean(result);
  } catch (error) {
    if (isProduction()) {
      throw new Error("Redis is unavailable for production generation locks");
    }

    console.error("Redis lock failed, using local fallback:", error);
    const now = Date.now();
    const expiresAt = localLocks.get(key) || 0;
    if (expiresAt > now) return false;
    localLocks.set(key, now + GENERATING_LOCK_TTL_SECONDS * 1000);
    return true;
  }
}

export async function releaseGeneratingLock(ip: string) {
  const key = `mvp:generating:${ip}`;

  if (!hasRedisConfig()) {
    localLocks.delete(key);
    return;
  }

  await (redis as any).del(key).catch(() => {});
}

export async function setTaskStartedAt(taskId: string, startedAt: number) {
  const key = `mvp:task-started:${taskId}`;

  if (!hasRedisConfig()) {
    localTaskStarts.set(key, startedAt);
    return;
  }

  await (redis as any).set(key, String(startedAt), { ex: TERMINAL_TTL_SECONDS });
}

export async function getTaskStartedAt(taskId: string) {
  const key = `mvp:task-started:${taskId}`;

  if (!hasRedisConfig()) {
    return localTaskStarts.get(key) || null;
  }

  const value = await (redis as any).get(key).catch(() => null);
  const startedAt = Number(value);
  return Number.isFinite(startedAt) ? startedAt : null;
}

export async function markTaskTerminal(taskId: string, status: string) {
  const key = `mvp:task-terminal:${taskId}:${status}`;

  if (!hasRedisConfig()) {
    if (localTerminalTasks.has(key)) return false;
    localTerminalTasks.add(key);
    return true;
  }

  const result = await (redis as any)
    .set(key, "1", { nx: true, ex: TERMINAL_TTL_SECONDS })
    .catch(() => null);
  return Boolean(result);
}

export function getFreeProviderCallLimit() {
  return FREE_PROVIDER_CALL_LIMIT;
}
