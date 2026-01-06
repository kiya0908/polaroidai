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
  scriptLoad: (...args: unknown[]) => Promise<string>;
  eval: (...args: unknown[]) => Promise<unknown>;
  evalsha: (...args: unknown[]) => Promise<unknown>;
  multi: () => any;
  sadd: (...args: unknown[]) => Promise<number>;
  srem: (...args: unknown[]) => Promise<number>;
  sismember: (...args: unknown[]) => Promise<boolean>;
  exists: (...args: unknown[]) => Promise<boolean>;
  expire: (...args: unknown[]) => Promise<boolean>;
  pipelines: () => any;
};

const createNoopRedis = (): NoopRedis => ({
  async set() {},
  async get() { return null; },
  async del() {},
  async scriptLoad() { return "mock-script"; },
  async eval() { return null; },
  async evalsha() { return [1, Date.now() + 10000]; }, // Mock response for ratelimit
  multi() { return { exec: async () => [], watch: async () => {}, unwatch: async () => {} }; },
  async sadd() { return 1; },
  async srem() { return 1; },
  async sismember() { return false; },
  async exists() { return false; },
  async expire() { return true; },
  pipelines() { return { exec: async () => [] }; },
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
          pending: Promise.resolve(),
          limit: 1000,
          reset: Date.now() + 10000,
          remaining: 1000,
        } as const;
      },
    };

// Factory function to create custom ratelimiter with fallback
export function createRatelimit(requests: number, window: `${number} s` | `${number} m` | `${number} h`) {
  if (!hasUpstashCreds) {
    return {
      async limit() {
        return {
          success: true,
          pending: Promise.resolve(),
          limit: requests,
          reset: Date.now() + 10000,
          remaining: requests,
        } as const;
      },
    };
  }
  return new Ratelimit({
    redis: redis as Redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
  });
}
