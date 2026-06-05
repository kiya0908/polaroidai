import { getTranslations } from "next-intl/server";

const faqItems = ["item1", "item2", "item3", "item4", "item5", "item6"];
const howToSteps = ["input", "process", "generate", "download"];

export async function HomepageStructuredData({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "IndexPage" });

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: t(`faq.${item}.question`),
        acceptedAnswer: {
          "@type": "Answer",
          text: t(`faq.${item}.answer`),
        },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: t("howItWorks.title"),
      description: t("howItWorks.subtitle"),
      step: howToSteps.map((step) => ({
        "@type": "HowToStep",
        name: t(`howItWorks.steps.${step}.title`),
        text: t(`howItWorks.steps.${step}.description`),
      })),
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
      }}
    />
  );
}
