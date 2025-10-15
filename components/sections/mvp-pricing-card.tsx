"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function MVPPricingCard() {
  const t = useTranslations("IndexPage");

  const plans = [
    {
      name: "免费体验",
      nameEn: "Free Trial",
      price: "¥0",
      credits: 50,
      features: [
        "50积分免费额度",
        "文字生成宝丽来",
        "高清图片下载",
        "无需注册"
      ],
      featuresEn: [
        "50 free credits",
        "Text to Polaroid",
        "HD image download",
        "No registration required"
      ],
      popular: false
    },
    {
      name: "基础套餐",
      nameEn: "Basic Plan",
      price: "¥29",
      credits: 500,
      features: [
        "500积分额度",
        "文字+图片生成",
        "批量下载",
        "优先处理"
      ],
      featuresEn: [
        "500 credits",
        "Text + Image generation",
        "Batch download",
        "Priority processing"
      ],
      popular: true
    },
    {
      name: "专业套餐",
      nameEn: "Pro Plan",
      price: "¥99",
      credits: 2000,
      features: [
        "2000积分额度",
        "所有功能",
        "API访问",
        "技术支持"
      ],
      featuresEn: [
        "2000 credits",
        "All features",
        "API access",
        "Technical support"
      ],
      popular: false
    }
  ];

  const isEnglish = t("features.speed").includes("seconds") || t("features.speed").includes("instant");

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            {isEnglish ? "Simple & Transparent Pricing" : "简单透明的定价"}
          </h2>
          <p className="text-muted-foreground text-lg">
            {isEnglish
              ? "Choose the plan that fits your creative needs"
              : "选择适合您创作需求的套餐"
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative ${
                plan.popular
                  ? "border-[#FF8C42] shadow-lg scale-105"
                  : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <Badge
                  className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#FF8C42]"
                >
                  {isEnglish ? "Most Popular" : "最受欢迎"}
                </Badge>
              )}

              <CardHeader className="text-center">
                <CardTitle className="text-xl mb-2">
                  {isEnglish ? plan.nameEn : plan.name}
                </CardTitle>
                <div className="text-3xl font-bold text-[#FF8C42] mb-2">
                  {plan.price}
                </div>
                <p className="text-sm text-muted-foreground">
                  {plan.credits} {isEnglish ? "credits" : "积分"}
                </p>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-6">
                  {(isEnglish ? plan.featuresEn : plan.features).map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-[#FF8C42] hover:bg-[#FF8C42]/90"
                      : "bg-gray-600 hover:bg-gray-700"
                  }`}
                  disabled={plan.price === "¥0"}
                >
                  {plan.price === "¥0"
                    ? (isEnglish ? "Current Plan" : "当前套餐")
                    : (isEnglish ? "Choose Plan" : "选择套餐")
                  }
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            {isEnglish
              ? "🎁 New users get 50 free credits • No hidden fees • Cancel anytime"
              : "🎁 新用户获得50免费积分 • 无隐藏费用 • 随时取消"
            }
          </p>
        </div>
      </div>
    </section>
  );
}