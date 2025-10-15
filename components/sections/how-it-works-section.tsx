import { useTranslations } from "next-intl";
import { FileText, Upload, Wand2, Download, ArrowRight } from "lucide-react";

import { HeaderSection } from "@/components/shared/header-section";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const workflowSteps = [
  {
    step: 1,
    icon: FileText,
    key: "input",
    color: "bg-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/20"
  },
  {
    step: 2,
    icon: Wand2,
    key: "process",
    color: "bg-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/20"
  },
  {
    step: 3,
    icon: Upload,
    key: "generate",
    color: "bg-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-950/20"
  },
  {
    step: 4,
    icon: Download,
    key: "download",
    color: "bg-green-500",
    bgColor: "bg-green-50 dark:bg-green-950/20"
  }
];

export default function HowItWorksSection() {
  const t = useTranslations("IndexPage");

  return (
    <section id="how-it-works" className="py-20">
      <MaxWidthWrapper>
        <HeaderSection
          title={t("howItWorks.title")}
          subtitle={t("howItWorks.subtitle")}
        />

        <div className="mt-16">
          {/* 步骤流程 */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === workflowSteps.length - 1;

              return (
                <div key={step.key} className="relative">
                  <Card className={`${step.bgColor} border-2 border-dashed border-muted-foreground/20 hover:border-[#FF8C42]/30 transition-all duration-300 group`}>
                    <CardContent className="p-6 text-center">
                      {/* 步骤编号 */}
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${step.color} text-white font-bold text-lg mb-4`}>
                        {step.step}
                      </div>

                      {/* 图标 */}
                      <div className="mb-4">
                        <Icon className="w-8 h-8 mx-auto text-muted-foreground group-hover:text-[#FF8C42] transition-colors" />
                      </div>

                      {/* 标题 */}
                      <h4 className="font-semibold text-lg mb-2">
                        {t(`howItWorks.steps.${step.key}.title`)}
                      </h4>

                      {/* 描述 */}
                      <p className="text-sm text-muted-foreground">
                        {t(`howItWorks.steps.${step.key}.description`)}
                      </p>

                      {/* 示例 */}
                      {step.key === "input" && (
                        <div className="mt-4 p-3 rounded-lg bg-white/50 dark:bg-black/20">
                          <Badge variant="secondary" className="text-xs">
                            {t("howItWorks.steps.input.example")}
                          </Badge>
                        </div>
                      )}

                      {step.key === "process" && (
                        <div className="mt-4 p-3 rounded-lg bg-white/50 dark:bg-black/20">
                          <div className="flex items-center justify-center space-x-1">
                            <div className="w-2 h-2 bg-[#FF8C42] rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-[#FF8C42] rounded-full animate-pulse delay-100"></div>
                            <div className="w-2 h-2 bg-[#FF8C42] rounded-full animate-pulse delay-200"></div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {t("howItWorks.steps.process.time")}
                          </p>
                        </div>
                      )}

                      {step.key === "generate" && (
                        <div className="mt-4 p-3 rounded-lg bg-white/50 dark:bg-black/20">
                          <div className="w-16 h-20 mx-auto bg-white border-4 border-gray-200 rounded-sm shadow-sm">
                            <div className="w-full h-3/4 bg-gradient-to-br from-orange-200 to-amber-200 rounded-sm mb-1"></div>
                            <div className="h-1/4 bg-white"></div>
                          </div>
                        </div>
                      )}

                      {step.key === "download" && (
                        <div className="mt-4 p-3 rounded-lg bg-white/50 dark:bg-black/20">
                          <p className="text-xs font-medium text-green-600">
                            {t("howItWorks.steps.download.quality")}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* 箭头连接 */}
                  {!isLast && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-6 h-6 text-[#FF8C42]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 底部说明 */}
          <div className="mt-16 text-center">
            <div className="max-w-2xl mx-auto space-y-4">
              <h4 className="text-xl font-semibold">
                {t("howItWorks.summary.title")}
              </h4>
              <p className="text-muted-foreground">
                {t("howItWorks.summary.description")}
              </p>

              <div className="flex flex-wrap justify-center gap-4 mt-6">
                <Badge variant="outline" className="border-[#FF8C42]/30 text-[#FF8C42]">
                  ⚡ {t("howItWorks.highlights.fast")}
                </Badge>
                <Badge variant="outline" className="border-[#8B4513]/30 text-[#8B4513]">
                  🎨 {t("howItWorks.highlights.authentic")}
                </Badge>
                <Badge variant="outline" className="border-green-500/30 text-green-600">
                  ✨ {t("howItWorks.highlights.easy")}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}