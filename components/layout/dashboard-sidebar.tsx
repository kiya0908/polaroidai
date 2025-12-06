"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Camera,
  History,
  CreditCard,
  Settings,
  BarChart3,
  Download,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { isGuestMode } from "@/lib/mvp-config";
import { getGuestCredits } from "@/lib/guest-auth";

interface SidebarItem {
  href: string;
  label: string;
  iconName: string;
  badge?: string;
  description?: string;
}

const getSidebarIcon = (iconName: string) => {
  switch (iconName) {
    case "Camera":
      return <Camera className="w-5 h-5" />;
    case "History":
      return <History className="w-5 h-5" />;
    case "Download":
      return <Download className="w-5 h-5" />;
    case "BarChart3":
      return <BarChart3 className="w-5 h-5" />;
    case "CreditCard":
      return <CreditCard className="w-5 h-5" />;
    case "Settings":
      return <Settings className="w-5 h-5" />;
    default:
      return <Camera className="w-5 h-5" />;
  }
};

// 获取侧边栏项目（根据MVP模式过滤）
const getSidebarItems = (isMVP: boolean): SidebarItem[] => {
  const items: SidebarItem[] = [
    {
      href: "/app/generate",
      label: "生成宝丽来",
      iconName: "Camera",
      description: "创建新的宝丽来照片",
    },
    {
      href: "/app/history",
      label: "历史记录",
      iconName: "History",
      description: "查看生成历史",
    },
    {
      href: "/app/downloads",
      label: "下载管理",
      iconName: "Download",
      description: "管理下载的图片",
    },
    {
      href: "/app/charts",
      label: "数据统计",
      iconName: "BarChart3",
      description: "查看使用统计",
    },
  ];
  return items;
};

const getAccountItems = (isMVP: boolean): SidebarItem[] => {
  const items: SidebarItem[] = [];

  // MVP模式下隐藏积分充值
  if (!isMVP) {
    items.push({
      href: "/app/order",
      label: "积分充值",
      iconName: "CreditCard",
      description: "购买更多积分",
    });
  }

  items.push({
    href: "/app/settings",
    label: "账户设置",
    iconName: "Settings",
    description: "管理账户信息",
  });

  return items;
};

interface DashboardSidebarProps {
  userCredit?: number;
  className?: string;
  links?: any[]; // 添加links属性以兼容布局文件
}

export function DashboardSidebar({ userCredit = 0, className, links }: DashboardSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const isMVP = isGuestMode();

  // MVP模式下从localStorage获取积分
  const [guestCredits, setGuestCredits] = useState(0);
  useEffect(() => {
    if (isMVP) {
      setGuestCredits(getGuestCredits());
      const interval = setInterval(() => {
        setGuestCredits(getGuestCredits());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isMVP]);

  // 根据模式选择积分来源
  const displayCredits = isMVP ? guestCredits : userCredit;

  // 根据MVP模式获取侧边栏项目
  const sidebarItems = getSidebarItems(isMVP);
  const accountItems = getAccountItems(isMVP);

  const SidebarLink = ({ item }: { item: SidebarItem }) => {
    const isActive = pathname === item.href;
    
    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-polaroid-cream group",
          isActive
            ? "bg-polaroid-orange text-white shadow-sm"
            : "text-gray-700 hover:text-polaroid-brown",
          isCollapsed && "justify-center px-2"
        )}
      >
        <div className={cn(
          "flex-shrink-0",
          isActive ? "text-white" : "text-gray-500 group-hover:text-polaroid-orange"
        )}>
          {getSidebarIcon(item.iconName)}
        </div>
        
        {!isCollapsed && (
          <>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span>{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-2">
                    {item.badge}
                  </Badge>
                )}
              </div>
              {item.description && (
                <p className={cn(
                  "text-xs mt-0.5",
                  isActive ? "text-white/80" : "text-gray-500"
                )}>
                  {item.description}
                </p>
              )}
            </div>
          </>
        )}
      </Link>
    );
  };

  return (
    <div className={cn(
      "flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* 侧边栏头部 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-polaroid-orange rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-polaroid-brown">
                宝丽来AI
              </span>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 p-0"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* 积分显示 */}
      <div className="p-4">
        <div className={cn(
          "bg-gradient-to-r from-polaroid-cream to-polaroid-orange/10 rounded-lg p-3",
          isCollapsed && "p-2"
        )}>
          {isCollapsed ? (
            <div className="text-center">
              <Sparkles className="w-5 h-5 text-polaroid-orange mx-auto" />
              <div className="text-xs font-bold text-polaroid-brown mt-1">
                {displayCredits}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Sparkles className="w-4 h-4 text-polaroid-orange" />
                <span className="text-sm font-medium text-polaroid-brown">
                  当前积分
                </span>
              </div>
              <div className="text-2xl font-bold text-polaroid-brown">
                {displayCredits}
              </div>
              {/* MVP模式下隐藏充值按钮 */}
              {!isMVP && (
                <Button
                  size="sm"
                  className="w-full mt-2 bg-polaroid-orange hover:bg-polaroid-orange/90 text-white"
                  asChild
                >
                  <Link href="/app/order">充值</Link>
                </Button>
              )}
              {isMVP && (
                <p className="text-xs text-muted-foreground mt-2">
                  测试模式积分
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 导航菜单 */}
      <div className="flex-1 px-4 space-y-6">
        {/* 主要功能 */}
        <div>
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              主要功能
            </h3>
          )}
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <SidebarLink key={item.href} item={item} />
            ))}
          </div>
        </div>

        <Separator />

        {/* 账户管理 */}
        <div>
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              账户管理
            </h3>
          )}
          <div className="space-y-1">
            {accountItems.map((item) => (
              <SidebarLink key={item.href} item={item} />
            ))}
          </div>
        </div>
      </div>

      {/* 底部信息 */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            <p>宝丽来AI生成器</p>
            <p className="mt-1">v1.0.0</p>
          </div>
        </div>
      )}
    </div>
  );
}

// MobileSheetSidebar组件 - 移动端侧边栏
interface MobileSheetSidebarProps {
  links?: any[];
}

export function MobileSheetSidebar({ links }: MobileSheetSidebarProps) {
  return (
    <div className="md:hidden">
      {/* 这里可以添加移动端侧边栏的实现 */}
      <Button variant="ghost" size="sm">
        <Menu className="w-5 h-5" />
      </Button>
    </div>
  );
}