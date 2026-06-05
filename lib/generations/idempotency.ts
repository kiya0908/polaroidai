import { prisma } from "@/db/prisma";
import { redis } from "@/lib/redis";

const GENERATION_LOCK_TTL_SECONDS = 60;
const localLocks = new Map<string, number>();

function isProduction() {
  return (
    process.env.NODE_ENV === "production" || process.env.APP_ENV === "production"
  );
}

function hasRedisConfig() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

function randomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createGenerationRequestId() {
  return `gen_${randomId()}`;
}

export function normalizeRequestId(value: string | null | undefined) {
  const requestId = value?.trim();
  return requestId || createGenerationRequestId();
}

export function getGenerationLockOwner({
  userId,
  anonymousId,
}: {
  userId?: string | null;
  anonymousId: string;
}) {
  return userId ? `user:${userId}` : `anon:${anonymousId}`;
}

function getLockKey(owner: string) {
  return `generation:lock:${owner}`;
}

export async function findGenerationByRequestId(requestId: string) {
  return prisma.polaroidai_PolaroidGeneration.findUnique({
    where: { requestId },
  });
}

export async function acquireGenerationLock(owner: string) {
  const key = getLockKey(owner);

  if (!hasRedisConfig()) {
    if (isProduction()) {
      throw new Error("Redis is required for production generation locks");
    }

    const now = Date.now();
    const expiresAt = localLocks.get(key) || 0;
    if (expiresAt > now) return false;
    localLocks.set(key, now + GENERATION_LOCK_TTL_SECONDS * 1000);
    return true;
  }

  try {
    const result = await (redis as any).set(key, "1", {
      nx: true,
      ex: GENERATION_LOCK_TTL_SECONDS,
    });
    return Boolean(result);
  } catch (error) {
    if (isProduction() || owner.startsWith("anon:")) {
      throw new Error("Redis is unavailable for generation locks");
    }

    console.error("Generation lock failed, using local user fallback:", error);
    const now = Date.now();
    const expiresAt = localLocks.get(key) || 0;
    if (expiresAt > now) return false;
    localLocks.set(key, now + GENERATION_LOCK_TTL_SECONDS * 1000);
    return true;
  }
}

export async function releaseGenerationLock(owner: string) {
  const key = getLockKey(owner);

  if (!hasRedisConfig()) {
    localLocks.delete(key);
    return;
  }

  await (redis as any).del(key).catch(() => {});
}
