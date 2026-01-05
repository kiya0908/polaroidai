"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAuth, useUser } from "@clerk/nextjs";
import { PolaroidForm } from "@/components/forms/polaroid-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Camera, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// 积分消耗配置
const CREDITS_CONFIG = {
  textGeneration: 5,
  imageConversion: 8,
};

export default function GeneratePage() {
  const t = useTranslations("GeneratePage");
  const { getToken } = useAuth();
  const { isLoaded, isSignedIn } = useUser();
  const [credits, setCredits] = useState(0);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  // 获取用户积分
  const fetchCredits = async () => {
    try {
      const token = await getToken();
      const res = await fetch("/api/account", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCredits(data.credit || 0);
      }
    } catch (error) {
      console.error("Failed to fetch credits:", error);
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      fetchCredits();
    }
  }, [isSignedIn]);

  const handleGenerate = async (formData: any) => {
    setIsGenerating(true);

    try {
      const creditCost = formData.input_type === 'text'
        ? CREDITS_CONFIG.textGeneration
        : CREDITS_CONFIG.imageConversion;

      // 检查积分是否足够
      if (credits < creditCost) {
        toast.error(t("toast.insufficientCredits"));
        return;
      }

      const token = await getToken();

      // 调用生成API
      const response = await fetch('/api/polaroid-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(t("errors.generationFailed"));
      }

      const result = await response.json();

      if (result.imageUrl) {
        setGeneratedImage(result.imageUrl);
        toast.success(t("toast.generateSuccess"));
      }

      // 刷新积分
      fetchCredits();

    } catch (error) {
      console.error('Generation error:', error);
      toast.error(t("toast.generateFailed"));
      // 刷新积分
      fetchCredits();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedImage) return;

    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `polaroid-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success(t("toast.downloadSuccess"));
    } catch (error) {
      toast.error(t("toast.downloadFailed"));
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-polaroid-orange" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* 页面标题 */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-polaroid-brown flex items-center justify-center gap-2">
          <Camera className="w-8 h-8 text-polaroid-orange" />
          {t("title")}
        </h1>
        <p className="text-muted-foreground">
          {t("subtitle.user")}
        </p>
        <Badge variant="outline" className="border-polaroid-orange text-polaroid-orange">
          <Sparkles className="w-3 h-3 mr-1" />
          {t("credits")}: {credits}
        </Badge>
      </div>

      {/* 生成表单 */}
      <PolaroidForm
        onSubmit={handleGenerate}
        isLoading={isGenerating}
        userCredit={credits}
      />

      {/* 生成结果展示 */}
      {generatedImage && (
        <Card className="max-w-2xl mx-auto vintage-gradient retro-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-polaroid-brown">
              <Sparkles className="w-5 h-5 text-polaroid-orange" />
              {t("result.title")}
            </CardTitle>
            <CardDescription>
              {t("result.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-square max-w-md mx-auto rounded-lg overflow-hidden shadow-lg">
              <img
                src={generatedImage}
                alt={t("result.alt")}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex justify-center gap-4">
              <Button
                onClick={handleDownload}
                className="bg-polaroid-orange hover:bg-polaroid-orange/90"
              >
                <Download className="w-4 h-4 mr-2" />
                {t("buttons.download")}
              </Button>
              <Button
                variant="outline"
                onClick={() => setGeneratedImage(null)}
              >
                {t("buttons.continue")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}