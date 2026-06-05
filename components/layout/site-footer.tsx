import * as React from "react";
import Image from "next/image";

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
        "container",
        "w-full px-4 pb-24 pt-10 md:pb-8 md:pt-16",
        className,
      )}
    >
      <div className="portrait-card mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8 text-sm md:px-8">
      <div className="flex flex-col items-center justify-end gap-4 md:flex-row">
        <Link
          href="/terms-of-use"
          className="text-[#08304c]/70 underline-offset-4 hover:text-[#08304c] hover:underline"
          prefetch={false}
          title={t("footer.term")}
        >
          {t("footer.term")}
        </Link>
        <Link
          href="/privacy-policy"
          className="text-[#08304c]/70 underline-offset-4 hover:text-[#08304c] hover:underline"
          prefetch={false}
          title={t("footer.privacy")}
        >
          {t("footer.privacy")}
        </Link>
        <Link
          href="mailto:support@polaroidai.pro"
          className="text-[#08304c]/70 underline-offset-4 hover:text-[#08304c] hover:underline"
          prefetch={false}
          title={t("footer.contact")}
        >
          {t("footer.contact")}
        </Link>
        <ModeToggle />
      </div>
      <div className="flex flex-col items-center justify-between gap-4 border-t border-[#08304c]/10 pt-6 md:flex-row">
        <div className="flex items-center gap-2">
          <Image
            src="/android-chrome-192x192.png"
            alt="PolaroidAI Logo"
            width={24}
            height={24}
            className="rounded"
          />
          <span className="font-heading text-[#08304c]">PolaroidAI.Art Inc.</span>
        </div>
        <div className="flex flex-col items-center gap-4 md:flex-row">
          <Link
            href="https://heic-to-pdf.pro/"
            title="HEIC to PDF Converter"
            className="text-[#08304c]/70 underline-offset-4 hover:text-[#08304c] hover:underline"
            prefetch={false}
            target="_blank"
          >
            HEIC to PDF
          </Link>
          
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-4 border-t border-[#08304c]/10 pt-6 text-sm md:flex-row">
        <p className="text-[#08304c]/60">
          &copy; 2025 polariodaipro.Art. All rights reserved.
        </p>
      </div>
      </div>
    </footer>
  );
}
