"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { Camera, CreditCard, History, Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { hasClerkPublishableKey } from "@/lib/clerk-runtime";
import { cn } from "@/lib/utils";

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

const publicNavItems: NavItem[] = [
  {
    href: "/mvp-simple",
    labelKey: "generate",
    iconName: "Camera",
  },
  {
    href: "/pricing",
    labelKey: "pricing",
    iconName: "CreditCard",
  },
];

function getNavIcon(iconName: string) {
  switch (iconName) {
    case "Camera":
      return <Camera className="h-4 w-4" />;
    case "History":
      return <History className="h-4 w-4" />;
    case "CreditCard":
      return <CreditCard className="h-4 w-4" />;
    default:
      return <Camera className="h-4 w-4" />;
  }
}

function NavLink({
  item,
  pathname,
  label,
  mobile = false,
  onClick,
}: {
  item: NavItem;
  pathname: string;
  label: string;
  mobile?: boolean;
  onClick?: () => void;
}) {
  const isActive = pathname === item.href;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-[#d6883f] text-[#08304c]"
          : "text-[#08304c]/75 hover:bg-[#d6883f]/10 hover:text-[#08304c]",
        mobile && "w-full justify-start",
      )}
      onClick={onClick}
    >
      {getNavIcon(item.iconName)}
      {label}
      {item.badge && (
        <Badge variant="secondary" className="ml-auto">
          {item.badge}
        </Badge>
      )}
    </Link>
  );
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("Navbar");
  const clerkEnabled = hasClerkPublishableKey();

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#f7f7f7]/90 px-3 py-3 backdrop-blur supports-[backdrop-filter]:bg-[#f7f7f7]/75">
      <div className="container mx-auto max-w-7xl">
        <div className="portrait-pill flex h-16 items-center justify-between px-4 sm:px-5">
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

          {clerkEnabled ? (
            <AuthenticatedNavbar
              isOpen={isOpen}
              pathname={pathname}
              setIsOpen={setIsOpen}
            />
          ) : (
            <PublicNavbar
              isOpen={isOpen}
              pathname={pathname}
              setIsOpen={setIsOpen}
            />
          )}
        </div>
      </div>
    </nav>
  );
}

function AuthenticatedNavbar({
  isOpen,
  pathname,
  setIsOpen,
}: {
  isOpen: boolean;
  pathname: string;
  setIsOpen: (open: boolean) => void;
}) {
  const t = useTranslations("Navbar");
  const { isSignedIn, user } = useUser();

  return (
    <>
      <div className="hidden items-center gap-6 md:flex">
        {isSignedIn && (
          <div className="flex items-center gap-4">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                pathname={pathname}
                label={t(item.labelKey)}
              />
            ))}
          </div>
        )}

        <div className="flex items-center gap-4">
          <LocaleSwitcher />

          {isSignedIn ? (
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8",
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

      <div className="md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="rounded-full text-[#08304c]">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <div className="mt-6 flex flex-col gap-6">
              {isSignedIn && (
                <div className="flex items-center gap-3 rounded-3xl bg-[#d6883f]/10 p-4">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "h-10 w-10",
                      },
                    }}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-[#08304c]">
                      {(user as { firstName?: string; username?: string } | null)
                        ?.firstName ||
                        (user as { firstName?: string; username?: string } | null)
                          ?.username ||
                        t("user")}
                    </p>
                  </div>
                </div>
              )}

              {isSignedIn ? (
                <div className="space-y-2">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.href}
                      item={item}
                      pathname={pathname}
                      label={t(item.labelKey)}
                      mobile
                      onClick={() => setIsOpen(false)}
                    />
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

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#08304c]/75">
                    {t("language")}
                  </span>
                  <LocaleSwitcher />
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

function PublicNavbar({
  isOpen,
  pathname,
  setIsOpen,
}: {
  isOpen: boolean;
  pathname: string;
  setIsOpen: (open: boolean) => void;
}) {
  const t = useTranslations("Navbar");

  return (
    <>
      <div className="hidden items-center gap-4 md:flex">
        <div className="flex items-center gap-3">
          {publicNavItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              pathname={pathname}
              label={t(item.labelKey)}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <Button asChild className="portrait-action h-10 min-h-10 px-5">
            <Link href="/mvp-simple">{t("generate")}</Link>
          </Button>
        </div>
      </div>

      <div className="md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="rounded-full text-[#08304c]">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <div className="mt-6 flex flex-col gap-6">
              <div className="space-y-2">
                {publicNavItems.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    label={t(item.labelKey)}
                    mobile
                    onClick={() => setIsOpen(false)}
                  />
                ))}
              </div>

              <Button asChild className="portrait-action w-full">
                <Link href="/mvp-simple">{t("generate")}</Link>
              </Button>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#08304c]/75">
                    {t("language")}
                  </span>
                  <LocaleSwitcher />
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

export { Navbar as NavBar };

export function NavbarUserInfo() {
  if (!hasClerkPublishableKey()) {
    return null;
  }

  return (
    <UserButton
      appearance={{
        elements: {
          avatarBox: "h-8 w-8",
        },
      }}
    />
  );
}
