import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Camera, FileText, Upload } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { UserArrowLeftIcon } from "@/assets";
import { Icons } from "@/components/shared/icons";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/lib/navigation";
import { cn } from "@/lib/utils";

import AnimatedGradientText from "../magicui/animated-gradient-text";

export default async function HeroLanding() {
  const t = await getTranslations({ namespace: "IndexPage" });

  return (
    <section className="space-y-8 py-12 sm:py-20 lg:py-24">
      <div className="container flex max-w-6xl flex-col items-center gap-8 text-center">
        {/* 产品介绍标签 */}
        <Link
          href="https://x.com/koyaguo/status/1825891501639086219"
          target="_blank"
        >
          <AnimatedGradientText>
            <span className="mr-3">📸</span>
            <span
              className={cn(
                `inline animate-gradient bg-gradient-to-r from-[#FF8C42] via-[#8B4513] to-[#FF8C42] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`,
              )}
            >
              {t("intro")}
            </span>
            <Icons.twitter className="ml-2 size-3.5" />
          </AnimatedGradientText>
        </Link>

        {/* 主标题 */}
        <div className="space-y-4">
          <h1 className="text-balance font-urban text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-[66px]">
            <span className="bg-gradient-to-r from-[#FF8C42] to-[#8B4513] bg-clip-text text-transparent">
              {t("title")}
            </span>
            <br />
            <span className="text-foreground">
              {t("subtitle")}
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-center text-balance leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            {t("description")}
          </p>
        </div>

        {/* 核心功能卡片 */}
        <div className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="group relative overflow-hidden border-2 border-dashed border-muted-foreground/20 bg-gradient-to-br from-orange-50 to-amber-50 transition-all duration-300 hover:border-[#FF8C42] hover:shadow-lg dark:from-orange-950/20 dark:to-amber-950/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF8C42]/10">
                  <FileText className="h-5 w-5 text-[#FF8C42]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{t("generator.textMode.title")}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {t("generator.textMode.cost")}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {t("generator.textMode.description")}
              </p>
              <div className="text-xs text-muted-foreground">
                💡 {t("generator.textMode.example")}
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-2 border-dashed border-muted-foreground/20 bg-gradient-to-br from-blue-50 to-indigo-50 transition-all duration-300 hover:border-[#8B4513] hover:shadow-lg dark:from-blue-950/20 dark:to-indigo-950/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8B4513]/10">
                  <Upload className="h-5 w-5 text-[#8B4513]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{t("generator.imageMode.title")}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {t("generator.imageMode.cost")}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {t("generator.imageMode.description")}
              </p>
              <div className="text-xs text-muted-foreground">
                📁 {t("generator.imageMode.formats")}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 特色亮点 */}
        <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚡</span>
            <span>{t("features.speed")}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">📐</span>
            <span>{t("features.frame")}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🎨</span>
            <span>{t("features.vintage")}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">💰</span>
            <span>{t("features.transparent")}</span>
          </div>
        </div>

        {/* 行动按钮 */}
        <div className="flex flex-col justify-center space-y-4 md:flex-row md:space-x-4 md:space-y-0">
          <SignedIn>
            <Link
              className={cn(
                buttonVariants({ size: "lg" }),
                "group relative items-center justify-center gap-2 overflow-hidden rounded-full bg-[#FF8C42] px-8 py-3 text-white shadow-lg transition-all duration-300 ease-out hover:bg-[#FF8C42]/90 hover:shadow-xl",
              )}
              href="/app/generate"
            >
              <span className="absolute right-0 -mt-12 h-32 w-8 translate-x-12 rotate-12 bg-white opacity-10 transition-all duration-1000 ease-out group-hover:-translate-x-40" />
              <Camera className="mr-2 size-5" />
              <span className="font-medium">
                {t("action.generate")}
              </span>
            </Link>
          </SignedIn>

          <SignedOut>
            <SignInButton mode="redirect">
              <Button
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "gap-2 rounded-full bg-[#FF8C42] px-8 py-3 text-white shadow-lg hover:bg-[#FF8C42]/90",
                )}
              >
                <UserArrowLeftIcon className="mr-2 size-4" />
                <span>{t("action.login")}</span>
              </Button>
            </SignInButton>
          </SignedOut>

          <Link
            href="/pricing"
            className={cn(
              buttonVariants({
                variant: "outline",
                size: "lg",
              }),
              "rounded-full border-2 border-[#8B4513] px-8 py-3 text-[#8B4513] hover:bg-[#8B4513] hover:text-white",
            )}
          >
            <p>{t("action.pricing")}</p>
            <Icons.arrowRight className="ml-2 size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
