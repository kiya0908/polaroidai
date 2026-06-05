import { ANONYMOUS_FREE_GENERATION_LIMIT } from "@/lib/constants/generation";
import { redis } from "@/lib/redis";

const ANONYMOUS_ALLOWANCE_TTL_SECONDS = 60 * 60 * 24 * 365;
function hasRedisConfig() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

function getAllowanceKey(anonymousId: string) {
  return `generation:anonymous:${anonymousId}:provider_calls`;
}

function toCount(value: unknown) {
  const count = Number(value || 0);
  return Number.isFinite(count) ? count : 0;
}

export async function getAnonymousAllowance(anonymousId: string) {
  const key = getAllowanceKey(anonymousId);

  if (!hasRedisConfig()) {
    throw new Error("Redis is required for anonymous allowance");
  }

  const used = toCount(await (redis as any).get(key));
  return {
    used,
    remaining: Math.max(ANONYMOUS_FREE_GENERATION_LIMIT - used, 0),
    limit: ANONYMOUS_FREE_GENERATION_LIMIT,
  };
}

export async function consumeAnonymousGenerationAllowance(anonymousId: string) {
  const key = getAllowanceKey(anonymousId);

  if (!hasRedisConfig()) {
    throw new Error("Redis is required for anonymous allowance");
  }

  try {
    const next = toCount(await (redis as any).incr(key));
    await (redis as any).expire(key, ANONYMOUS_ALLOWANCE_TTL_SECONDS);

    return {
      allowed: next <= ANONYMOUS_FREE_GENERATION_LIMIT,
      used: next,
      remaining: Math.max(ANONYMOUS_FREE_GENERATION_LIMIT - next, 0),
      limit: ANONYMOUS_FREE_GENERATION_LIMIT,
    };
  } catch {
    throw new Error("Redis is unavailable for anonymous allowance");
  }
}
