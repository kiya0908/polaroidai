import { Camera, Layers3, Lightbulb, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";

import { HeaderSection } from "@/components/shared/header-section";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { Card, CardContent } from "@/components/ui/card";

const reasons = [
  { key: "creative", icon: Lightbulb, tone: "bg-[#d6883f]/12" },
  { key: "accessible", icon: Camera, tone: "bg-[#08304c]/10" },
  { key: "repeatable", icon: RefreshCw, tone: "bg-[#d6883f]/12" },
  { key: "practical", icon: Layers3, tone: "bg-[#08304c]/10" },
] as const;

export default function WhyPolaroidGenerator() {
  const t = useTranslations("IndexPage");

  return (
    <section className="py-20 sm:py-28">
      <MaxWidthWrapper>
        <HeaderSection title={t("why.title")} subtitle={t("why.subtitle")} />

        <p className="mx-auto mt-10 max-w-4xl text-pretty text-center text-base leading-8 text-[#08304c]/65 sm:text-lg">
          {t("why.intro")}
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {reasons.map(({ key, icon: Icon, tone }) => (
            <Card key={key} className="portrait-card">
              <CardContent className="p-6 sm:p-8">
                <div className={`mb-5 flex size-12 rounded-2xl ${tone}`}>
                  <Icon className="m-auto size-6 text-[#08304c]" />
                </div>
                <h3 className="font-heading text-xl font-medium tracking-[-0.02em] text-[#08304c]">
                  {t(`why.items.${key}.title`)}
                </h3>
                <p className="mt-3 leading-7 text-[#08304c]/60">
                  {t(`why.items.${key}.description`)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
