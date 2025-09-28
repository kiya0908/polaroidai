import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { env } from "@/env.mjs";

const hasUpstashCreds = Boolean(
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN,
);

// In dev or when env is missing, fall back to a no-op Redis to avoid crashes
type NoopRedis = {
  set: (...args: unknown[]) => Promise<void>;
  get: (...args: unknown[]) => Promise<unknown>;
  del: (...args: unknown[]) => Promise<void>;
};

const createNoopRedis = (): NoopRedis => ({
  async set() {},
  async get() { return null; },
  async del() {},
});

export const redis: Redis | NoopRedis = hasUpstashCreds
  ? new Redis({
      url: env.UPSTASH_REDIS_REST_URL!,
      token: env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : createNoopRedis();

// Create a ratelimiter when credentials exist; otherwise, a permissive mock
export const ratelimit = hasUpstashCreds
  ? new Ratelimit({
      redis: redis as Redis,
      limiter: Ratelimit.slidingWindow(30, "10 s"),
      analytics: true,
    })
  : {
      // Minimal compatible shape
      async limit() {
        return {
          success: true,
          pending: 0,
          limit: 1000,
          reset: new Date(),
        } as const;
      },
    };
