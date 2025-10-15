// Nano Banana API 配置
const NANO_BANANA_API_BASE = "https://api.grsai.com"; // 使用海外节点，SSL证书正常
const API_KEY = process.env.NANO_BANANA_API_KEY; // 需要在环境变量中配置

interface NanoBananaRequest {
  model: string;
  prompt: string;
  webHook?: string;
  shutProgress?: boolean;
  urls?: string[];
}

interface NanoBananaResponse {
  code: number;
  msg: string;
  data?: {
    id: string;
    results?: Array<{
      url: string;
      content: string;
    }>;
    progress: number;
    status: 'running' | 'succeeded' | 'failed';
    failure_reason?: string;
    error?: string;
  };
}

// Polaroid 风格提示词模板（基于专业指南优化）
export const POLAROID_PROMPT_TEMPLATES = {
  // 基础 Polaroid 风格描述
  base: "4K HD vintage instant camera photograph, film aesthetic, white border frame, soft grain film texture, soft focus edges, nostalgic retro aesthetic, candid moment, vintage color palette, slightly faded colors, authentic film photography, no text, no writing, no labels, no watermarks",

  // 负面提示词（避免的元素）
  negative: "digital art, modern photography, oversaturated colors, perfect sharp focus, professional studio lighting, digital filters, anime, cartoon, painting, drawing, artificial, fake, unrealistic, text, writing, words, labels, watermarks, signatures, logos",

  // 人像专用
  portrait: "vintage instant camera portrait photograph of a person, candid expression, soft natural lighting, keep facial features exact, nostalgic mood, film grain texture, white border frame, retro aesthetic, instant camera shot",

  // 情侣/双人照专用
  couple: "vintage instant camera photograph of people together, candid romantic moment, soft dreamy lighting, nostalgic atmosphere, film grain, white border frame, retro aesthetic, instant camera photography",

  // 风景专用
  landscape: "vintage instant camera landscape photograph, dreamy scenery, soft focus background, golden hour lighting, film grain texture, muted vintage colors, nostalgic mood, white border frame, instant camera aesthetic",

  // 静物专用
  stillLife: "vintage instant camera photograph of objects, minimalist composition, soft lighting, film grain texture, nostalgic mood, white border frame, retro color palette, instant camera shot, candid arrangement",

  // 城市/街景专用
  urban: "vintage instant camera street photography, urban background, candid city moment, soft grain film texture, nostalgic atmosphere, white border frame, retro aesthetic, instant camera shot",

  // 派对/聚会专用
  party: "vintage instant camera party photograph, retro party scene, candid fun moment, soft lighting, film grain texture, nostalgic 80s-90s vibe, white border frame, instant camera photography"
};

// 生成完整的 Polaroid 提示词（基于专业模板结构）
export function buildPolaroidPrompt(userDescription: string, style: 'portrait' | 'couple' | 'landscape' | 'stillLife' | 'urban' | 'party' = 'portrait'): string {
  const styleTemplate = POLAROID_PROMPT_TEMPLATES[style];
  const baseTemplate = POLAROID_PROMPT_TEMPLATES.base;

  // 专业模板结构：主题 + 设置 + 风格效果 + 明确要求无文字
  return `A ${styleTemplate} of ${userDescription}. ${baseTemplate}. Keep original essence and details accurate. Clean image without any text or letters visible.`;
}

// 调用 Nano Banana 生成图片
export async function generateImageWithNanoBanana(params: {
  userPrompt: string;
  style?: 'portrait' | 'couple' | 'landscape' | 'stillLife' | 'urban' | 'party';
  referenceImages?: string[]; // 参考图片的data URL数组
}): Promise<{
  success: boolean;
  data?: { image_url: string };
  error?: string;
}> {

  if (!API_KEY) {
    throw new Error("Nano Banana API key not configured");
  }

  const { userPrompt, style = 'portrait', referenceImages } = params;

  // 构建完整的 Polaroid 提示词
  const fullPrompt = buildPolaroidPrompt(userPrompt, style);

  const requestData: NanoBananaRequest = {
    model: "nano-banana-fast",
    prompt: fullPrompt,
    webHook: "-1", // 使用轮询模式
    shutProgress: false
  };

  // 如果有参考图片，添加到请求中
  if (referenceImages && referenceImages.length > 0) {
    requestData.urls = referenceImages;
  }

  try {
    // 第一步：提交生成任务
    const generateResponse = await fetch(`${NANO_BANANA_API_BASE}/v1/draw/nano-banana`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(requestData),
    });

    if (!generateResponse.ok) {
      throw new Error(`Generation request failed: ${generateResponse.status}`);
    }

    const generateData: NanoBananaResponse = await generateResponse.json();

    if (generateData.code !== 0 || !generateData.data?.id) {
      throw new Error(`Failed to create generation task: ${generateData.msg}`);
    }

    const taskId = generateData.data.id;

    // 第二步：轮询获取结果
    const result = await pollGenerationResult(taskId);

    return result;

  } catch (error) {
    console.error('Nano Banana API error:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
  }
}

