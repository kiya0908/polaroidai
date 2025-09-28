"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

// 表单验证Schema
const polaroidFormSchema = z.object({
  input_type: z.enum(['text', 'image']),
  input_content: z.string().min(1, "请输入描述内容").max(500, "描述内容不能超过500字符").optional(),
  input_image_url: z.string().url("请输入有效的图片URL").optional(),
  style_type: z.string().default('classic_polaroid'),
  is_private: z.boolean().default(false),
  locale: z.string().default('zh'),
});

type PolaroidFormData = z.infer<typeof polaroidFormSchema>;

interface PolaroidFormProps {
  onSubmit: (data: PolaroidFormData) => Promise<void>;
  isLoading?: boolean;
  userCredit?: number;
}

const STYLE_OPTIONS = [
  { value: 'classic_polaroid', label: '经典宝丽来', description: '经典白边框，温暖色调' },
  { value: 'vintage_sepia', label: '复古棕褐', description: '怀旧棕褐色调，浓郁复古感' },
  { value: 'dreamy_soft', label: '梦幻柔和', description: '柔和光线，梦幻氛围' },
  { value: 'high_contrast', label: '高对比度', description: '强烈对比，鲜明视觉' },
];

const CREDIT_COSTS = {
  text: 5,
  image: 8,
};

export function PolaroidForm({ onSubmit, isLoading = false, userCredit = 0 }: PolaroidFormProps) {
  const [inputType, setInputType] = useState<'text' | 'image'>('text');

  const form = useForm<PolaroidFormData>({
    resolver: zodResolver(polaroidFormSchema),
    defaultValues: {
      input_type: 'text',
      style_type: 'classic_polaroid',
      is_private: false,
      locale: 'zh',
    },
  });

  const handleSubmit = async (data: PolaroidFormData) => {
    const requiredCredit = CREDIT_COSTS[data.input_type];
    
    if (userCredit < requiredCredit) {
      toast.error(`积分不足！需要 ${requiredCredit} 积分，当前只有 ${userCredit} 积分`);
      return;
    }

    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('提交失败，请重试');
    }
  };

  const handleInputTypeChange = (type: 'text' | 'image') => {
    setInputType(type);
    form.setValue('input_type', type);
    // 清空相关字段
    if (type === 'text') {
      form.setValue('input_image_url', '');
    } else {
      form.setValue('input_content', '');
    }
  };

  const currentCreditCost = CREDIT_COSTS[inputType];
  const canSubmit = userCredit >= currentCreditCost && !isLoading;

  return (
    <Card className="w-full max-w-2xl mx-auto vintage-gradient retro-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-polaroid-brown">
          <Sparkles className="w-5 h-5 text-polaroid-orange" />
          创建宝丽来照片
        </CardTitle>
        <CardDescription>
          选择输入方式并配置生成参数
        </CardDescription>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="bg-polaroid-cream text-polaroid-brown">
            当前积分: {userCredit}
          </Badge>
          <Badge variant="outline" className="border-polaroid-orange text-polaroid-orange">
            需要: {currentCreditCost} 积分
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* 输入类型选择 */}
            <FormField
              control={form.control}
              name="input_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>输入类型</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        type="button"
                        variant={inputType === 'text' ? 'default' : 'outline'}
                        className={inputType === 'text' ? 'bg-polaroid-orange hover:bg-polaroid-orange/90' : ''}
                        onClick={() => handleInputTypeChange('text')}
                      >
                        文字生成 ({CREDIT_COSTS.text}积分)
                      </Button>
                      <Button
                        type="button"
                        variant={inputType === 'image' ? 'default' : 'outline'}
                        className={inputType === 'image' ? 'bg-polaroid-orange hover:bg-polaroid-orange/90' : ''}
                        onClick={() => handleInputTypeChange('image')}
                      >
                        图片转换 ({CREDIT_COSTS.image}积分)
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 文字输入 */}
            {inputType === 'text' && (
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
            )}

            {/* 图片URL输入 */}
            {inputType === 'image' && (
              <FormField
                control={form.control}
                name="input_image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>图片URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/image.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      输入要转换的图片URL地址
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* 风格选择 */}
            <FormField
              control={form.control}
              name="style_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>宝丽来风格</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择宝丽来风格" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STYLE_OPTIONS.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                          <div>
                            <div className="font-medium">{style.label}</div>
                            <div className="text-sm text-muted-foreground">
                              {style.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 隐私设置 */}
            <FormField
              control={form.control}
              name="is_private"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">私有生成</FormLabel>
                    <FormDescription>
                      开启后，生成的图片不会在公开画廊中显示
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* 提交按钮 */}
            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                size="lg"
                disabled={!canSubmit}
                className="bg-polaroid-orange hover:bg-polaroid-orange/90 text-white px-8 py-3 text-lg font-semibold shadow-lg"
              >
                {isLoading ? (
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

            {!canSubmit && !isLoading && (
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
      </CardContent>
    </Card>
  );
}