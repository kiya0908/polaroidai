import { NextResponse } from "next/server";

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
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
  "/admin(.*)",
]);
const isPublicRoute = createRouteMatcher([
  "/api/webhooks(.*)",
  "/api/generate(.*)",
  "/api/polaroid-generate(.*)",
]);
const isAdminRoute = createRouteMatcher(["/:locale/admin(.*)", "/admin(.*)"]);

const nextIntlMiddleware = createMiddleware({
  defaultLocale,
  locales,
  localePrefix,
});

function checkAdminBasicAuth(req: Request) {
  const password = process.env.ADMIN_PASSWORD;
  const isProd =
    process.env.NODE_ENV === "production" || process.env.APP_ENV === "production";

  if (!password) {
    return isProd
      ? new NextResponse("Admin is not configured", { status: 503 })
      : null;
  }

  const authorization = req.headers.get("authorization");
  if (!authorization?.startsWith("Basic ")) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="PolaroidAI Admin"',
      },
    });
  }

  try {
    const decoded = atob(authorization.slice("Basic ".length));
    const separatorIndex = decoded.indexOf(":");
    const username = decoded.slice(0, separatorIndex);
    const providedPassword = decoded.slice(separatorIndex + 1);

    if (username === "admin" && providedPassword === password) {
      return null;
    }
  } catch {
    // Fall through to 401.
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="PolaroidAI Admin"',
    },
  });
}

const authMiddleware = clerkMiddleware(async (auth, req) => {
  try {
    if (isPublicRoute(req)) {
      return;
    }

    const { userId, redirectToSignIn } = auth();

    if (isAdminRoute(req)) {
      const authResponse = checkAdminBasicAuth(req);
      if (authResponse) return authResponse;
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

    // 动态导入 Edge Config，避免模块加载问题
    if (process.env.EDGE_CONFIG && !isDev) {
      try {
        // 使用动态导入确保 Edge Runtime 兼容性
        const { get } = await import("@vercel/edge-config");
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

export default function middleware(req: any, event: any) {
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  return authMiddleware(req, event);
}
