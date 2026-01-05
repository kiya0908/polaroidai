"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
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
import Link from "next/link";

interface PolaroidFormProps {
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
  userCredit?: number;
}

export function PolaroidForm({ onSubmit, isLoading = false, userCredit = 0 }: PolaroidFormProps) {
  const t = useTranslations("PolaroidForm");

  // 动态创建验证 schema，使用多语言错误消息
  const polaroidFormSchema = useMemo(() => z.object({
    input_type: z.enum(['text', 'image']),
    input_content: z.string().min(1, t("validation.contentRequired")).max(500, t("validation.contentTooLong")).optional(),
    input_image_url: z.string().url(t("validation.invalidUrl")).optional(),
    style_type: z.string().default('classic_polaroid'),
    is_private: z.boolean().default(false),
    locale: z.string().default('zh'),
  }), [t]);

  type PolaroidFormData = z.infer<typeof polaroidFormSchema>;

  // 动态风格选项
  const STYLE_OPTIONS = useMemo(() => [
    { value: 'classic_polaroid', label: t("style.classic_polaroid.label"), description: t("style.classic_polaroid.description") },
    { value: 'vintage_sepia', label: t("style.vintage_sepia.label"), description: t("style.vintage_sepia.description") },
    { value: 'dreamy_soft', label: t("style.dreamy_soft.label"), description: t("style.dreamy_soft.description") },
    { value: 'high_contrast', label: t("style.high_contrast.label"), description: t("style.high_contrast.description") },
  ], [t]);

  const CREDIT_COSTS = {
    text: 5,
    image: 8,
  };

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
      toast.error(t("errors.insufficientCredits", { required: requiredCredit, current: userCredit }));
      return;
    }

    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(t("errors.submitFailed"));
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
          {t("title")}
        </CardTitle>
        <CardDescription>
          {t("description")}
        </CardDescription>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="bg-polaroid-cream text-polaroid-brown">
            {t("credits.current")}: {userCredit}
          </Badge>
          <Badge variant="outline" className="border-polaroid-orange text-polaroid-orange">
            {t("credits.required")}: {currentCreditCost} {t("inputType.credits")}
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
                  <FormLabel>{t("inputType.label")}</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        type="button"
                        variant={inputType === 'text' ? 'default' : 'outline'}
                        className={inputType === 'text' ? 'bg-polaroid-orange hover:bg-polaroid-orange/90' : ''}
                        onClick={() => handleInputTypeChange('text')}
                      >
                        {t("inputType.text")} ({CREDIT_COSTS.text}{t("inputType.credits")})
                      </Button>
                      <Button
                        type="button"
                        variant={inputType === 'image' ? 'default' : 'outline'}
                        className={inputType === 'image' ? 'bg-polaroid-orange hover:bg-polaroid-orange/90' : ''}
                        onClick={() => handleInputTypeChange('image')}
                      >
                        {t("inputType.image")} ({CREDIT_COSTS.image}{t("inputType.credits")})
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
                    <FormLabel>{t("inputContent.label")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("inputContent.placeholder")}
                        className="min-h-[120px] resize-none"
                        maxLength={500}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t("inputContent.description")} ({field.value?.length || 0}/500)
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
                    <FormLabel>{t("imageUrl.label")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("imageUrl.placeholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t("imageUrl.description")}
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
                  <FormLabel>{t("style.label")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("style.placeholder")} />
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
                    <FormLabel className="text-base">{t("privacy.label")}</FormLabel>
                    <FormDescription>
                      {t("privacy.description")}
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
                    {t("submit.generating")}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    {t("submit.button")}
                  </>
                )}
              </Button>
            </div>

            {!canSubmit && !isLoading && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {t("errors.notEnoughCredits", { credits: currentCreditCost })}
                </p>
                <Button variant="link" className="text-polaroid-orange" asChild>
                  <Link href="/app/order">
                    {t("actions.recharge")}
                  </Link>
                </Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
