import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Use process.env directly here to keep this module Edge-runtime compatible.
const hasUpstashCreds = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
);

type NoopRedis = {
  set: (...args: unknown[]) => Promise<unknown>;
  get: (...args: unknown[]) => Promise<unknown>;
  del: (...args: unknown[]) => Promise<unknown>;
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
  async set() {
    return null;
  },
  async get() {
    return null;
  },
  async del() {
    return null;
  },
  async scriptLoad() {
    return "mock-script";
  },
  async eval() {
    return null;
  },
  async evalsha() {
    return [1, Date.now() + 10000];
  },
  multi() {
    return {
      exec: async () => [],
      watch: async () => {},
      unwatch: async () => {},
    };
  },
  async sadd() {
    return 1;
  },
  async srem() {
    return 1;
  },
  async sismember() {
    return false;
  },
  async exists() {
    return false;
  },
  async expire() {
    return true;
  },
  pipelines() {
    return { exec: async () => [] };
  },
});

export const redis = (hasUpstashCreds
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : createNoopRedis()) as Redis;

export const ratelimit = hasUpstashCreds
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "10 s"),
      analytics: true,
    })
  : {
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

export function createRatelimit(
  requests: number,
  window: `${number} s` | `${number} m` | `${number} h`,
) {
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
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
  });
}
