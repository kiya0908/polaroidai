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
    gradient: "from-orange-500/20 to-amber-500/20"
  },
  {
    icon: Upload,
    key: "item2",
    gradient: "from-blue-500/20 to-indigo-500/20"
  },
  {
    icon: Frame,
    key: "item3",
    gradient: "from-purple-500/20 to-pink-500/20"
  },
  {
    icon: Zap,
    key: "item4",
    gradient: "from-green-500/20 to-emerald-500/20"
  },
  {
    icon: Palette,
    key: "item5",
    gradient: "from-red-500/20 to-rose-500/20"
  },
  {
    icon: Camera,
    key: "item6",
    gradient: "from-cyan-500/20 to-blue-500/20"
  }
];

export default function Features() {
  const t = useTranslations("IndexPage");

  return (
    <section className="py-20">
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
                  className="group relative overflow-hidden rounded-2xl border bg-background p-6 transition-all duration-300 hover:shadow-lg"
                  key={feature.key}
                >
                  <div
                    aria-hidden="true"
                    className={`absolute inset-0 aspect-video -translate-y-1/2 rounded-full border bg-gradient-to-b ${feature.gradient} opacity-25 blur-2xl duration-300 group-hover:-translate-y-1/4`}
                  />
                  <div className="relative">
                    <div className="relative flex size-12 rounded-2xl border border-[#FF8C42]/20 bg-[#FF8C42]/5 shadow-sm">
                      <Icon className="relative m-auto size-6 text-[#FF8C42]" />
                    </div>

                    <h3 className="mt-6 font-semibold text-lg">
                      {t(`features.${feature.key}.title`)}
                    </h3>

                    <p className="mt-2 pb-6 text-muted-foreground">
                      {t(`features.${feature.key}.description`)}
                    </p>

                    <div className="-mb-6 flex gap-3 border-t border-muted pt-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="rounded-xl px-4 bg-[#FF8C42]/10 hover:bg-[#FF8C42]/20 text-[#FF8C42] border-[#FF8C42]/20"
                      >
                        <Link
                          href="/app/generate"
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
