"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { WalletIcon } from "lucide-react";

import NumberTicker from "../magicui/number-ticker";

export default function UserPoints() {
  const { getToken } = useAuth();
  const [credits, setCredits] = useState(0);

  // 从 API 获取用户积分
  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        
        const res = await fetch("/api/account", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCredits(data.credit || 0);
        }
      } catch (error) {
        console.error("Failed to fetch credits:", error);
      }
    };

    fetchCredits();
    
    // 定时刷新积分
    const interval = setInterval(fetchCredits, 30000);
    return () => clearInterval(interval);
  }, [getToken]);

  return (
    <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
      <WalletIcon className="h-4 w-4" />
      <NumberTicker value={credits} />
    </div>
  );
}
