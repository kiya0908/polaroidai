import * as React from "react";

import { getTranslations } from "next-intl/server";

import { ModeToggle } from "@/components/layout/mode-toggle";
import { Link } from "@/lib/navigation";
import { cn } from "@/lib/utils";

import NewsletterForm from "../forms/newsletter-form";
import { Icons } from "../shared/icons";

export async function SiteFooter({ className }: React.HTMLAttributes<HTMLElement>) {
  const t = await getTranslations("PageLayout");
  return (
    <footer
      className={cn(
        "container border-t",
        "w-full p-6 pb-4 md:py-12",
        className,
      )}
    >
      <div className="flex max-w-7xl flex-col items-center justify-end gap-4 text-sm md:flex-row">
        <Link
          href="/terms-of-use"
          className="underline-offset-4 hover:underline"
          prefetch={false}
          title={t("footer.term")}
        >
          {t("footer.term")}
        </Link>
        <Link
          href="/privacy-policy"
          className="underline-offset-4 hover:underline"
          prefetch={false}
          title={t("footer.privacy")}
        >
          {t("footer.privacy")}
        </Link>
        <Link
          href="mailto:support@polaroidai.pro"
          className="underline-offset-4 hover:underline"
          prefetch={false}
          title={t("footer.contact")}
        >
          {t("footer.contact")}
        </Link>
        <ModeToggle />
      </div>
      <div className="mt-4 flex max-w-7xl flex-col items-center justify-between gap-4 text-sm md:flex-row">
        <div className="flex items-center gap-2">
          <img src="/favicon-32x32.png" alt="PolaroidAI Logo" className="h-6 w-6" />
          <span className="font-medium">PolaroidAI.Art Inc.</span>
        </div>
        <div className="flex flex-col items-center gap-4 md:flex-row">
          <Link
            href="https://heic-to-pdf.pro/"
            title="HEIC to PDF Converter"
            className="underline-offset-4 hover:underline"
            prefetch={false}
            target="_blank"
          >
            HEIC to PDF
          </Link>
          
        </div>
      </div>
      <div className="mt-4 flex max-w-7xl flex-col items-center justify-center gap-4 text-sm md:flex-row">
        <p className="text-muted-foreground">
          &copy; 2025 polariodaipro.Art. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
