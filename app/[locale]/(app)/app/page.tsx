"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Camera, History, CreditCard, Sparkles, TrendingUp, Download, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuth } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DashboardPageProps {
  params: { locale: string };
}

// 积分消耗常量
const CREDITS_PER_GENERATION = 5;

export default function DashboardPage({ params }: DashboardPageProps) {
  const { getToken } = useAuth();
  const t = useTranslations("Dashboard");

  const [stats, setStats] = useState({
    totalGenerated: 0,
    totalDownloads: 0,
    creditsUsed: 0,
    creditsRemaining: 0,
    monthlyGenerated: 0,
    downloadRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // 从 API 获取用户统计数据
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const token = await getToken();
        
        // 获取账户信息（积分）
        const accountRes = await fetch("/api/account", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // 获取历史记录统计
        const historyRes = await fetch("/api/polaroid-history?page=1&limit=1", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (accountRes.ok && historyRes.ok) {
          const accountData = await accountRes.json();
          const historyData = await historyRes.json();

          const totalGenerated = historyData.pagination?.total || 0;
          
          setStats({
            totalGenerated: totalGenerated,
            totalDownloads: 0, // TODO: 从 API 获取下载数
            creditsUsed: 0, // TODO: 从 API 获取已用积分
            creditsRemaining: accountData.credit || 0,
            monthlyGenerated: totalGenerated, // TODO: 从 API 获取本月数据
            downloadRate: totalGenerated > 0 ? 85 : 0, // 估算下载率
          });
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [getToken]);

  // 计算平均每张消耗积分
  const averageCreditsPerPhoto = stats.totalGenerated > 0 
    ? Math.round(stats.creditsUsed / stats.totalGenerated) 
    : CREDITS_PER_GENERATION;

  // 计算可生成照片数量
  const estimatedPhotos = Math.floor(stats.creditsRemaining / CREDITS_PER_GENERATION);

  const quickActions = [
    {
      titleKey: "quickActions.generate.title" as const,
      descriptionKey: "quickActions.generate.description" as const,
      iconName: "Camera",
      href: "/app/generate",
      color: "bg-polaroid-orange",
    },
    {
      titleKey: "quickActions.history.title" as const,
      descriptionKey: "quickActions.history.description" as const,
      iconName: "History",
      href: "/app/history",
      color: "bg-blue-500",
    },
    {
      titleKey: "quickActions.credits.title" as const,
      descriptionKey: "quickActions.credits.description" as const,
      iconName: "CreditCard",
      href: "/app/order",
      color: "bg-green-500",
    },
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Camera":
        return <Camera className="w-6 h-6" />;
      case "History":
        return <History className="w-6 h-6" />;
      case "CreditCard":
        return <CreditCard className="w-6 h-6" />;
      default:
        return <Camera className="w-6 h-6" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* 欢迎区域 */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-polaroid-brown flex items-center justify-center gap-2">
          <Sparkles className="w-8 h-8 text-polaroid-orange" />
          {t("welcome.title")}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t("welcome.description")}
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="vintage-gradient retro-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-polaroid-brown">
              {t("stats.totalGenerated")}
            </CardTitle>
            <Camera className="h-4 w-4 text-polaroid-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-polaroid-brown">{stats.totalGenerated}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline w-3 h-3 mr-1" />
              {t("stats.monthlyNew", { count: stats.monthlyGenerated })}
            </p>
          </CardContent>
        </Card>

        <Card className="vintage-gradient retro-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-polaroid-brown">
              {t("stats.totalDownloads")}
            </CardTitle>
            <Download className="h-4 w-4 text-polaroid-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-polaroid-brown">{stats.totalDownloads}</div>
            <p className="text-xs text-muted-foreground">
              {t("stats.downloadRate", { rate: stats.downloadRate.toFixed(1) })}
            </p>
          </CardContent>
        </Card>

        <Card className="vintage-gradient retro-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-polaroid-brown">
              {t("stats.creditsUsed")}
            </CardTitle>
            <Sparkles className="h-4 w-4 text-polaroid-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-polaroid-brown">{stats.creditsUsed}</div>
            <p className="text-xs text-muted-foreground">
              {t("stats.averageCredits", { credits: averageCreditsPerPhoto })}
            </p>
          </CardContent>
        </Card>

        <Card className="vintage-gradient retro-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-polaroid-brown">
              {t("stats.creditsRemaining")}
            </CardTitle>
            <CreditCard className="h-4 w-4 text-polaroid-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-polaroid-brown">{stats.creditsRemaining}</div>
            <p className="text-xs text-muted-foreground">
              {t("stats.estimatedPhotos", { count: estimatedPhotos })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 快速操作 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-polaroid-brown">{t("quickActions.title")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <Card key={index} className="vintage-gradient retro-shadow hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center text-white mb-4`}>
                  {getIcon(action.iconName)}
                </div>
                <CardTitle className="text-polaroid-brown">{t(action.titleKey)}</CardTitle>
                <CardDescription>{t(action.descriptionKey)}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full bg-polaroid-orange hover:bg-polaroid-orange/90">
                  <Link href={action.href}>
                    {t("quickActions.startUsing")}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 最近生成 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-polaroid-brown">{t("recentGeneration.title")}</h2>
          <Button variant="outline" asChild>
            <Link href="/app/history">{t("recentGeneration.viewAll")}</Link>
          </Button>
        </div>
        
        <Card className="vintage-gradient retro-shadow">
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>{t("recentGeneration.empty")}</p>
              <Button asChild className="mt-4 bg-polaroid-orange hover:bg-polaroid-orange/90">
                <Link href="/app/generate">
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t("recentGeneration.startCreating")}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}