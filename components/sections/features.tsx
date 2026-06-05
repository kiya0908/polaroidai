import { useTranslations } from "next-intl";
import { Camera, FileText, Upload, Zap, Frame, Palette } from "lucide-react";

import { HeaderSection } from "@/components/shared/header-section";
import { Icons } from "@/components/shared/icons";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/navigation";

const polaroidFeatures = [
  {
    icon: FileText,
    key: "item1",
    tone: "bg-[#d6883f]/12"
  },
  {
    icon: Upload,
    key: "item2",
    tone: "bg-[#08304c]/10"
  },
  {
    icon: Frame,
    key: "item3",
    tone: "bg-[#d6883f]/12"
  },
  {
    icon: Zap,
    key: "item4",
    tone: "bg-[#08304c]/10"
  },
  {
    icon: Palette,
    key: "item5",
    tone: "bg-[#d6883f]/12"
  },
  {
    icon: Camera,
    key: "item6",
    tone: "bg-[#08304c]/10"
  }
];

export default function Features() {
  const t = useTranslations("IndexPage");

  return (
    <section className="py-20 sm:py-28">
      <div className="pb-6 pt-4">
        <MaxWidthWrapper>
          <HeaderSection
            title={t("features.title")}
            subtitle={t("features.description")}
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {polaroidFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  className="portrait-card group relative overflow-hidden p-6 transition-transform duration-300 hover:-translate-y-1"
                  key={feature.key}
                >
                  <div className="relative">
                    <div className={`relative flex size-12 rounded-2xl ${feature.tone}`}>
                      <Icon className="relative m-auto size-6 text-[#08304c]" />
                    </div>

                    <h3 className="mt-6 font-heading text-xl font-medium tracking-[-0.02em] text-[#08304c]">
                      {t(`features.${feature.key}.title`)}
                    </h3>

                    <p className="mt-2 pb-6 leading-7 text-[#08304c]/60">
                      {t(`features.${feature.key}.description`)}
                    </p>

                    <div className="-mb-6 flex gap-3 border-t border-[#08304c]/10 pt-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="rounded-full bg-[#d6883f]/10 px-4 text-[#08304c] hover:bg-[#d6883f]/20"
                      >
                        <Link
                          href="/mvp-simple"
                          className="flex items-center gap-2"
                        >
                          <span>{t("features.action.visit")}</span>
                          <Icons.arrowUpRight className="size-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </MaxWidthWrapper>
      </div>
    </section>
  );
}
