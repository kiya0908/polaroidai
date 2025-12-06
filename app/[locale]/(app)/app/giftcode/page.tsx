import { redirect } from "next/navigation";

import { currentUser } from "@clerk/nextjs/server";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";

import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell } from "@/components/dashboard/shell";
import GiftCodeForm from "@/components/forms/gift-code-form";
import { MVP_CONFIG } from "@/lib/mvp-config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: { locale: string };
}

export async function generateMetadata({
  params: { locale },
}: PageProps) {
  const t = await getTranslations({ locale, namespace: "GiftCode" });

  return {
    title: t("title"),
    description: t("text"),
  };
}


export default async function SettingsPage({ params: { locale } }: PageProps) {
  unstable_setRequestLocale(locale);

  // MVP模式下不需要Clerk认证检查
  const isMVP = MVP_CONFIG.guest.enabled;

  if (!isMVP) {
    // 生产模式：检查Clerk认证
    const user = await currentUser();
    if (!user) {
      redirect("/");
    }
  }

  const t = await getTranslations({ namespace: "GiftCode" });

  // MVP模式下显示功能禁用提示
  if (isMVP && !MVP_CONFIG.features.giftCode) {
    return (
      <DashboardShell>
        <DashboardHeader heading={t("title")} text={t("text")} />
        <Card className="max-w-2xl mx-auto vintage-gradient">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Lock className="w-8 h-8 text-gray-400" />
            </div>
            <CardTitle className="text-polaroid-brown">
              功能暂未开放
            </CardTitle>
            <CardDescription>
              礼品码兑换功能在测试模式下暂不可用
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              当前为游客测试模式，礼品码兑换功能将在正式版本中开放。
              <br />
              您可以继续使用免费积分体验宝丽来生成功能。
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild className="bg-polaroid-orange hover:bg-polaroid-orange/90">
                <Link href="/app/generate">
                  <Gift className="w-4 h-4 mr-2" />
                  去生成照片
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <DashboardHeader heading={t("title")} text={t("text")} />
      <div className="grid gap-10">
        <GiftCodeForm />
      </div>
    </DashboardShell>
  );
}
