"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useAuth } from "@clerk/nextjs";
import {
  Camera,
  Sparkles,
  TrendingUp,
  Image as ImageIcon,
  Layers,
  CreditCard,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface HistoryRecord {
  id: string;
  input_type: "text" | "image";
  input_content: string | null;
  credit_cost: number;
  created_at: string;
}

export default function ChartsPage() {
  const t = useTranslations("Charts");
  const { getToken } = useAuth();

  const [stats, setStats] = useState({
    totalGenerated: 0,
    creditsUsed: 0,
    creditsRemaining: 0,
    avgPerDay: 0,
    typeDistribution: { text: 0, image: 0 },
    dailyData: [] as { date: string; count: number }[],
    recentActivity: [] as HistoryRecord[],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const token = await getToken();

        // 获取账户信息
        const accountRes = await fetch("/api/account", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // 获取历史记录
        const historyRes = await fetch("/api/polaroid-history?page=1&limit=50", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (accountRes.ok && historyRes.ok) {
          const accountData = await accountRes.json();
          const historyData = await historyRes.json();
          const records = historyData.records || [];

          // 统计类型分布
          const typeDistribution = { text: 0, image: 0 };
          let creditsUsed = 0;
          records.forEach((item: HistoryRecord) => {
            if (item.input_type === "text") typeDistribution.text++;
            else typeDistribution.image++;
            creditsUsed += item.credit_cost || 0;
          });

          // 生成近7天数据
          const now = new Date();
          const dailyData: { date: string; count: number }[] = [];
          for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
            const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
            const count = records.filter((item: HistoryRecord) => {
              const itemDate = new Date(item.created_at);
              return itemDate >= dayStart && itemDate < dayEnd;
            }).length;
            dailyData.push({ date: dateStr, count });
          }

          const totalGenerated = historyData.pagination?.total || records.length;
          const avgPerDay = totalGenerated > 0 ? Math.round((totalGenerated / 7) * 10) / 10 : 0;

          setStats({
            totalGenerated,
            creditsUsed,
            creditsRemaining: accountData.credit || 0,
            avgPerDay,
            typeDistribution,
            dailyData,
            recentActivity: records.slice(0, 5),
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

  const pieData = useMemo(() => {
    return [
      { name: t("creditsUsage.used"), value: stats.creditsUsed, fill: "#f97316" },
      { name: t("creditsUsage.remaining"), value: stats.creditsRemaining, fill: "#e5e7eb" },
    ];
  }, [stats.creditsUsed, stats.creditsRemaining, t]);

  const typeData = useMemo(() => {
    return [
      { name: t("generationType.text"), value: stats.typeDistribution.text, fill: "#f97316" },
      { name: t("generationType.image"), value: stats.typeDistribution.image, fill: "#3b82f6" },
    ].filter((item) => item.value > 0);
  }, [stats.typeDistribution, t]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "text":
        return <Camera className="w-4 h-4 text-polaroid-orange" />;
      case "image":
        return <ImageIcon className="w-4 h-4 text-blue-500" />;
      default:
        return <Camera className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-polaroid-orange"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-polaroid-brown">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="vintage-gradient">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("overview.totalGenerated")}</CardTitle>
            <Camera className="h-4 w-4 text-polaroid-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-polaroid-brown">{stats.totalGenerated}</div>
          </CardContent>
        </Card>

        <Card className="vintage-gradient">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("overview.creditsUsed")}</CardTitle>
            <Sparkles className="h-4 w-4 text-polaroid-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-polaroid-brown">{stats.creditsUsed}</div>
          </CardContent>
        </Card>

        <Card className="vintage-gradient">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("overview.creditsRemaining")}</CardTitle>
            <CreditCard className="h-4 w-4 text-polaroid-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-polaroid-brown">{stats.creditsRemaining}</div>
          </CardContent>
        </Card>

        <Card className="vintage-gradient">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("overview.avgPerDay")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-polaroid-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-polaroid-brown">{stats.avgPerDay}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("generationTrend.title")}</CardTitle>
            <CardDescription>{t("generationTrend.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.dailyData.some((d) => d.count > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.dailyData}>
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" name={t("generationTrend.count")} fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                {t("generationTrend.noData")}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("creditsUsage.title")}</CardTitle>
            <CardDescription>{t("creditsUsage.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.creditsUsed > 0 || stats.creditsRemaining > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                {t("generationTrend.noData")}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("generationType.title")}</CardTitle>
            <CardDescription>{t("generationType.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                {t("generationTrend.noData")}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("recentActivity.title")}</CardTitle>
            <CardDescription>{t("recentActivity.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {stats.recentActivity.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    {getTypeIcon(item.input_type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.input_content || "Image"}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(item.created_at)} - {t("recentActivity.creditsUsed", { credits: item.credit_cost })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground">
                <Camera className="w-12 h-12 mb-4 text-gray-300" />
                <p>{t("recentActivity.noActivity")}</p>
                <Button asChild className="mt-4 bg-polaroid-orange hover:bg-polaroid-orange/90">
                  <Link href="/app/generate">{t("recentActivity.startCreating")}</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
