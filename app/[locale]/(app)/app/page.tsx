import { Metadata } from "next";
import Link from "next/link";
import { unstable_setRequestLocale } from "next-intl/server";
import { Camera, History, CreditCard, Sparkles, TrendingUp, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "仪表板 - 宝丽来AI生成器",
  description: "查看你的宝丽来生成统计和快速操作",
};

interface DashboardPageProps {
  params: { locale: string };
}

export default function DashboardPage({ params }: DashboardPageProps) {
  unstable_setRequestLocale(params.locale);

  // TODO: 从API获取真实数据
  const stats = {
    totalGenerated: 42,
    totalDownloads: 38,
    creditsUsed: 210,
    creditsRemaining: 100,
  };

  const quickActions = [
    {
      title: "生成宝丽来",
      description: "创建新的宝丽来风格照片",
      iconName: "Camera",
      href: "/app/generate",
      color: "bg-polaroid-orange",
    },
    {
      title: "查看历史",
      description: "浏览你的生成历史",
      iconName: "History",
      href: "/app/history",
      color: "bg-blue-500",
    },
    {
      title: "积分充值",
      description: "购买更多积分",
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
          欢迎使用宝丽来AI生成器
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          将你的创意转化为复古宝丽来风格的照片，体验AI技术带来的无限可能
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="vintage-gradient retro-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-polaroid-brown">
              已生成照片
            </CardTitle>
            <Camera className="h-4 w-4 text-polaroid-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-polaroid-brown">{stats.totalGenerated}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline w-3 h-3 mr-1" />
              本月新增 12 张
            </p>
          </CardContent>
        </Card>

        <Card className="vintage-gradient retro-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-polaroid-brown">
              总下载次数
            </CardTitle>
            <Download className="h-4 w-4 text-polaroid-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-polaroid-brown">{stats.totalDownloads}</div>
            <p className="text-xs text-muted-foreground">
              下载率 90.5%
            </p>
          </CardContent>
        </Card>

        <Card className="vintage-gradient retro-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-polaroid-brown">
              已使用积分
            </CardTitle>
            <Sparkles className="h-4 w-4 text-polaroid-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-polaroid-brown">{stats.creditsUsed}</div>
            <p className="text-xs text-muted-foreground">
              平均每张 5 积分
            </p>
          </CardContent>
        </Card>

        <Card className="vintage-gradient retro-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-polaroid-brown">
              剩余积分
            </CardTitle>
            <CreditCard className="h-4 w-4 text-polaroid-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-polaroid-brown">{stats.creditsRemaining}</div>
            <p className="text-xs text-muted-foreground">
              可生成约 20 张照片
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 快速操作 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-polaroid-brown">快速操作</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <Card key={index} className="vintage-gradient retro-shadow hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center text-white mb-4`}>
                  {getIcon(action.iconName)}
                </div>
                <CardTitle className="text-polaroid-brown">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full bg-polaroid-orange hover:bg-polaroid-orange/90">
                  <Link href={action.href}>
                    开始使用
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
          <h2 className="text-xl font-semibold text-polaroid-brown">最近生成</h2>
          <Button variant="outline" asChild>
            <Link href="/app/history">查看全部</Link>
          </Button>
        </div>
        
        <Card className="vintage-gradient retro-shadow">
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>还没有生成任何宝丽来照片</p>
              <Button asChild className="mt-4 bg-polaroid-orange hover:bg-polaroid-orange/90">
                <Link href="/app/generate">
                  <Sparkles className="w-4 h-4 mr-2" />
                  开始创作
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}