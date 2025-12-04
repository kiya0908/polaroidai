'use client';

import { useUser as useGuestUser } from "@/components/mvp/guest-auth-provider";
import { isGuestMode } from "@/lib/mvp-config";

/**
 * Unified auth hook that works in both MVP and production modes
 *
 * In MVP guest mode: Returns guest user data
 * In production mode: Returns Clerk user data (requires separate import)
 *
 * Note: Clerk's useUser is NOT imported here to avoid requiring ClerkProvider in guest mode
 */
export function useAuth() {
  const useGuestAuthMode = isGuestMode();

  if (useGuestAuthMode) {
    // MVP模式：使用游客认证
    return useGuestUser();
  }

  // 生产模式：返回空状态
  // 实际使用时应该从Clerk导入，但为了避免在guest模式下报错，这里返回默认值
  return {
    user: null,
    isLoaded: false,
    isSignedIn: false,
  };
}
