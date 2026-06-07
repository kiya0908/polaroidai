import assert from "node:assert/strict";
import test from "node:test";

const {
  getMiddlewareAuthMode,
  hasClerkCredentials,
  hasClerkPublishableKey,
} = await import(new URL("./clerk-runtime.ts", import.meta.url).href);

test("allows public routes to continue when Clerk credentials are missing", () => {
  assert.equal(
    getMiddlewareAuthMode({
      hasClerkCredentials: false,
      isProtectedRoute: false,
      isAdminRoute: false,
    }),
    "public-fallback",
  );
});

test("blocks protected routes when Clerk credentials are missing", () => {
  assert.equal(
    getMiddlewareAuthMode({
      hasClerkCredentials: false,
      isProtectedRoute: true,
      isAdminRoute: false,
    }),
    "protected-fallback",
  );
});

test("prioritizes admin fallback when admin routes are missing Clerk credentials", () => {
  assert.equal(
    getMiddlewareAuthMode({
      hasClerkCredentials: false,
      isProtectedRoute: true,
      isAdminRoute: true,
    }),
    "admin-fallback",
  );
});

test("uses Clerk middleware when both keys are configured", () => {
  assert.equal(
    getMiddlewareAuthMode({
      hasClerkCredentials: true,
      isProtectedRoute: true,
      isAdminRoute: true,
    }),
    "clerk",
  );
});

test("requires both publishable and secret keys for Clerk middleware", () => {
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

test("only needs the publishable key for public app tree checks", () => {
  assert.equal(
    hasClerkPublishableKey({
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_xxx",
    }),
    true,
  );

  assert.equal(
    hasClerkPublishableKey({
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "",
    }),
    false,
  );
});
