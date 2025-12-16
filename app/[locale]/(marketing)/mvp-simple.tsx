"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Loader2, Camera, Upload, X, Image as ImageIcon, LogIn } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

// 导入现有的组件
import WhatIsSection from "@/components/sections/what-is-section";
import HowItWorksSection from "@/components/sections/how-it-works-section";
import Features from "@/components/sections/features";
import Examples from "@/components/sections/examples";
import PolaroidFAQ from "@/components/sections/polaroid-faq";
import MVPPricingCard from "@/components/sections/mvp-pricing-card";

interface GenerationResult {
  id: string;
  outputImageUrl: string;
  processingTime: number;
}

interface MVPPageProps {
  locale: string;
}

export default function MVPSimplePage({ locale }: MVPPageProps) {
  const t = useTranslations("MVP");
  const { isSignedIn, user } = useUser();
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 图片上传相关状态
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("text");

  // 新增：图片处理函数
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // 限制最多5张图片
    const maxImages = 5;
    const remainingSlots = maxImages - selectedImages.length;
    const filesToAdd = files.slice(0, remainingSlots);

    // 创建预览URL
    const newPreviews = filesToAdd.map(file => URL.createObjectURL(file));

    setSelectedImages(prev => [...prev, ...filesToAdd]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    // 清理URL对象以避免内存泄漏
    URL.revokeObjectURL(imagePreviews[index]);

    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    // 检查登录状态
    if (!isSignedIn) {
      setError(t("errors.loginRequired") || "请先登录后使用");
      return;
    }

    // TODO: 等待后端积分系统实现后，添加积分检查逻辑
    // const requiredCredits = activeTab === "text" ? 5 : 10;
    // if (currentCredits < requiredCredits) {
    //   setError("积分不足");
    //   return;
    // }

    // 根据当前选项卡进行不同的验证
    if (activeTab === "text") {
      if (!prompt.trim()) {
        setError(t("errors.emptyPrompt"));
        return;
      }
    } else if (activeTab === "images") {
      if (selectedImages.length === 0) {
        setError(t("errors.noImagesUploaded"));
        return;
      }
      if (!prompt.trim()) {
        setError(t("errors.emptyCompositionPrompt"));
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      let requestBody;
      let generationType: 'text' | 'image' | 'multi';

      if (activeTab === "text") {
        generationType = 'text';
        requestBody = {
          type: "text",
          content: prompt,
        };
      } else {
        generationType = 'multi';
        // 多图合成模式
        const formData = new FormData();
        selectedImages.forEach((image) => {
          formData.append("images", image);
        });
        formData.append("content", prompt);
        formData.append("type", "multiImage");

        const response = await fetch("/api/mvp-generate", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          // TODO: 等待后端积分系统实现后，调用 API 扣除积分
          // await fetch('/api/credits/deduct', {
          //   method: 'POST',
          //   body: JSON.stringify({ amount: requiredCredits })
          // });
          // setCurrentCredits(prev => prev - requiredCredits);

          setResult(data.data);
        } else {
          setError(data.error?.message || t("errors.generateFailed"));
        }
        return;
      }

      const response = await fetch("/api/mvp-generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success) {
        // TODO: 等待后端积分系统实现后，调用 API 扣除积分
        // await fetch('/api/credits/deduct', {
        //   method: 'POST',
        //   body: JSON.stringify({ amount: requiredCredits })
        // });
        // setCurrentCredits(prev => prev - requiredCredits);

        setResult(data.data);
      } else {
        setError(data.error?.message || t("errors.generateFailed"));
      }
    } catch (err) {
      setError(t("errors.networkError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (result?.outputImageUrl) {
      const link = document.createElement("a");
      link.href = result.outputImageUrl;
      link.download = `polaroid-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* 生成器部分 */}
      <div className="py-12">
        <div className="container mx-auto max-w-4xl px-4">
          {/* 页面标题 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#FF8C42] to-[#8B4513] bg-clip-text text-transparent mb-4">
              {t("title")}
            </h1>
            <p className="text-muted-foreground text-lg">
              {t("subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
            {/* 输入区域 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-[#FF8C42]" />
                  {t("generator.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 选项卡 */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="text" className="flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      {t("tabs.textGeneration")}
                    </TabsTrigger>
                    <TabsTrigger value="images" className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      {t("tabs.imageComposition")}
                    </TabsTrigger>
                  </TabsList>

                  {/* 文字生成选项卡内容 */}
                  <TabsContent value="text" className="space-y-4">
                    <Textarea
                      placeholder={t("generator.placeholder")}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[120px] resize-none"
                      disabled={isLoading}
                    />

                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs bg-orange-50 text-orange-600 border-orange-200">
                        {t("generator.textGenerationCost")}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {prompt.length}/500
                      </span>
                    </div>
                  </TabsContent>

                  {/* 多图合成选项卡内容 */}
                  <TabsContent value="images" className="space-y-4">
                    {/* 图片上传区域 */}
                    <div className="space-y-4">
                      <div
                        className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-[#FF8C42] transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-muted-foreground">
                          {t("imageMode.uploadPrompt")}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t("imageMode.supportedFormats")}
                        </p>
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />

                      {/* 已上传图片预览 */}
                      {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative">
                              <img
                                src={preview}
                                alt={t("imageMode.previewAlt", {index: index + 1})}
                                className="w-full h-20 object-cover rounded-lg"
                              />
                              <button
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 描述文字输入 */}
                    <Textarea
                      placeholder={t("imageMode.compositionPlaceholder")}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[80px] resize-none"
                      disabled={isLoading}
                    />

                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs bg-orange-50 text-orange-600 border-orange-200">
                        {t("credits.imageCompositionCost")}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {prompt.length}/500
                      </span>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* 生成按钮 */}
                <Button
                  onClick={handleGenerate}
                  disabled={
                    isLoading ||
                    (activeTab === "text" && (!prompt.trim() || prompt.length > 500)) ||
                    (activeTab === "images" && (selectedImages.length === 0 || !prompt.trim() || prompt.length > 500))
                  }
                  className="w-full bg-[#FF8C42] hover:bg-[#FF8C42]/90 text-white"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("generator.generating")}
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2 h-4 w-4" />
                      {activeTab === "text" ? t("generator.generate") : t("imageMode.startComposition")}
                    </>
                  )}
                </Button>

                {error && (
                  <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 结果区域 */}
            <Card className={!isSignedIn ? "pointer-events-none" : ""}>
              <CardHeader>
                <CardTitle>{t("result.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading && (
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-[#FF8C42]" />
                      <p className="text-sm text-muted-foreground">{t("result.processing")}</p>
                    </div>
                  </div>
                )}

                {result && (
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={result.outputImageUrl}
                        alt={t("result.altText")}
                        className="w-full aspect-square object-cover rounded-lg shadow-lg"
                      />
                      <div className="absolute bottom-4 right-4">
                        <Badge variant="secondary">
                          {result.processingTime}ms
                        </Badge>
                      </div>
                    </div>

                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      className="w-full"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {t("result.download")}
                    </Button>
                  </div>
                )}

                {!isLoading && !result && (
                  <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200">
                    <div className="text-center">
                      <Camera className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-muted-foreground">
                        {t("result.placeholder")}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 简单说明 */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              {t("footer.description")}
            </p>
          </div>
        </div>
      </div>

      {/* 添加完整页面内容 */}
      <div className="bg-white">
        <WhatIsSection />
        <HowItWorksSection />
        <Features />
        <Examples />
        <PolaroidFAQ />
      </div>
    </div>
  );
}