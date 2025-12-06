"use client";

import React, { useEffect, useState } from "react";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { WalletIcon } from "lucide-react";

import NumberTicker from "../magicui/number-ticker";
import { isGuestMode } from "@/lib/mvp-config";
import { getGuestCredits } from "@/lib/guest-auth";

export default function UserPoints() {
  const isMVP = isGuestMode();
  const { getToken } = useAuth();
  const [guestCredits, setGuestCredits] = useState(0);

  // MVP模式: 从 localStorage 获取积分
  useEffect(() => {
    if (isMVP) {
      setGuestCredits(getGuestCredits());
      // 监听 storage 变化以实时更新
      const handleStorageChange = () => {
        setGuestCredits(getGuestCredits());
      };
      window.addEventListener('storage', handleStorageChange);
      // 定时刷新以捕获同页面的变化
      const interval = setInterval(() => {
        setGuestCredits(getGuestCredits());
      }, 1000);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        clearInterval(interval);
      };
    }
  }, [isMVP]);

  // 生产模式: 从 API 获取积分
  const { data } = useQuery({
    queryKey: ["queryUserPoints"],
    queryFn: async () => {
      return fetch(`/api/account`, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      }).then((res) => res.json());
    },
    enabled: !isMVP, // 仅在生产模式下启用
  });

  // 根据模式选择积分来源
  const credits = isMVP ? guestCredits : (data?.credit || 0);

  return (
    <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
      <WalletIcon className="h-4 w-4" />
      <NumberTicker value={credits} />
    </div>
  );
}
