import { PrismaClient } from "@prisma/client";

import "server-only";

declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient | undefined;
}

// 优化的Prisma客户端配置，限制连接数
const createPrismaClient = () => new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // 限制连接池大小
  // @ts-expect-error - __internal 是未文档化的选项，用于优化连接
  __internal: {
    engine: {
      connectionLimit: 5,
    },
  },
});

// 惰性初始化：只在首次访问时创建 Prisma Client
// 使用 Object.defineProperty 实现真正的惰性初始化
let prismaInstance: PrismaClient | undefined;

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!prismaInstance) {
      prismaInstance = global.cachedPrisma ?? createPrismaClient();
      if (process.env.NODE_ENV !== "production") {
        global.cachedPrisma = prismaInstance;
      }
    }
    const value = (prismaInstance as any)[prop];
    if (typeof value === "function") {
      return value.bind(prismaInstance);
    }
    return value;
  },
});
