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
    tone: "bg-[#d6883f]/12",
  },
  {
    step: 2,
    icon: Wand2,
    key: "process",
    tone: "bg-[#08304c]/10",
  },
  {
    step: 3,
    icon: Upload,
    key: "generate",
    tone: "bg-[#d6883f]/12",
  },
  {
    step: 4,
    icon: Download,
    key: "download",
    tone: "bg-[#08304c]/10",
  }
];

export default function HowItWorksSection() {
  const t = useTranslations("IndexPage");

  return (
    <section className="py-20 sm:py-28">
      <MaxWidthWrapper>
        <HeaderSection
          title={t("howItWorks.title")}
          subtitle={t("howItWorks.subtitle")}
        />

        <div className="mt-16">
          {/* 姝ラ娴佺▼ */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === workflowSteps.length - 1;

              return (
                <div key={step.key} className="relative">
                  <Card className="portrait-card group transition-transform duration-300 hover:-translate-y-1">
                    <CardContent className="p-6 text-center">
                      {/* 姝ラ缂栧彿 */}
                      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#d6883f] text-lg font-bold text-[#08304c]">
                        {step.step}
                      </div>

                      {/* 鍥炬爣 */}
                      <div className={`mx-auto mb-4 flex h-14 w-14 rounded-2xl ${step.tone}`}>
                        <Icon className="m-auto h-7 w-7 text-[#08304c]" />
                      </div>

                      {/* 鏍囬 */}
                      <h4 className="mb-2 font-heading text-lg font-medium text-[#08304c]">
                        {t(`howItWorks.steps.${step.key}.title`)}
                      </h4>

                      {/* 鎻忚堪 */}
                      <p className="text-sm leading-6 text-[#08304c]/60">
                        {t(`howItWorks.steps.${step.key}.description`)}
                      </p>

                      {/* 绀轰緥 */}
                      {step.key === "input" && (
                        <div className="mt-4 rounded-2xl bg-[#f7f7f7] p-3">
                          <Badge variant="secondary" className="rounded-full bg-white text-xs text-[#08304c]">
                            {t("howItWorks.steps.input.example")}
                          </Badge>
                        </div>
                      )}

                      {step.key === "process" && (
                        <div className="mt-4 rounded-2xl bg-[#f7f7f7] p-3">
                          <div className="flex items-center justify-center space-x-1">
                            <div className="h-2 w-2 animate-pulse rounded-full bg-[#d6883f]"></div>
                            <div className="h-2 w-2 animate-pulse rounded-full bg-[#d6883f] delay-100"></div>
                            <div className="h-2 w-2 animate-pulse rounded-full bg-[#d6883f] delay-200"></div>
                          </div>
                          <p className="mt-2 text-xs text-[#08304c]/60">
                            {t("howItWorks.steps.process.time")}
                          </p>
                        </div>
                      )}

                      {step.key === "generate" && (
                        <div className="mt-4 rounded-2xl bg-[#f7f7f7] p-3">
                          <div className="mx-auto h-20 w-16 rotate-[-3deg] rounded-sm bg-white p-2 shadow-sm">
                            <div className="mb-1 h-3/4 w-full rounded-sm bg-[#d6883f]/20"></div>
                            <div className="h-1/4 bg-white"></div>
                          </div>
                        </div>
                      )}

                      {step.key === "download" && (
                        <div className="mt-4 rounded-2xl bg-[#f7f7f7] p-3">
                          <p className="text-xs font-medium text-[#08304c]">
                            {t("howItWorks.steps.download.quality")}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* 绠ご杩炴帴 */}
                  {!isLast && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ArrowRight className="h-6 w-6 text-[#d6883f]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 搴曢儴璇存槑 */}
          <div className="mt-16 text-center">
            <div className="max-w-2xl mx-auto space-y-4">
              <h4 className="font-heading text-2xl font-medium tracking-[-0.025em] text-[#08304c]">
                {t("howItWorks.summary.title")}
              </h4>
              <p className="text-[#08304c]/60">
                {t("howItWorks.summary.description")}
              </p>

              <div className="flex flex-wrap justify-center gap-4 mt-6">
                <Badge variant="outline" className="rounded-full border-[#d6883f]/35 bg-white text-[#08304c]">
                  {t("howItWorks.highlights.fast")}
                </Badge>
                <Badge variant="outline" className="rounded-full border-[#08304c]/15 bg-white text-[#08304c]">
                  {t("howItWorks.highlights.authentic")}
                </Badge>
                <Badge variant="outline" className="rounded-full border-[#d6883f]/35 bg-white text-[#08304c]">
                  {t("howItWorks.highlights.easy")}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
