'use client';

/**
 * Unified Authentication Adapter
 *
 * 统一认证适配器 - 支持 MVP 游客模式和生产环境 Clerk 认证的双模式切换
 *
 * 使用方法:
 * - MVP模式: 自动使用 localStorage 游客认证
 * - 生产模式: 自动使用 Clerk 认证
 */

import { useAuth as useClerkAuth, useUser as useClerkUser } from "@clerk/nextjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getGuestCredits,
  deductGuestCredits,
  hasEnoughCredits as guestHasEnough,
  getOrCreateGuestUser,
  type GuestUser
} from "@/lib/guest-auth";
import { isGuestMode, MVP_CONFIG } from "@/lib/mvp-config";

export interface UnifiedUser {
  id: string;
  email: string | null;
  fullName: string | null;
  imageUrl: string | null;
  isGuest: boolean;
}

export interface UnifiedAuthState {
  user: UnifiedUser | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  credits: number;
  isGuest: boolean;
}

/**
 * 统一认证 Hook
 *
 * 根据 MVP_CONFIG 自动选择认证方式:
 * - MVP模式: 使用 localStorage 游客身份
 * - 生产模式: 使用 Clerk 认证
 */
export function useUnifiedAuth(): UnifiedAuthState {
  const isMVP = isGuestMode();

  // Clerk hooks (生产模式使用)
  const clerkAuth = useClerkAuth();
  const clerkUser = useClerkUser();

  // 获取生产模式下的积分
  const { data: prodCredits } = useQuery({
    queryKey: ["userCredits"],
    queryFn: async () => {
      if (isMVP || !clerkAuth.isSignedIn) return 0;
      const token = await clerkAuth.getToken();
      const res = await fetch(`/api/account`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      return data?.credit || 0;
    },
    enabled: !isMVP && clerkAuth.isSignedIn,
  });

  if (isMVP) {
    // MVP模式: 使用游客身份
    const guestUser = typeof window !== 'undefined' ? getOrCreateGuestUser() : null;
    const guestCredits = typeof window !== 'undefined' ? getGuestCredits() : MVP_CONFIG.guest.initialCredits;

    return {
      user: guestUser ? {
        id: guestUser.id,
        email: guestUser.email,
        fullName: guestUser.fullName || 'Guest User',
        imageUrl: guestUser.imageUrl,
        isGuest: true,
      } : null,
      isLoaded: true,
      isSignedIn: true, // MVP模式下始终视为已登录
      credits: guestCredits,
      isGuest: true,
    };
  }

  // 生产模式: 使用 Clerk
  return {
    user: clerkUser.user ? {
      id: clerkUser.user.id,
      email: clerkUser.user.primaryEmailAddress?.emailAddress || null,
      fullName: clerkUser.user.fullName,
      imageUrl: clerkUser.user.imageUrl,
      isGuest: false,
    } : null,
    isLoaded: clerkUser.isLoaded,
    isSignedIn: clerkUser.isSignedIn || false,
    credits: prodCredits || 0,
    isGuest: false,
  };
}

/**
 * 统一积分操作 Hook
 */
export function useUnifiedCredits() {
  const isMVP = isGuestMode();
  const clerkAuth = useClerkAuth();
  const queryClient = useQueryClient();

  /**
   * 检查是否有足够积分
   */
  const hasEnoughCredits = (amount: number): boolean => {
    if (isMVP) {
      return guestHasEnough(amount);
    }
    // 生产模式需要从缓存获取
    const cachedCredits = queryClient.getQueryData<number>(["userCredits"]) || 0;
    return cachedCredits >= amount;
  };

  /**
   * 扣除积分
   */
  const deductCredits = async (amount: number): Promise<boolean> => {
    if (isMVP) {
      const success = deductGuestCredits(amount);
      // 触发重新渲染
      queryClient.invalidateQueries({ queryKey: ["guestCredits"] });
      return success;
    }

    // 生产模式: 调用API扣除积分
    try {
      const token = await clerkAuth.getToken();
      const res = await fetch('/api/credits/deduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });

      if (res.ok) {
        // 刷新积分缓存
        queryClient.invalidateQueries({ queryKey: ["userCredits"] });
        queryClient.invalidateQueries({ queryKey: ["queryUserPoints"] });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to deduct credits:', error);
      return false;
    }
  };

  /**
   * 获取当前积分
   */
  const getCredits = (): number => {
    if (isMVP) {
      return getGuestCredits();
    }
    return queryClient.getQueryData<number>(["userCredits"]) || 0;
  };

  /**
   * 刷新积分
   */
  const refreshCredits = () => {
    if (isMVP) {
      queryClient.invalidateQueries({ queryKey: ["guestCredits"] });
    } else {
      queryClient.invalidateQueries({ queryKey: ["userCredits"] });
      queryClient.invalidateQueries({ queryKey: ["queryUserPoints"] });
    }
  };

  return {
    hasEnoughCredits,
    deductCredits,
    getCredits,
    refreshCredits,
    isMVP,
  };
}

/**
 * 获取认证相关的 Token (仅生产模式)
 */
export function useUnifiedToken() {
  const isMVP = isGuestMode();
  const clerkAuth = useClerkAuth();

  const getToken = async (): Promise<string | null> => {
    if (isMVP) {
      // MVP模式返回 guest token
      return 'guest-token';
    }
    return clerkAuth.getToken();
  };

  return { getToken, isMVP };
}
