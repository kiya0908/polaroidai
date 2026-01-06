import { NextResponse } from "next/server";

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { get } from "@vercel/edge-config";
import createMiddleware from "next-intl/middleware";

import { kvKeys } from "@/config/kv";
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

export default clerkMiddleware(async (auth, req) => {
  try {
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

    // 使用 process.env 而不是 env 对象，避免 Edge Runtime 兼容性问题
    const isDev = process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "development";

    if (process.env.EDGE_CONFIG && !isDev) {
      try {
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
      } catch (error) {
        console.error("Edge Config error:", error);
        // 忽略 Edge Config 错误，继续执行
      }
    }

    if (geo && !isApi && !isDev && (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)) {
      try {
        console.log("geo-->", geo);
        const country = geo.country;
        const city = geo.city;

        const countryInfo = countries.find((x) => x.cca2 === country);
        if (countryInfo) {
          const flag = countryInfo.flag;
          await redis.set(kvKeys.currentVisitor, { country, city, flag });
        }
      } catch (error) {
        console.error("Redis error:", error);
        // 忽略 Redis 错误，继续执行
      }
    }
    if (isApi) {
      return;
    }

    return nextIntlMiddleware(req);
  } catch (error) {
    console.error("Middleware error:", error);
    // 如果中间件出错，直接放行，避免阻止所有请求
    return nextIntlMiddleware(req);
  }
});
