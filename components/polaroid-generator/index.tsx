"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Image, Type, Sparkles, Download, Share2 } from "lucide-react";
import { toast } from "sonner";

import { PolaroidImageUpload } from "./image-upload";
import { PolaroidPreview } from "./preview";
import { PolaroidStyleSelector } from "./style-selector";

// 表单验证Schema
const polaroidFormSchema = z.object({
  input_type: z.enum(['text', 'image']),
  input_content: z.string().max(500).optional(),
  input_image_url: z.string().url().optional(),
  style_type: z.string().default('classic_polaroid'),
  is_private: z.boolean().default(false),
});

type PolaroidFormData = z.infer<typeof polaroidFormSchema>;

// 积分消费规则
const CREDIT_COSTS = {
  text: 5,   // 文字生成：5积分
  image: 8,  // 图片转换：8积分
};

interface PolaroidGeneratorProps {
  userCredit?: number;
  onCreditUpdate?: (newCredit: number) => void;
}

function PolaroidGenerator({ userCredit = 0, onCreditUpdate }: PolaroidGeneratorProps) {
  const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');

  const form = useForm<PolaroidFormData>({
    resolver: zodResolver(polaroidFormSchema),
    defaultValues: {
      input_type: 'text',
      style_type: 'classic_polaroid',
      is_private: false,
    },
  });

  // 监听tab切换，更新表单数据
  const handleTabChange = (value: string) => {
    const newType = value as 'text' | 'image';
    setActiveTab(newType);
    form.setValue('input_type', newType);
  };

  // 处理图片上传
  const handleImageUpload = (imageUrl: string) => {
    setUploadedImageUrl(imageUrl);
    form.setValue('input_image_url', imageUrl);
  };

  // 提交生成请求
  const onSubmit = async (data: PolaroidFormData) => {
    const requiredCredit = CREDIT_COSTS[data.input_type];
    
    // 检查积分
    if (userCredit < requiredCredit) {
      toast.error(`积分不足！需要 ${requiredCredit} 积分，当前只有 ${userCredit} 积分`);
      return;
    }

    // 验证输入
    if (data.input_type === 'text' && !data.input_content?.trim()) {
      toast.error('请输入文字描述');
      return;
    }
    if (data.input_type === 'image' && !data.input_image_url) {
      toast.error('请上传图片');
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/polaroid-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '生成失败');
      }

      setGeneratedResult(result);
      toast.success('宝丽来图片生成成功！');
      
      // 更新用户积分
      if (onCreditUpdate) {
        onCreditUpdate(userCredit - requiredCredit);
      }

    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error instanceof Error ? error.message : '生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const currentCreditCost = CREDIT_COSTS[activeTab];
  const canGenerate = userCredit >= currentCreditCost;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* 标题区域 */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-polaroid-brown flex items-center justify-center gap-2">
          <Sparkles className="w-8 h-8 text-polaroid-orange" />
          宝丽来AI生成器
        </h1>
        <p className="text-muted-foreground">
          将文字描述或照片转换为复古宝丽来风格图片
        </p>
        <div className="flex items-center justify-center gap-4 text-sm">
          <Badge variant="secondary" className="bg-polaroid-cream text-polaroid-brown">
            当前积分: {userCredit}
          </Badge>
          <Badge variant="outline" className="border-polaroid-orange text-polaroid-orange">
            消耗: {currentCreditCost} 积分
          </Badge>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* 输入方式选择 */}
          <Card className="vintage-gradient retro-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-polaroid-brown">
                选择输入方式
              </CardTitle>
              <CardDescription>
                选择文字描述生成或上传图片转换
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text" className="flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    文字生成 ({CREDIT_COSTS.text}积分)
                  </TabsTrigger>
                  <TabsTrigger value="image" className="flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    图片转换 ({CREDIT_COSTS.image}积分)
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-4 mt-6">
                  <FormField
                    control={form.control}
                    name="input_content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>描述内容</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="描述你想要生成的宝丽来照片，例如：一只可爱的橘猫坐在窗台上，阳光透过窗户洒在它身上..."
                            className="min-h-[120px] resize-none"
                            maxLength={500}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          最多500字符 ({field.value?.length || 0}/500)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="image" className="space-y-4 mt-6">
                  <div className="space-y-4">
                    <FormLabel>上传图片</FormLabel>
                    <PolaroidImageUpload
                      onImageUpload={handleImageUpload}
                      uploadedImageUrl={uploadedImageUrl}
                    />
                    <FormDescription>
                      支持 JPG、PNG 格式，最大 10MB
                    </FormDescription>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* 风格选择 */}
          <Card className="vintage-gradient retro-shadow">
            <CardHeader>
              <CardTitle className="text-polaroid-brown">宝丽来风格</CardTitle>
              <CardDescription>
                选择你喜欢的宝丽来风格效果
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="style_type"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <PolaroidStyleSelector
                        value={field.value}
                        onValueChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* 生成按钮 */}
          <div className="flex justify-center">
            <Button
              type="submit"
              size="lg"
              disabled={!canGenerate || isGenerating}
              className="bg-polaroid-orange hover:bg-polaroid-orange/90 text-white px-8 py-3 text-lg font-semibold shadow-lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  生成宝丽来照片
                </>
              )}
            </Button>
          </div>

          {!canGenerate && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                积分不足，需要 {currentCreditCost} 积分
              </p>
              <Button variant="link" className="text-polaroid-orange">
                去充值
              </Button>
            </div>
          )}
        </form>
      </Form>

      {/* 生成结果预览 */}
      {generatedResult && (
        <Card className="vintage-gradient retro-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-polaroid-brown">
              <Sparkles className="w-5 h-5 text-polaroid-orange" />
              生成结果
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PolaroidPreview
              result={generatedResult}
              onDownload={() => {
                // 处理下载逻辑
                toast.success('开始下载...');
              }}
              onShare={() => {
                // 处理分享逻辑
                toast.success('复制分享链接成功！');
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default PolaroidGenerator;