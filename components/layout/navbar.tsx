"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/lib/navigation";
import { Menu, X, Sparkles, Camera, History, CreditCard, Settings, Home, Info, BookOpen, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { cn } from "@/lib/utils";
import { isFeatureEnabled, isGuestMode } from "@/lib/mvp-config";
import { useAuth } from "@/lib/use-auth";
import { MVPCreditsDisplay } from "@/components/mvp/credits-display";

// 条件导入UserButton组件
import { UserButton as ClerkUserButton } from "@clerk/nextjs";
import { GuestUserButton } from "@/components/mvp/guest-auth-provider";

interface NavItem {
  href: string;
  labelKey: string;
  iconName: string;
  badge?: string;
}

// 公共导航项（所有用户可见）
const publicNavItems: NavItem[] = [
  {
    href: "/",
    labelKey: "home",
    iconName: "Home",
  },
  {
    href: "#features",
    labelKey: "features",
    iconName: "Info",
  },
  {
    href: "#how-it-works",
    labelKey: "howItWorks",
    iconName: "BookOpen",
  },
  {
    href: "#faq",
    labelKey: "faq",
    iconName: "HelpCircle",
  },
];

// 应用功能导航项（仅登录用户可见）
const appNavItems: NavItem[] = [
  {
    href: "/app/generate",
    labelKey: "generate",
    iconName: "Camera",
  },
  {
    href: "/app/history",
    labelKey: "history",
    iconName: "History",
  },
  {
    href: "/app/order",
    labelKey: "credits",
    iconName: "CreditCard",
  },
];

const getNavIcon = (iconName: string) => {
  switch (iconName) {
    case "Home":
      return <Home className="w-4 h-4" />;
    case "Info":
      return <Info className="w-4 h-4" />;
    case "BookOpen":
      return <BookOpen className="w-4 h-4" />;
    case "HelpCircle":
      return <HelpCircle className="w-4 h-4" />;
    case "Camera":
      return <Camera className="w-4 h-4" />;
    case "History":
      return <History className="w-4 h-4" />;
    case "CreditCard":
      return <CreditCard className="w-4 h-4" />;
    default:
      return <Camera className="w-4 h-4" />;
  }
};

interface NavbarProps {
  userCredit?: number;
}

export function Navbar({ userCredit = 0 }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("Navigation");

  // 使用统一的认证hook
  const { isSignedIn, user } = useAuth();
  const useGuestAuthMode = isGuestMode();

  const NavLink = ({ item, mobile = false }: { item: NavItem; mobile?: boolean }) => {
    const isActive = pathname === item.href;
    const isAnchorLink = item.href.startsWith('#');

    const linkProps = {
      className: cn(
        "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
        isActive
          ? "bg-polaroid-orange text-white"
          : "text-gray-700 hover:text-polaroid-orange hover:bg-polaroid-cream",
        mobile && "w-full justify-start"
      ),
      onClick: () => mobile && setIsOpen(false)
    };

    const content = (
      <>
        {getNavIcon(item.iconName)}
        {t(item.labelKey)}
        {item.badge && (
          <Badge variant="secondary" className="ml-auto">
            {item.badge}
          </Badge>
        )}
      </>
    );

    // 对于锚点链接，使用原生 a 标签以确保在当前页面内跳转
    if (isAnchorLink) {
      return (
        <a href={item.href} {...linkProps}>
          {content}
        </a>
      );
    }

    // 对于普通路由，使用 next-intl 的 Link 组件以保持语言环境
    return (
      <Link href={item.href} {...linkProps}>
        {content}
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img src="/favicon-32x32.png" alt="PolaroidAI Logo" className="w-8 h-8" />
            <span className="text-xl font-bold text-polaroid-brown">
              {t("appName")}
            </span>
          </Link>

          {/* 桌面端导航 */}
          <div className="hidden md:flex items-center gap-6">
            {/* 公共导航项 - 所有用户可见 */}
            <div className="flex items-center gap-4">
              {publicNavItems.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </div>

            {/* 应用功能导航项 - 仅登录用户可见 */}
            {isSignedIn && (
              <>
                <div className="flex items-center gap-4">
                  {appNavItems
                    .filter((item) => {
                      // 过滤掉支付充值相关项
                      if (item.labelKey === 'credits' && !isFeatureEnabled('payment')) {
                        return false;
                      }
                      return true;
                    })
                    .map((item) => (
                      <NavLink key={item.href} item={item} />
                    ))}
                </div>

                {/* 积分显示 - MVP模式下不显示 */}
                {isFeatureEnabled('payment') && (
                  <Badge
                    variant="outline"
                    className="border-polaroid-orange text-polaroid-orange px-3 py-1"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    {userCredit} {t("credits")}
                  </Badge>
                )}
              </>
            )}

            {/* 用户菜单 */}
            <div className="flex items-center gap-4">
              {/* 语言切换 */}
              <LocaleSwitcher />

              {/* MVP游客模式：显示积分，隐藏登录按钮 */}
              {useGuestAuthMode ? (
                <div className="flex items-center gap-3">
                  {/* 只显示积分，不显示用户按钮 */}
                  <MVPCreditsDisplay />
                </div>
              ) : (
                // 生产模式：显示Clerk登录
                <>
                  {isSignedIn ? (
                    <ClerkUserButton
                      appearance={{
                        elements: {
                          avatarBox: "w-8 h-8",
                        },
                      }}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" asChild>
                        <Link href="/sign-in">{t("signIn")}</Link>
                      </Button>
                      <Button asChild className="bg-polaroid-orange hover:bg-polaroid-orange/90">
                        <Link href="/sign-up">{t("signUp")}</Link>
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* 移动端菜单按钮 */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col gap-6 mt-6">
                  {/* 用户信息 */}
                  {useGuestAuthMode ? (
                    // MVP游客模式：只显示积分
                    <div className="p-4 bg-polaroid-cream rounded-lg">
                      <MVPCreditsDisplay />
                    </div>
                  ) : (
                    // 生产模式：显示完整用户信息
                    isSignedIn && (
                      <div className="flex items-center gap-3 p-4 bg-polaroid-cream rounded-lg">
                        <ClerkUserButton
                          appearance={{
                            elements: {
                              avatarBox: "w-10 h-10",
                            },
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-polaroid-brown">
                            {user?.firstName || user?.username || user?.fullName || "用户"}
                          </p>
                          {isFeatureEnabled('payment') && (
                            <Badge
                              variant="outline"
                              className="border-polaroid-orange text-polaroid-orange"
                            >
                              <Sparkles className="w-3 h-3 mr-1" />
                              {userCredit} {t("credits")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )
                  )}

                  {/* 导航菜单 */}
                  <div className="space-y-4">
                    {/* 公共导航项 - 所有用户可见 */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-3">
                        {t("navigation")}
                      </h3>
                      {publicNavItems.map((item) => (
                        <NavLink key={item.href} item={item} mobile />
                      ))}
                    </div>

                    {/* 应用功能导航项 - 仅登录用户可见 */}
                    {isSignedIn && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-3">
                          {t("appFeatures")}
                        </h3>
                        {appNavItems.map((item) => (
                          <NavLink key={item.href} item={item} mobile />
                        ))}
                      </div>
                    )}

                    {/* 登录/注册按钮 - 仅未登录用户可见 */}
                    {!isSignedIn && (
                      <div className="space-y-2 pt-4 border-t">
                        <Button variant="ghost" asChild className="w-full justify-start">
                          <Link href="/sign-in">{t("signIn")}</Link>
                        </Button>
                        <Button asChild className="w-full bg-polaroid-orange hover:bg-polaroid-orange/90">
                          <Link href="/sign-up">{t("signUp")}</Link>
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* 语言切换 - 移动端 */}
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{t("language")}</span>
                      <LocaleSwitcher />
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}

// NavbarUserInfo组件 - 用户信息显示
export function NavbarUserInfo() {
  const { isSignedIn } = useAuth();
  const t = useTranslations("Navigation");
  const useGuestAuthMode = isGuestMode();

  // MVP游客模式：只显示积分
  if (useGuestAuthMode) {
    return <MVPCreditsDisplay />;
  }

  // 生产模式：显示登录按钮或用户头像
  if (!isSignedIn) {
    return (
      <Button asChild size="sm">
        <Link href="/sign-in">{t("signIn")}</Link>
      </Button>
    );
  }

  return (
    <ClerkUserButton
      appearance={{
        elements: {
          avatarBox: "w-8 h-8",
        },
      }}
    />
  );
}

// 导出别名以兼容不同的导入方式
export { Navbar as NavBar };