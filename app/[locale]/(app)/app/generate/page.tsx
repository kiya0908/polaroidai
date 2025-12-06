"use client";

import { useState, useEffect } from "react";
import { useUnifiedAuth, useUnifiedCredits } from "@/lib/auth-adapter";
import { PolaroidForm } from "@/components/forms/polaroid-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Camera, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { isGuestMode, MVP_CONFIG } from "@/lib/mvp-config";
import { recordGeneration } from "@/lib/guest-auth";

export default function GeneratePage() {
  const { user, credits, isLoaded, isGuest } = useUnifiedAuth();
  const { deductCredits, refreshCredits } = useUnifiedCredits();
  const isMVP = isGuestMode();

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [localCredits, setLocalCredits] = useState(credits);

  // 同步积分状态
  useEffect(() => {
    setLocalCredits(credits);
  }, [credits]);

  const handleGenerate = async (formData: any) => {
    setIsGenerating(true);

    try {
      const creditCost = formData.input_type === 'text'
        ? MVP_CONFIG.credits.textGeneration
        : MVP_CONFIG.credits.imageConversion;

      // 扣除积分
      const deductSuccess = await deductCredits(creditCost);
      if (!deductSuccess) {
        toast.error("积分不足，请充值后再试");
        return;
      }

      // 更新本地积分显示
      setLocalCredits(prev => prev - creditCost);

      // 调用生成API
      const response = await fetch('/api/polaroid-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userId: user?.id,
          isGuest: isGuest,
        }),
      });

      if (!response.ok) {
        throw new Error('生成失败');
      }

      const result = await response.json();

      if (result.imageUrl) {
        setGeneratedImage(result.imageUrl);
        toast.success("宝丽来照片生成成功！");

        // MVP模式下记录到localStorage
        if (isMVP) {
          recordGeneration({
            id: result.id || Date.now().toString(),
            prompt: formData.input_content || formData.input_image_url || '',
            imageUrl: result.imageUrl,
            type: formData.input_type,
            creditsUsed: creditCost,
            createdAt: Date.now(),
          });
        }
      }

      // 刷新积分
      refreshCredits();

    } catch (error) {
      console.error('Generation error:', error);
      toast.error("生成失败，请重试");
      // 刷新积分（可能需要回滚）
      refreshCredits();
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
      toast.success("下载成功！");
    } catch (error) {
      toast.error("下载失败，请重试");
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
          生成宝丽来照片
        </h1>
        <p className="text-muted-foreground">
          {isGuest ? "游客模式 - 使用本地积分" : "登录用户 - 使用账户积分"}
        </p>
        <Badge variant="outline" className="border-polaroid-orange text-polaroid-orange">
          <Sparkles className="w-3 h-3 mr-1" />
          当前积分: {localCredits}
        </Badge>
      </div>

      {/* 生成表单 */}
      <PolaroidForm
        onSubmit={handleGenerate}
        isLoading={isGenerating}
        userCredit={localCredits}
      />

      {/* 生成结果展示 */}
      {generatedImage && (
        <Card className="max-w-2xl mx-auto vintage-gradient retro-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-polaroid-brown">
              <Sparkles className="w-5 h-5 text-polaroid-orange" />
              生成结果
            </CardTitle>
            <CardDescription>
              你的宝丽来照片已生成完成
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-square max-w-md mx-auto rounded-lg overflow-hidden shadow-lg">
              <img
                src={generatedImage}
                alt="Generated Polaroid"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex justify-center gap-4">
              <Button
                onClick={handleDownload}
                className="bg-polaroid-orange hover:bg-polaroid-orange/90"
              >
                <Download className="w-4 h-4 mr-2" />
                下载图片
              </Button>
              <Button
                variant="outline"
                onClick={() => setGeneratedImage(null)}
              >
                继续生成
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}