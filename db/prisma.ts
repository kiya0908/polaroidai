import { PrismaClient } from "@prisma/client";

import "server-only";

declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient;
}

export let prisma: PrismaClient;

// 优化的Prisma客户端配置，限制连接数
const createPrismaClient = () => new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // 限制连接池大小
  __internal: {
    engine: {
      connectionLimit: 5,
    },
  },
});

if (process.env.NODE_ENV === "production") {
  prisma = createPrismaClient();
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = createPrismaClient();
  }
  prisma = global.cachedPrisma;
}
