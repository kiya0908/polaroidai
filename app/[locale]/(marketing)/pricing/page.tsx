import { getTranslations, unstable_setRequestLocale } from "next-intl/server";

import { PricingFaq } from "@/components/pricing-faq";
import PricingCard from "@/components/sections/pricing-card";

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params: { locale } }: Props) {
  const t = await getTranslations({ locale });
  return {
    title: `${t("PricingPage.title")} - ${t("LocaleLayout.title")}`,
    description: t("LocaleLayout.description"),
  };
}

export default async function PricingPage({ params: { locale } }: Props) {
  unstable_setRequestLocale(locale);

  return (
    <div className="flex w-full flex-col gap-16 py-8 md:py-8">
      <PricingCard locale={locale} />
      <hr className="container" />
      <PricingFaq />
    </div>
  );
}
