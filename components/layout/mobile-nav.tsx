"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, History, CreditCard, Settings, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavItem {
  href: string;
  label: string;
  iconName: string;
}

const getMobileIcon = (iconName: string) => {
  switch (iconName) {
    case "Home":
      return <Home className="w-5 h-5" />;
    case "Camera":
      return <Camera className="w-5 h-5" />;
    case "History":
      return <History className="w-5 h-5" />;
    case "CreditCard":
      return <CreditCard className="w-5 h-5" />;
    case "Settings":
      return <Settings className="w-5 h-5" />;
    default:
      return <Home className="w-5 h-5" />;
  }
};

const mobileNavItems: MobileNavItem[] = [
  {
    href: "/app",
    label: "首页",
    iconName: "Home",
  },
  {
    href: "/app/generate",
    label: "生成",
    iconName: "Camera",
  },
  {
    href: "/app/history",
    label: "历史",
    iconName: "History",
  },
  {
    href: "/app/order",
    label: "充值",
    iconName: "CreditCard",
  },
  {
    href: "/app/settings",
    label: "设置",
    iconName: "Settings",
  },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden">
      <div className="grid grid-cols-5 h-16">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/app" && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                isActive
                  ? "text-polaroid-orange bg-polaroid-orange/5"
                  : "text-gray-600 hover:text-polaroid-orange"
              )}
            >
              <div className={cn(
                "transition-colors",
                isActive ? "text-polaroid-orange" : "text-gray-400"
              )}>
                {getMobileIcon(item.iconName)}
              </div>
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// 导出别名以兼容不同的导入方式
export { MobileNav as NavMobile };