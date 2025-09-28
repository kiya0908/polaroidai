import { unstable_setRequestLocale } from "next-intl/server";

import Examples from "@/components/sections/examples";
import Features from "@/components/sections/features";
import HeroLanding from "@/components/sections/hero-landing";
import WhatIsSection from "@/components/sections/what-is-section";
import HowItWorksSection from "@/components/sections/how-it-works-section";
import PolaroidFAQ from "@/components/sections/polaroid-faq";
import PricingCard from "@/components/sections/pricing-card";
import TwitterList from "@/components/sections/twitter-list";

type Props = {
  params: { locale: string };
};

export default function IndexPage({ params: { locale } }: Props) {
  // Enable static rendering
  unstable_setRequestLocale(locale);

  return (
    <>
      <HeroLanding />
      <WhatIsSection />
      <HowItWorksSection />
      <Features />
      <Examples />
      <PolaroidFAQ />
      <PricingCard locale={locale} />
      {process.env.NODE_ENV === "production" && <TwitterList />}
    </>
  );
}
