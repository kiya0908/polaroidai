import { NextResponse } from "next/server";

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";

import { kvKeys } from "@/config/kv";
import { getMiddlewareAuthMode, hasClerkCredentials } from "@/lib/clerk-runtime";
import countries from "@/lib/countries.json";
import { getIP } from "@/lib/ip";
import { redis } from "@/lib/redis";

import { defaultLocale, localePrefix, locales } from "./config";

export const config = {
  matcher: [
    "/",
    "/(zh|en)/:path*",
    "/((?!static|.*\\..*|_next).*)",
  ],
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
const clerkConfigured = hasClerkCredentials();

const nextIntlMiddleware = createMiddleware({
  defaultLocale,
  locales,
  localePrefix,
});

function checkAdminBasicAuth(req: Request) {
  const password = process.env.ADMIN_PASSWORD;
  const isProd =
    process.env.NODE_ENV === "production" ||
    process.env.APP_ENV === "production";

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

function getAuthUnavailableResponse(req: any, message: string) {
  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: message }, { status: 503 });
  }

  return new NextResponse(message, { status: 503 });
}

async function runSharedMiddleware(req: any) {
  try {
    const { geo, nextUrl } = req;
    const isApi = nextUrl.pathname.startsWith("/api/");
    const isDev =
      process.env.NODE_ENV === "development" ||
      process.env.VERCEL_ENV === "development";

    if (process.env.EDGE_CONFIG && !isDev) {
      try {
        const { get } = await import("@vercel/edge-config");
        const blockedIPs = await get<string[]>("blocked_ips");
        const ip = getIP(req);

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
      }
    }

    if (
      geo &&
      !isApi &&
      !isDev &&
      process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN
    ) {
      try {
        const country = geo.country;
        const city = geo.city;
        const countryInfo = countries.find((item) => item.cca2 === country);

        if (countryInfo) {
          await redis.set(kvKeys.currentVisitor, {
            country,
            city,
            flag: countryInfo.flag,
          });
        }
      } catch (error) {
        console.error("Redis error:", error);
      }
    }

    if (isApi) {
      return NextResponse.next();
    }

    return nextIntlMiddleware(req);
  } catch (error) {
    console.error("Middleware error:", error);
    return nextIntlMiddleware(req);
  }
}

const authMiddleware = clerkConfigured
  ? clerkMiddleware(async (auth, req) => {
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

      return runSharedMiddleware(req);
    })
  : null;

function handleMissingClerk(req: any) {
  const authMode = getMiddlewareAuthMode({
    hasClerkCredentials: clerkConfigured,
    isProtectedRoute: isProtectedRoute(req),
    isAdminRoute: isAdminRoute(req),
  });

  if (authMode === "public-fallback") {
    return runSharedMiddleware(req);
  }

  if (authMode === "admin-fallback") {
    const authResponse = checkAdminBasicAuth(req);
    if (authResponse) return authResponse;

    return getAuthUnavailableResponse(
      req,
      "Admin requires Clerk configuration.",
    );
  }

  return getAuthUnavailableResponse(
    req,
    "Authentication is not configured for this deployment.",
  );
}

export default function middleware(req: any, event: any) {
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  if (!authMiddleware) {
    return handleMissingClerk(req);
  }

  return authMiddleware(req, event);
}
