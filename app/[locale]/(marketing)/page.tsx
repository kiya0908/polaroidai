import { unstable_setRequestLocale } from "next-intl/server";

import { HomepageStructuredData } from "@/components/seo/homepage-structured-data";

import MVPSimplePage from "./mvp-simple";

type Props = {
  params: { locale: string };
};

export default function IndexPage({ params: { locale } }: Props) {
  // Enable static rendering
  unstable_setRequestLocale(locale);

  return (
    <>
      <HomepageStructuredData locale={locale} />
      <MVPSimplePage locale={locale} showSeoContent />
    </>
  );
}
