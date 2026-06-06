import { PrismaClient } from "@prisma/client";

import "server-only";

declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient | undefined;
}

const createPrismaClient = () => new PrismaClient();

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
