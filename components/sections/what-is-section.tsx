import { useTranslations } from "next-intl";
import { Camera, Sparkles, Heart, Clock } from "lucide-react";

import { HeaderSection } from "@/components/shared/header-section";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const whatIsFeatures = [
  {
    icon: Camera,
    key: "authentic",
    color: "bg-[#d6883f]/12 text-[#08304c]"
  },
  {
    icon: Sparkles,
    key: "ai",
    color: "bg-[#08304c]/10 text-[#08304c]"
  },
  {
    icon: Heart,
    key: "nostalgia",
    color: "bg-[#d6883f]/12 text-[#08304c]"
  },
  {
    icon: Clock,
    key: "instant",
    color: "bg-[#08304c]/10 text-[#08304c]"
  }
];

export default function WhatIsSection() {
  const t = useTranslations("IndexPage");

  return (
    <section className="py-20 sm:py-28">
      <MaxWidthWrapper>
        <HeaderSection
          title={t("whatIs.title")}
          subtitle={t("whatIs.subtitle")}
        />

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:gap-12">
          {/* 宸︿晶锛氭枃瀛椾粙缁?*/}
          <div className="space-y-6">
            <div className="space-y-4">
              <Badge variant="secondary" className="rounded-full border border-[#d6883f]/20 bg-[#d6883f]/10 px-4 py-1 text-[#08304c]">
                {t("whatIs.badge")}
              </Badge>

              <h3 className="font-heading text-3xl font-medium tracking-[-0.03em] text-[#08304c]">
                {t("whatIs.description.title")}
              </h3>

              <p className="text-lg leading-8 text-[#08304c]/60">
                {t("whatIs.description.content")}
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-[#08304c]">
                {t("whatIs.comparison.title")}
              </h4>

              <div className="grid gap-3">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-[#08304c]/25"></div>
                  <span className="text-[#08304c]/50 line-through">
                    {t("whatIs.comparison.traditional")}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-[#d6883f]"></div>
                  <span className="font-medium text-[#08304c]">
                    {t("whatIs.comparison.ai")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 鍙充晶锛氱壒鑹插崱鐗?*/}
          <div className="grid gap-4 sm:grid-cols-2">
            {whatIsFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.key} className="portrait-card transition-transform duration-300 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className={`mb-4 inline-flex rounded-2xl p-3 ${feature.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <h5 className="mb-2 font-heading text-lg font-medium text-[#08304c]">
                      {t(`whatIs.features.${feature.key}.title`)}
                    </h5>

                    <p className="text-sm leading-6 text-[#08304c]/60">
                      {t(`whatIs.features.${feature.key}.description`)}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
