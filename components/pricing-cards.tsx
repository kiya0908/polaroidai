"use client";

import { cloneElement, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { useReward } from "react-rewards";

import { CreemBillingButton } from "@/components/forms/creem-billing-button";
import { HeaderSection } from "@/components/shared/header-section";
import { Icons } from "@/components/shared/icons";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import SignBox from "@/components/sign-box";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ChargeProductSelectDto } from "@/db/type";
import { useMediaQuery } from "@/hooks/use-media-query";
import { url } from "@/lib";
import { usePathname } from "@/lib/navigation";
import { cn, formatPrice } from "@/lib/utils";

interface PricingCardsProps {
  userId?: string;
  locale?: string;
  chargeProduct?: ChargeProductSelectDto[];
}

const PricingCard = ({
  userId,
  offer,
}: {
  userId?: string;
  offer: ChargeProductSelectDto;
}) => {
  const pathname = usePathname();
  const t = useTranslations("PricingPage");

  return (
    <div
      className={cn(
        "portrait-card relative flex flex-col overflow-hidden",
        offer.isPopular ? "-m-0.5 ring-2 ring-[#d6883f]" : "",
      )}
      key={offer.title}
    >
      <div className="min-h-[150px] items-start space-y-4 bg-[#f7f7f7] p-6">
        <p className="flex font-satoshi text-sm font-bold uppercase tracking-wider text-[#08304c]/55">
          {offer.title}
        </p>

        <div className="flex flex-row">
          <div className="flex items-end">
            <div className="flex text-left font-heading text-3xl font-medium leading-6 text-[#08304c]">
              {offer.originalAmount && offer.originalAmount > 0 ? (
                <>
                  <span className="mr-2 text-base text-[#08304c]/45 line-through">
                    {formatPrice(offer.originalAmount, "$")}
                  </span>
                  <span>{formatPrice(offer.amount, "$")}</span>
                </>
              ) : (
                `${formatPrice(offer.amount, "$")}`
              )}
            </div>
            <div className="-mb-1 ml-2 text-left text-sm font-medium text-[#08304c]/60">
              <div>
                {offer.credit} {t("worth")}
              </div>
            </div>
          </div>
        </div>
        <div className="text-left text-sm text-[#08304c]/60">
          <div>{t("description")}</div>
        </div>
      </div>

      <div className="flex h-full flex-col justify-between gap-16 p-6">
        <ul className="space-y-2 text-left text-sm font-medium leading-normal">
          {offer.message &&
            offer.message.split(",")?.map((feature) => (
              <li className="flex items-start gap-x-3" key={feature}>
                <Icons.check className="size-5 shrink-0 text-[#d6883f]" />
                <p>{feature}</p>
              </li>
            ))}

          {/* {offer.limitations.length > 0 &&
            offer.limitations.map((feature) => (
              <li
                className="flex items-start text-muted-foreground"
                key={feature}
              >
                <Icons.close className="mr-3 size-5 shrink-0" />
                <p>{feature}</p>
              </li>
            ))} */}
        </ul>
        <SignedIn>
          <CreemBillingButton offer={offer} btnText={t("action.buy")} />
        </SignedIn>

        <SignedOut>
          <div className="flex justify-center">
            <SignInButton mode="modal" forceRedirectUrl={url(pathname).href}>
              <Button
                variant={offer.isPopular ? "default" : "outline"}
                className={cn(
                  "w-full",
                  offer.isPopular ? "portrait-action" : "portrait-outline-action",
                )}
                // onClick={() => setShowSignInModal(true)}
              >
                {t("action.signin")}
              </Button>
            </SignInButton>
          </div>
        </SignedOut>
      </div>
    </div>
  );
};

