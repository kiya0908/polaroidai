import { NextResponse } from "next/server";

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { get } from "@vercel/edge-config";
import createMiddleware from "next-intl/middleware";

import { kvKeys } from "@/config/kv";
import { env } from "@/env.mjs";
import countries from "@/lib/countries.json";
import { getIP } from "@/lib/ip";
import { redis } from "@/lib/redis";

import { defaultLocale, localePrefix, locales } from "./config";

export const config = {
  matcher: [
    "/",
    "/(zh|en)/:path*",
    "/((?!static|.*\\..*|_next).*)",
  ], // Run middleware on API routes],
};
const isProtectedRoute = createRouteMatcher([
  "/:locale/app(.*)",
  "/:locale/admin(.*)",
]);
const isPublicRoute = createRouteMatcher(["/api/webhooks(.*)"]);

const nextIntlMiddleware = createMiddleware({
  defaultLocale,
  locales,
  localePrefix,
});

// MVP 模式: 如果没有 Clerk 配置，使用简化的 middleware
const isMVPMode = !process.env.CLERK_SECRET_KEY;

export default isMVPMode
  ? async function middleware(req) {
      // MVP 简化 middleware: 只处理国际化和基本路由
      const { geo, nextUrl } = req;
      const isApi = nextUrl.pathname.startsWith("/api/");

      // 处理地理位置数据 (可选)
      if (geo && !isApi && env.VERCEL_ENV !== "development" && (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)) {
        const country = geo.country;
        const city = geo.city;
        const countryInfo = countries.find((x) => x.cca2 === country);
        if (countryInfo) {
          const flag = countryInfo.flag;
          try {
            await redis.set(kvKeys.currentVisitor, { country, city, flag });
          } catch (e) {
            // Redis 错误不应阻塞请求
            console.error('Redis error:', e);
          }
        }
      }

      if (isApi) {
        return;
      }

      return nextIntlMiddleware(req);
    }
  : clerkMiddleware(async (auth, req) => {
      // 生产模式: 完整的 Clerk middleware
      const { userId, redirectToSignIn } = auth();

      if (isPublicRoute(req)) {
        return;
      }
      if (isProtectedRoute(req)) {
        if (!userId) {
          return redirectToSignIn();
        }
        auth().protect();
      }
      const { geo, nextUrl } = req;
      const isApi = nextUrl.pathname.startsWith("/api/");
      if (process.env.EDGE_CONFIG && env.VERCEL_ENV !== "development") {
        const blockedIPs = await get<string[]>("blocked_ips");
        const ip = getIP(req);
        console.log("ip-->", ip);

        if (blockedIPs?.includes(ip)) {
          if (isApi) {
            return NextResponse.json(
              { error: "You have been blocked." },
              { status: 403 },
            );
          }

          nextUrl.pathname = "/blocked";
          return NextResponse.rewrite(nextUrl);
        }

        if (nextUrl.pathname === "/blocked") {
          nextUrl.pathname = "/";
          return NextResponse.redirect(nextUrl);
        }
      }

      if (geo && !isApi && env.VERCEL_ENV !== "development" && (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)) {
        console.log("geo-->", geo);
        const country = geo.country;
        const city = geo.city;

        const countryInfo = countries.find((x) => x.cca2 === country);
        if (countryInfo) {
          const flag = countryInfo.flag;
          await redis.set(kvKeys.currentVisitor, { country, city, flag });
        }
      }
      if (isApi) {
        return;
      }

      return nextIntlMiddleware(req);
    });
