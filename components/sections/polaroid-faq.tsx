import { useTranslations } from "next-intl";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HeaderSection } from "@/components/shared/header-section";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

const polaroidFaqData = [
  {
    id: "item-1",
    question: "item1.question",
    answer: "item1.answer",
  },
  {
    id: "item-2",
    question: "item2.question",
    answer: "item2.answer",
  },
  {
    id: "item-3",
    question: "item3.question",
    answer: "item3.answer",
  },
  {
    id: "item-4",
    question: "item4.question",
    answer: "item4.answer",
  },
  {
    id: "item-5",
    question: "item5.question",
    answer: "item5.answer",
  },
  {
    id: "item-6",
    question: "item6.question",
    answer: "item6.answer",
  },
];

export default function PolaroidFAQ() {
  const t = useTranslations("IndexPage");

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50/50 to-gray-50/50 dark:from-slate-950/20 dark:to-gray-950/20">
      <MaxWidthWrapper>
        <div className="max-w-4xl mx-auto">
          <HeaderSection
            title={t("faq.title")}
            subtitle={t("faq.subtitle")}
          />

          <Accordion type="single" collapsible className="mt-12 w-full space-y-4">
            {polaroidFaqData.map((faqItem) => (
              <AccordionItem
                key={faqItem.id}
                value={faqItem.id}
                className="bg-white dark:bg-gray-900 rounded-lg border-2 border-dashed border-muted-foreground/20 hover:border-[#FF8C42]/30 transition-colors px-6"
              >
                <AccordionTrigger className="text-left font-semibold hover:text-[#FF8C42] transition-colors">
                  {t(`faq.${faqItem.question}`)}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground sm:text-[15px] pb-6">
                  {t(`faq.${faqItem.answer}`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          
        </div>
      </MaxWidthWrapper>
    </section>
  );
}