import test from "node:test";
import assert from "node:assert/strict";

import { getMiddlewareAuthMode, hasClerkCredentials } from "./clerk-runtime.ts";

test("在缺少 Clerk 配置时允许公开页面继续访问", () => {
  assert.equal(
    getMiddlewareAuthMode({
      hasClerkCredentials: false,
      isProtectedRoute: false,
      isAdminRoute: false,
    }),
    "public-fallback",
  );
});

test("在缺少 Clerk 配置时阻止受保护页面继续走 Clerk", () => {
  assert.equal(
    getMiddlewareAuthMode({
      hasClerkCredentials: false,
      isProtectedRoute: true,
      isAdminRoute: false,
    }),
    "protected-fallback",
  );
});

test("在缺少 Clerk 配置时优先按管理后台处理", () => {
  assert.equal(
    getMiddlewareAuthMode({
      hasClerkCredentials: false,
      isProtectedRoute: true,
      isAdminRoute: true,
    }),
    "admin-fallback",
  );
});

test("在 Clerk 配置完整时走 Clerk 中间件", () => {
  assert.equal(
    getMiddlewareAuthMode({
      hasClerkCredentials: true,
      isProtectedRoute: true,
      isAdminRoute: true,
    }),
    "clerk",
  );
});

test("只有在 publishable key 和 secret key 都存在时才启用 Clerk", () => {
  assert.equal(
    hasClerkCredentials({
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_xxx",
      CLERK_SECRET_KEY: "sk_test_xxx",
    }),
    true,
  );

  assert.equal(
    hasClerkCredentials({
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_xxx",
      CLERK_SECRET_KEY: "",
    }),
    false,
  );
});
