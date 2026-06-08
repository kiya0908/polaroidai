import { unstable_setRequestLocale } from "next-intl/server";

import UserPoints from "@/components/dashboard/points";
import { SearchCommand } from "@/components/dashboard/search-command";
import {
  DashboardSidebar,
  MobileSheetSidebar,
} from "@/components/layout/dashboard-sidebar";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { NavbarUserInfo } from "@/components/layout/navbar";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { Button } from "@/components/ui/button";
import { dashboardConfig } from "@/config/dashboard";
import { hasClerkPublishableKey } from "@/lib/clerk-runtime";
import { Link } from "@/lib/navigation";

interface DashboardLayoutProps {
  children?: React.ReactNode;
  params: { locale: string };
}

export default function DashboardLayout({
  children,
  params: { locale },
}: DashboardLayoutProps) {
  unstable_setRequestLocale(locale);

  if (!hasClerkPublishableKey()) {
    return (
      <MaxWidthWrapper className="flex min-h-screen items-center justify-center">
        <div className="mx-auto max-w-xl space-y-4 text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Authentication unavailable
          </p>
          <h1 className="text-3xl font-bold text-polaroid-brown">
            Dashboard is temporarily disabled
          </h1>
          <p className="text-muted-foreground">
            Clerk is not configured for this deployment, so protected account
            pages are unavailable. Public generation still works.
          </p>
          <Button
            asChild
            className="bg-polaroid-orange hover:bg-polaroid-orange/90"
          >
            <Link href="/mvp-simple">Go to public generator</Link>
          </Button>
        </div>
      </MaxWidthWrapper>
    );
  }

  const links = dashboardConfig.sidebarNav;

  return (
    <MaxWidthWrapper className="max-w-[1650px] px-0">
      <div className="relative flex min-h-screen w-full">
        <DashboardSidebar links={links} />

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-50 flex h-14 items-center gap-3 bg-background px-4 lg:h-[60px] xl:px-10">
            <MobileSheetSidebar links={links} />

            <div className="w-full flex-1">
              <div className="hidden md:block">
                <SearchCommand links={links} />
              </div>
            </div>

            <UserPoints />
            <ModeToggle />
            <NavbarUserInfo />
          </header>

          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 xl:px-10">
            {children}
          </main>
        </div>
      </div>
    </MaxWidthWrapper>
  );
}
