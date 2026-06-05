"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@clerk/nextjs";
import {
  Camera,
  History,
  CreditCard,
  BarChart3,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface SidebarItem {
  href: string;
  labelKey: string;
  descriptionKey: string;
  iconName: string;
  badge?: string;
}

const getSidebarIcon = (iconName: string) => {
  switch (iconName) {
    case "Camera":
      return <Camera className="w-5 h-5" />;
    case "History":
      return <History className="w-5 h-5" />;
    case "BarChart3":
      return <BarChart3 className="w-5 h-5" />;
    case "CreditCard":
      return <CreditCard className="w-5 h-5" />;
    default:
      return <Camera className="w-5 h-5" />;
  }
};

// 获取侧边栏项目
const getSidebarItems = (): SidebarItem[] => {
  const items: SidebarItem[] = [
    {
      href: "/mvp-simple",
      labelKey: "items.generate.label",
      descriptionKey: "items.generate.description",
      iconName: "Camera",
    },
    {
      href: "/app/history",
      labelKey: "items.history.label",
      descriptionKey: "items.history.description",
      iconName: "History",
    },
    {
      href: "/app/charts",
      labelKey: "items.charts.label",
      descriptionKey: "items.charts.description",
      iconName: "BarChart3",
    },
  ];
  return items;
};

const getAccountItems = (): SidebarItem[] => {
  return [
    {
      href: "/app/order",
      labelKey: "items.order.label",
      descriptionKey: "items.order.description",
      iconName: "CreditCard",
    },
  ];
};

interface DashboardSidebarProps {
  className?: string;
  links?: any[];
}

export function DashboardSidebar({ className, links }: DashboardSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [credits, setCredits] = useState(0);
  const pathname = usePathname();
  const t = useTranslations("Sidebar");
  const { getToken } = useAuth();
  
  // 从 API 获取用户积分
  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const token = await getToken();
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
  }, [getToken]);

  // 获取侧边栏项目
  const sidebarItems = getSidebarItems();
  const accountItems = getAccountItems();

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
                <span>{t(item.labelKey)}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-2">
                    {item.badge}
                  </Badge>
                )}
              </div>
              <p className={cn(
                "text-xs mt-0.5",
                isActive ? "text-white/80" : "text-gray-500"
              )}>
                {t(item.descriptionKey)}
              </p>
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
                {t("brand")}
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
                {credits}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Sparkles className="w-4 h-4 text-polaroid-orange" />
                <span className="text-sm font-medium text-polaroid-brown">
                  {t("credits.title")}
                </span>
              </div>
              <div className="text-2xl font-bold text-polaroid-brown">
                {credits}
              </div>
              <Button
                size="sm"
                className="w-full mt-2 bg-polaroid-orange hover:bg-polaroid-orange/90 text-white"
                asChild
              >
                <Link href="/app/order">{t("credits.recharge")}</Link>
              </Button>
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
              {t("sections.main")}
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
              {t("sections.account")}
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
            <p>{t("footer.title")}</p>
            <p className="mt-1">{t("footer.version")}</p>
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
