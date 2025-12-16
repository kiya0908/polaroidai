"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { Menu, Sparkles, Camera, History, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface NavItem {
  href: string;
  labelKey: string;
  iconName: string;
  badge?: string;
}

const navItems: NavItem[] = [
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
    labelKey: "recharge",
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
  // 移除了 userCredit 参数，因为不再在 navbar 中显示积分
}

export function Navbar({}: NavbarProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("Navbar");

  // Clerk 认证
  const { isSignedIn, user } = useUser();

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
        {t(item.labelKey)}
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
            <Image
              src="/android-chrome-192x192.png"
              alt={t("brandName")}
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="text-xl font-bold text-polaroid-brown">
              {t("brandName")}
            </span>
          </Link>

          {/* 桌面端导航 */}
          <div className="hidden md:flex items-center gap-6">
            {isSignedIn && (
              <div className="flex items-center gap-4">
                {navItems.map((item) => (
                  <NavLink key={item.href} item={item} />
                ))}
              </div>
            )}

            {/* 用户菜单 */}
            <div className="flex items-center gap-4">
              {/* 语言切换 */}
              <LocaleSwitcher />

              {isSignedIn ? (
                <UserButton
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
                      <UserButton
                        appearance={{
                          elements: {
                            avatarBox: "w-10 h-10",
                          },
                        }}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-polaroid-brown">
                          {(user as any)?.firstName || (user as any)?.username || t("user")}
                        </p>
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
                        <Link href="/sign-in">{t("signIn")}</Link>
                      </Button>
                      <Button asChild className="w-full bg-polaroid-orange hover:bg-polaroid-orange/90">
                        <Link href="/sign-up">{t("signUp")}</Link>
                      </Button>
                    </div>
                  )}

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

// 导出别名以兼容不同的导入方式
export { Navbar as NavBar };