export type MiddlewareAuthMode =
  | "clerk"
  | "public-fallback"
  | "protected-fallback"
  | "admin-fallback";

type MiddlewareAuthModeInput = {
  hasClerkCredentials: boolean;
  isProtectedRoute: boolean;
  isAdminRoute: boolean;
};

export function hasClerkCredentials(
  env: Record<string, string | undefined> = process.env as Record<
    string,
    string | undefined
  >,
) {
  return Boolean(
    env.CLERK_SECRET_KEY && env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  );
}

export function getMiddlewareAuthMode({
  hasClerkCredentials,
  isProtectedRoute,
  isAdminRoute,
}: MiddlewareAuthModeInput): MiddlewareAuthMode {
  if (hasClerkCredentials) {
    return "clerk";
  }

  if (isAdminRoute) {
    return "admin-fallback";
  }

  if (isProtectedRoute) {
    return "protected-fallback";
  }

  return "public-fallback";
}
