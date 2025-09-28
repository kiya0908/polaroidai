"use client";

import { ReactNode, useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [userCredit, setUserCredit] = useState(100); // 模拟数据

  // TODO: 从API获取用户积分
  useEffect(() => {
    // 这里可以添加获取用户积分的逻辑
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <Navbar userCredit={userCredit} />
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* 桌面端侧边栏 */}
        <div className="hidden md:block">
          <DashboardSidebar userCredit={userCredit} />
        </div>
        
        {/* 主内容区域 */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 pb-20 md:pb-6">
            {children}
          </div>
        </main>
      </div>
      
      {/* 移动端底部导航 */}
      <MobileNav />
    </div>
  );
}