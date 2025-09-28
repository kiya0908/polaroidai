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
    color: "bg-orange-500/10 text-orange-600"
  },
  {
    icon: Sparkles,
    key: "ai",
    color: "bg-purple-500/10 text-purple-600"
  },
  {
    icon: Heart,
    key: "nostalgia",
    color: "bg-red-500/10 text-red-600"
  },
  {
    icon: Clock,
    key: "instant",
    color: "bg-green-500/10 text-green-600"
  }
];

export default function WhatIsSection() {
  const t = useTranslations("IndexPage");

  return (
    <section className="py-20 bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-orange-950/20 dark:to-amber-950/20">
      <MaxWidthWrapper>
        <HeaderSection
          title={t("whatIs.title")}
          subtitle={t("whatIs.subtitle")}
        />

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:gap-12">
          {/* 左侧：文字介绍 */}
          <div className="space-y-6">
            <div className="space-y-4">
              <Badge variant="secondary" className="bg-[#FF8C42]/10 text-[#FF8C42] border-[#FF8C42]/20">
                {t("whatIs.badge")}
              </Badge>

              <h3 className="text-2xl font-bold">
                {t("whatIs.description.title")}
              </h3>

              <p className="text-muted-foreground leading-relaxed">
                {t("whatIs.description.content")}
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-lg">
                {t("whatIs.comparison.title")}
              </h4>

              <div className="grid gap-3">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-muted-foreground line-through">
                    {t("whatIs.comparison.traditional")}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="font-medium">
                    {t("whatIs.comparison.ai")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：特色卡片 */}
          <div className="grid gap-4 sm:grid-cols-2">
            {whatIsFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.key} className="border-2 border-dashed border-muted-foreground/20 hover:border-[#FF8C42]/30 transition-colors">
                  <CardContent className="p-6">
                    <div className={`inline-flex p-3 rounded-xl ${feature.color} mb-4`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <h5 className="font-semibold mb-2">
                      {t(`whatIs.features.${feature.key}.title`)}
                    </h5>

                    <p className="text-sm text-muted-foreground">
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