// 轮询获取生成结果
async function pollGenerationResult(taskId: string, maxAttempts: number = 30): Promise<{
  success: boolean;
  data?: { image_url: string };
  error?: string;
}> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(`${NANO_BANANA_API_BASE}/v1/draw/result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({ id: taskId }),
      });

      if (!response.ok) {
        throw new Error(`Result request failed: ${response.status}`);
      }

      const data: NanoBananaResponse = await response.json();

      if (data.code === 0 && data.data?.status === 'succeeded' && data.data?.results?.[0]?.url) {
        return {
          success: true,
          data: {
            image_url: data.data.results[0].url
          }
        };
      }

      if (data.code === 0 && data.data?.status === 'failed') {
        return {
          success: false,
          error: data.data.failure_reason || data.data.error || 'Generation failed'
        };
      }

      // 如果还在处理中，等待2秒后继续轮询
      if (data.code === 0 && data.data?.status === 'running') {
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }

      throw new Error('Unexpected response format');

    } catch (error) {
      if (attempt === maxAttempts - 1) {
        return {
          success: false,
          error: 'Generation timeout or failed'
        };
      }

      // 等待2秒后重试
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  return {
    success: false,
    error: 'Generation timeout'
  };
}

// MVP专用：基于用户输入智能选择风格
export function detectImageStyle(userPrompt: string): 'portrait' | 'couple' | 'landscape' | 'stillLife' | 'urban' | 'party' {
  const lowerPrompt = userPrompt.toLowerCase();

  // 情侣/双人照关键词
  const coupleKeywords = ['couple', 'two people', 'together', 'romantic', 'boyfriend', 'girlfriend', 'love', 'kiss', 'hug', '情侣', '两人', '一起', '浪漫', '男朋友', '女朋友', '恋人', '拥抱', '亲吻'];

  // 人像关键词
  const portraitKeywords = ['person', 'man', 'woman', 'boy', 'girl', 'face', 'smile', 'portrait', 'selfie', '人', '男', '女', '脸', '笑', '肖像', '人物', '自拍'];

  // 风景关键词
  const landscapeKeywords = ['landscape', 'scenery', 'mountain', 'beach', 'forest', 'sky', 'sunset', 'sunrise', 'nature', 'ocean', 'lake', '风景', '山', '海', '森林', '天空', '日落', '自然', '湖泊'];

  // 城市/街景关键词
  const urbanKeywords = ['city', 'street', 'building', 'urban', 'downtown', 'road', 'traffic', 'metro', 'subway', '城市', '街道', '建筑', '市区', '地铁', '交通'];

  // 派对/聚会关键词
  const partyKeywords = ['party', 'celebration', 'birthday', 'friends', 'fun', 'dance', 'music', 'club', 'bar', '派对', '聚会', '生日', '朋友', '庆祝', '跳舞', '音乐'];

  // 静物关键词
  const stillLifeKeywords = ['object', 'thing', 'food', 'flower', 'book', 'coffee', 'table', 'cup', 'plate', '物品', '食物', '花', '书', '咖啡', '桌子', '杯子', '盘子'];

  // 按优先级检测风格
  for (const keyword of coupleKeywords) {
    if (lowerPrompt.includes(keyword)) return 'couple';
  }

  for (const keyword of partyKeywords) {
    if (lowerPrompt.includes(keyword)) return 'party';
  }

  for (const keyword of urbanKeywords) {
    if (lowerPrompt.includes(keyword)) return 'urban';
  }

  for (const keyword of portraitKeywords) {
    if (lowerPrompt.includes(keyword)) return 'portrait';
  }

  for (const keyword of landscapeKeywords) {
    if (lowerPrompt.includes(keyword)) return 'landscape';
  }

  for (const keyword of stillLifeKeywords) {
    if (lowerPrompt.includes(keyword)) return 'stillLife';
  }

  // 默认使用人像风格
  return 'portrait';
}