export function FreeCard() {
  const t = useTranslations("PricingPage");

  return (
    <div
      className={cn(
        "portrait-card relative col-span-3 flex flex-col overflow-hidden lg:col-span-3",
      )}
    >
      <div className="min-h-[150px] items-start space-y-4 bg-[#f7f7f7] p-6">
        <p className="flex font-satoshi text-sm font-bold uppercase tracking-wider text-[#08304c]/55">
          Free
        </p>

        <div className="flex flex-row">
          <div className="flex items-end">
            <div className="flex text-left font-heading text-3xl font-medium leading-6 text-[#08304c]">
              {`${formatPrice(0, "$")}`}
            </div>
            <div className="-mb-1 ml-2 text-left text-sm font-medium text-[#08304c]/60">
              <div>5 {t("worth")}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-full flex-col justify-between gap-16 p-6">
        <ul className="space-y-2 text-left text-sm font-medium leading-normal">
          {["Limited models", "Max 5/month Flux.1 Schnell Images"]?.map(
            (feature) => (
              <li className="flex items-start gap-x-3" key={feature}>
                <Icons.check className="size-5 shrink-0 text-[#d6883f]" />
                <p>{feature}</p>
              </li>
            ),
          )}

          {["Private Generations", "Commercial License"].map((feature) => (
            <li
              className="flex items-start text-[#08304c]/45"
              key={feature}
            >
              <Icons.close className="mr-3 size-5 shrink-0" />
              <p>{feature}</p>
            </li>
          ))}
        </ul>
        <SignBox>
          <Button className="portrait-action">Try Out</Button>
        </SignBox>
      </div>
    </div>
  );
}
export function PricingCards({
  userId,
  chargeProduct,
  locale,
}: PricingCardsProps) {
  const t = useTranslations("PricingPage");
  const isYearlyDefault = false;
  const [isYearly, setIsYearly] = useState<boolean>(!!isYearlyDefault);
  const searchParams = useSearchParams();

  const toggleBilling = () => {
    setIsYearly(!isYearly);
  };

  const { reward } = useReward("order-success", "confetti", {
    position: "fixed",
    elementCount: 360,
    spread: 80,
    elementSize: 8,
    lifetime: 400,
  });

  useEffect(() => {
    if (!searchParams.size) {
      return;
    }
    if (searchParams.get("success") === "true") {
      setTimeout(() => {
        reward();
      }, 1000);
    } else if (searchParams.get("success") === "false") {
      console.log("鏀粯澶辫触");
    }
  }, [searchParams]);

  return (
    <MaxWidthWrapper>
      <section className="flex flex-col items-center text-center">
        <HeaderSection label={t("label")} title={t("title")} />
        <div className="mt-4">
          <p className="portrait-pill mb-7 inline-flex items-center justify-between px-4 py-2 text-sm">
            <span className="text-sm font-medium">
              {t("tip.title")}&nbsp;(
              {t("tip.subtitle")}&nbsp;
              <a
                href="mailto:support@polaroidai.pro"
                className="font-semibold text-[#08304c] underline decoration-[#d6883f]"
              >
                {t("tip.contact")}
              </a>
              &nbsp;)
            </span>
          </p>
        </div>
        {/* <div className="mb-4 mt-10 flex items-center gap-5">
          <ToggleGroup
            type="single"
            size="sm"
            defaultValue={isYearly ? "yearly" : "monthly"}
            onValueChange={toggleBilling}
            aria-label="toggle-year"
            className="h-9 overflow-hidden rounded-full border bg-background p-1 *:h-7 *:text-muted-foreground"
          >
            <ToggleGroupItem
              value="yearly"
              className="rounded-full px-5 data-[state=on]:!bg-primary data-[state=on]:!text-primary-foreground"
              aria-label="Toggle yearly billing"
            >
              Yearly (-20%)
            </ToggleGroupItem>
            <ToggleGroupItem
              value="monthly"
              className="rounded-full px-5 data-[state=on]:!bg-primary data-[state=on]:!text-primary-foreground"
              aria-label="Toggle monthly billing"
            >
              Monthly
            </ToggleGroupItem>
          </ToggleGroup>
        </div> */}

        <div className="w-full overflow-x-auto pb-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40">
          <div 
            className="flex gap-5 bg-inherit py-5 md:grid md:justify-center"
            style={{ 
              // 鍔ㄦ€佽缃甮rid鍒楁暟锛氭渶澶?鍒楋紝瓒呰繃3涓骇鍝佹椂浣跨敤婊氬姩
              gridTemplateColumns: `repeat(${Math.min(chargeProduct?.length || 3, 3)}, minmax(280px, 1fr))`,
            }}
          >
            {chargeProduct?.map((offer) => (
              <div key={offer.id} className="min-w-[280px] flex-shrink-0 md:min-w-0 md:flex-shrink">
                <PricingCard offer={offer} />
              </div>
            ))}
          </div>
        </div>

        <p className="mt-3 text-balance text-center text-base text-[#08304c]/60">
          {t("contact.title")}
          <br />
          <a
            className="font-medium text-[#08304c] hover:underline"
            href="mailto:support@polaroidai.pro"
          >
            support@polaroidai.pro
          </a>{" "}
          {t("contact.description")}
          <br />
          {/* <strong>
            You can test the subscriptions and won&apos;t be charged.
          </strong> */}
        </p>
      </section>
      <div
        className="pointer-events-none fixed bottom-10 left-[50%] translate-x-[-50%]"
        id="order-success"
      />
    </MaxWidthWrapper>
  );
}

export function PricingCardDialog({
  onClose,
  isOpen,
  chargeProduct,
}: {
  isOpen: boolean;
  chargeProduct?: ChargeProductSelectDto[];
  onClose: (isOpen: boolean) => void;
}) {
  const t = useTranslations("PricingPage");
  const { isSm, isMobile } = useMediaQuery();
  
  // 绉诲姩绔彧鏄剧ず鏈€鍙楁杩庣殑浜у搧锛屽鏋滄病鏈夊垯鏄剧ず绗竴涓?
  const product = useMemo(() => {
    if (isSm || isMobile) {
      const popularProduct = chargeProduct?.find(p => p.isPopular);
      if (popularProduct) {
        return [popularProduct] as ChargeProductSelectDto[];
      }
      return chargeProduct?.slice(0, 1) ?? ([] as ChargeProductSelectDto[]);
    }
    return chargeProduct ?? ([] as ChargeProductSelectDto[]);
  }, [isSm, isMobile, chargeProduct]);

  // 鍔ㄦ€佽绠梘rid鍒楁暟
  const gridCols = Math.min(product?.length || 1, 3);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onClose(open);
      }}
    >
      <DialogContent className="w-[96vw] md:w-[960px] md:max-w-[960px]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <div 
            className="grid grid-cols-1 gap-5 bg-inherit py-5"
            style={{
              gridTemplateColumns: isSm || isMobile 
                ? '1fr' 
                : `repeat(${gridCols}, minmax(0, 1fr))`,
            }}
          >
            {product?.map((offer) => (
              <PricingCard offer={offer} key={offer.id} />
            ))}
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
