import { PrismaClient } from "@prisma/client";

import "server-only";

declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient;
}

export let prisma: PrismaClient;

// 优化的Prisma客户端配置，限制连接数
const createPrismaClient = () => {
  // 构建时或没有 DATABASE_URL 时，使用占位符避免初始化失败
  const databaseUrl = process.env.DATABASE_URL || "postgresql://placeholder:placeholder@localhost:5432/placeholder";

  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    // 限制连接池大小
    __internal: {
      engine: {
        connectionLimit: 5,
      },
    },
  });
};

if (process.env.NODE_ENV === "production") {
  prisma = createPrismaClient();
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = createPrismaClient();
  }
  prisma = global.cachedPrisma;
}
