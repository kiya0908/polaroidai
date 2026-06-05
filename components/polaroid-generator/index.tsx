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

// 琛ㄥ崟楠岃瘉Schema
const polaroidFormSchema = z.object({
  input_type: z.enum(['text', 'image']),
  input_content: z.string().max(500).optional(),
  input_image_url: z.string().url().optional(),
  style_type: z.string().default('classic_polaroid'),
  is_private: z.boolean().default(false),
});

type PolaroidFormData = z.infer<typeof polaroidFormSchema>;

// 绉垎娑堣垂瑙勫垯
const CREDIT_COSTS = {
  text: 5,   // 鏂囧瓧鐢熸垚锛?绉垎
  image: 8,  // 鍥剧墖杞崲锛?绉垎
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

  // 鐩戝惉tab鍒囨崲锛屾洿鏂拌〃鍗曟暟鎹?
  const handleTabChange = (value: string) => {
    const newType = value as 'text' | 'image';
    setActiveTab(newType);
    form.setValue('input_type', newType);
  };

  // 澶勭悊鍥剧墖涓婁紶
  const handleImageUpload = (imageUrl: string) => {
    setUploadedImageUrl(imageUrl);
    form.setValue('input_image_url', imageUrl);
  };

  // 鎻愪氦鐢熸垚璇锋眰
  const onSubmit = async (data: PolaroidFormData) => {
    const requiredCredit = CREDIT_COSTS[data.input_type];
    
    // 妫€鏌ョН鍒?
    if (userCredit < requiredCredit) {
      toast.error(`绉垎涓嶈冻锛侀渶瑕?${requiredCredit} 绉垎锛屽綋鍓嶅彧鏈?${userCredit} 绉垎`);
      return;
    }

    // 楠岃瘉杈撳叆
    if (data.input_type === 'text' && !data.input_content?.trim()) {
      toast.error('Please enter a text prompt');
      return;
    }
    if (data.input_type === 'image' && !data.input_image_url) {
      toast.error('Please upload an image');
      return;
    }

    setIsGenerating(true);
    
    try {
      throw new Error("Legacy generator is disabled. Please use the MVP generator page.");


      

    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error instanceof Error ? error.message : '鐢熸垚澶辫触锛岃閲嶈瘯');
    } finally {
      setIsGenerating(false);
    }
  };

  const currentCreditCost = CREDIT_COSTS[activeTab];
  const canGenerate = userCredit >= currentCreditCost;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* 鏍囬鍖哄煙 */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-polaroid-brown flex items-center justify-center gap-2">
          <Sparkles className="w-8 h-8 text-polaroid-orange" />
          瀹濅附鏉I鐢熸垚鍣?
        </h1>
        <p className="text-muted-foreground">
          灏嗘枃瀛楁弿杩版垨鐓х墖杞崲涓哄鍙ゅ疂涓芥潵椋庢牸鍥剧墖
        </p>
        <div className="flex items-center justify-center gap-4 text-sm">
          <Badge variant="secondary" className="bg-polaroid-cream text-polaroid-brown">
            褰撳墠绉垎: {userCredit}
          </Badge>
          <Badge variant="outline" className="border-polaroid-orange text-polaroid-orange">
            娑堣€? {currentCreditCost} 绉垎
          </Badge>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* 杈撳叆鏂瑰紡閫夋嫨 */}
          <Card className="vintage-gradient retro-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-polaroid-brown">
                閫夋嫨杈撳叆鏂瑰紡
              </CardTitle>
              <CardDescription>
                閫夋嫨鏂囧瓧鎻忚堪鐢熸垚鎴栦笂浼犲浘鐗囪浆鎹?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text" className="flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    鏂囧瓧鐢熸垚 ({CREDIT_COSTS.text}绉垎)
                  </TabsTrigger>
                  <TabsTrigger value="image" className="flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    鍥剧墖杞崲 ({CREDIT_COSTS.image}绉垎)
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-4 mt-6">
                  <FormField
                    control={form.control}
                    name="input_content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>鎻忚堪鍐呭</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="鎻忚堪浣犳兂瑕佺敓鎴愮殑瀹濅附鏉ョ収鐗囷紝渚嬪锛氫竴鍙彲鐖辩殑姗樼尗鍧愬湪绐楀彴涓婏紝闃冲厜閫忚繃绐楁埛娲掑湪瀹冭韩涓?.."
                            className="min-h-[120px] resize-none"
                            maxLength={500}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          鏈€澶?00瀛楃 ({field.value?.length || 0}/500)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="image" className="space-y-4 mt-6">
                  <div className="space-y-4">
                    <FormLabel>涓婁紶鍥剧墖</FormLabel>
                    <PolaroidImageUpload
                      onImageUpload={handleImageUpload}
                      uploadedImageUrl={uploadedImageUrl}
                    />
                    <FormDescription>
                      鏀寔 JPG銆丳NG 鏍煎紡锛屾渶澶?10MB
                    </FormDescription>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* 椋庢牸閫夋嫨 */}
          <Card className="vintage-gradient retro-shadow">
            <CardHeader>
              <CardTitle className="text-polaroid-brown">Polaroid style</CardTitle>
              <CardDescription>
                閫夋嫨浣犲枩娆㈢殑瀹濅附鏉ラ鏍兼晥鏋?
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

          {/* 鐢熸垚鎸夐挳 */}
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
                  鐢熸垚涓?..
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  鐢熸垚瀹濅附鏉ョ収鐗?
                </>
              )}
            </Button>
          </div>

          {!canGenerate && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                绉垎涓嶈冻锛岄渶瑕?{currentCreditCost} 绉垎
              </p>
              <Button variant="link" className="text-polaroid-orange">
                鍘诲厖鍊?
              </Button>
            </div>
          )}
        </form>
      </Form>

      {/* 鐢熸垚缁撴灉棰勮 */}
      {generatedResult && (
        <Card className="vintage-gradient retro-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-polaroid-brown">
              <Sparkles className="w-5 h-5 text-polaroid-orange" />
              鐢熸垚缁撴灉
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PolaroidPreview
              result={generatedResult}
              onDownload={() => {
                // 澶勭悊涓嬭浇閫昏緫
                toast.success('寮€濮嬩笅杞?..');
              }}
              onShare={() => {
                // 澶勭悊鍒嗕韩閫昏緫
                toast.success('Share link copied');
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default PolaroidGenerator;
