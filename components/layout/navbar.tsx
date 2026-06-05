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
    href: "/mvp-simple",
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

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("Navbar");

  // Clerk 璁よ瘉
  const { isSignedIn, user } = useUser();

  const NavLink = ({ item, mobile = false }: { item: NavItem; mobile?: boolean }) => {
    const isActive = pathname === item.href;

    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-[#d6883f] text-[#08304c]"
            : "text-[#08304c]/75 hover:bg-[#d6883f]/10 hover:text-[#08304c]",
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
    <nav className="sticky top-0 z-50 w-full bg-[#f7f7f7]/90 px-3 py-3 backdrop-blur supports-[backdrop-filter]:bg-[#f7f7f7]/75">
      <div className="container mx-auto max-w-7xl">
        <div className="portrait-pill flex h-16 items-center justify-between px-4 sm:px-5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/android-chrome-192x192.png"
              alt={t("brandName")}
              width={32}
              height={32}
              className="rounded-xl"
            />
            <span className="font-heading text-xl text-[#08304c]">
              {t("brandName")}
            </span>
          </Link>

          {/* 妗岄潰绔鑸?*/}
          <div className="hidden md:flex items-center gap-6">
            {isSignedIn && (
              <div className="flex items-center gap-4">
                {navItems.map((item) => (
                  <NavLink key={item.href} item={item} />
                ))}
              </div>
            )}

            {/* 鐢ㄦ埛鑿滃崟 */}
            <div className="flex items-center gap-4">
              {/* 璇█鍒囨崲 */}
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
                  <Button asChild className="portrait-action h-10 min-h-10 px-5">
                    <Link href="/sign-up">{t("signUp")}</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* 绉诲姩绔彍鍗曟寜閽?*/}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="rounded-full text-[#08304c]">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col gap-6 mt-6">
                  {/* 鐢ㄦ埛淇℃伅 */}
                  {isSignedIn && (
                    <div className="flex items-center gap-3 rounded-3xl bg-[#d6883f]/10 p-4">
                      <UserButton
                        appearance={{
                          elements: {
                            avatarBox: "w-10 h-10",
                          },
                        }}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-[#08304c]">
                          {(user as any)?.firstName || (user as any)?.username || t("user")}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 瀵艰埅鑿滃崟 */}
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
                      <Button asChild className="portrait-action w-full">
                        <Link href="/sign-up">{t("signUp")}</Link>
                      </Button>
                    </div>
                  )}

                  {/* 璇█鍒囨崲 - 绉诲姩绔?*/}
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[#08304c]/75">{t("language")}</span>
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

// 瀵煎嚭鍒悕浠ュ吋瀹逛笉鍚岀殑瀵煎叆鏂瑰紡
export { Navbar as NavBar };

// Dashboard layout 浣跨敤鐨勭敤鎴蜂俊鎭粍浠?
export function NavbarUserInfo() {
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
