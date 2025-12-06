"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { Menu, X, Sparkles, Camera, History, CreditCard, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { cn } from "@/lib/utils";
import { isGuestMode } from "@/lib/mvp-config";
import { getGuestCredits, getOrCreateGuestUser } from "@/lib/guest-auth";
import { GuestUserButton } from "@/components/mvp/guest-auth-provider";

interface NavItem {
  href: string;
  label: string;
  iconName: string;
  badge?: string;
}

const navItems: NavItem[] = [
  {
    href: "/app/generate",
    label: "生成宝丽来",
    iconName: "Camera",
  },
  {
    href: "/app/history",
    label: "历史记录",
    iconName: "History",
  },
  {
    href: "/app/order",
    label: "积分充值",
    iconName: "CreditCard",
  },
];

const getNavIcon = (iconName: string) => {
  switch (iconName) {
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
  const isMVP = isGuestMode();

  // Clerk 认证 (生产模式)
  const clerkUser = useUser();

  // MVP模式下的游客积分
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

  // 根据模式选择认证状态
  const isSignedIn = isMVP ? true : clerkUser.isSignedIn;
  const user = isMVP ? getOrCreateGuestUser() : clerkUser.user;
  const displayCredits = isMVP ? guestCredits : userCredit;

  const NavLink = ({ item, mobile = false }: { item: NavItem; mobile?: boolean }) => {
    const isActive = pathname === item.href;
    
    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
          isActive
            ? "bg-polaroid-orange text-white"
            : "text-gray-700 hover:text-polaroid-orange hover:bg-polaroid-cream",
          mobile && "w-full justify-start"
        )}
        onClick={() => mobile && setIsOpen(false)}
      >
        {getNavIcon(item.iconName)}
        {item.label}
        {item.badge && (
          <Badge variant="secondary" className="ml-auto">
            {item.badge}
          </Badge>
        )}
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-polaroid-orange rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-polaroid-brown">
              宝丽来AI
            </span>
          </Link>

          {/* 桌面端导航 */}
          <div className="hidden md:flex items-center gap-6">
            {isSignedIn && (
              <>
                <div className="flex items-center gap-4">
                  {navItems.map((item) => (
                    <NavLink key={item.href} item={item} />
                  ))}
                </div>
                
                {/* 积分显示 */}
                <Badge
                  variant="outline"
                  className="border-polaroid-orange text-polaroid-orange px-3 py-1"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  {displayCredits} 积分
                </Badge>
              </>
            )}

            {/* 用户菜单 */}
            <div className="flex items-center gap-4">
              {/* 语言切换 */}
              <LocaleSwitcher />

              {isSignedIn ? (
                isMVP ? (
                  <GuestUserButton />
                ) : (
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8",
                      },
                    }}
                  />
                )
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" asChild>
                    <Link href="/sign-in">登录</Link>
                  </Button>
                  <Button asChild className="bg-polaroid-orange hover:bg-polaroid-orange/90">
                    <Link href="/sign-up">注册</Link>
                  </Button>
                </div>
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
                  {isSignedIn && (
                    <div className="flex items-center gap-3 p-4 bg-polaroid-cream rounded-lg">
                      {isMVP ? (
                        <div className="w-10 h-10 rounded-full bg-vintage-500 flex items-center justify-center text-white font-semibold">
                          G
                        </div>
                      ) : (
                        <UserButton
                          appearance={{
                            elements: {
                              avatarBox: "w-10 h-10",
                            },
                          }}
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-polaroid-brown">
                          {isMVP ? (user as any)?.fullName || "游客" : (user as any)?.firstName || (user as any)?.username || "用户"}
                        </p>
                        <Badge
                          variant="outline"
                          className="border-polaroid-orange text-polaroid-orange"
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          {displayCredits} 积分
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* 导航菜单 */}
                  {isSignedIn ? (
                    <div className="space-y-2">
                      {navItems.map((item) => (
                        <NavLink key={item.href} item={item} mobile />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button variant="ghost" asChild className="w-full justify-start">
                        <Link href="/sign-in">登录</Link>
                      </Button>
                      <Button asChild className="w-full bg-polaroid-orange hover:bg-polaroid-orange/90">
                        <Link href="/sign-up">注册</Link>
                      </Button>
                    </div>
                  )}

                  {/* 语言切换 - 移动端 */}
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">语言</span>
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
  const isMVP = isGuestMode();
  const clerkUser = useUser();

  // MVP模式下始终显示游客按钮
  if (isMVP) {
    return <GuestUserButton />;
  }

  // 生产模式
  if (!clerkUser.isSignedIn) {
    return (
      <Button asChild size="sm">
        <Link href="/sign-in">登录</Link>
      </Button>
    );
  }

  return (
    <UserButton
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