import { NextResponse } from "next/server";
import { generateImageWithNanoBanana, detectImageStyle } from "@/lib/nano-banana";
import { MVP_CONFIG } from "@/lib/mvp-config";

// 强制此路由为动态，防止构建时静态化
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

// 文件上传限制配置
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGES = 5;
const MIN_IMAGES = 1;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// 将文件转换为base64 data URL
async function fileToDataUrl(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  return `data:${file.type};base64,${base64}`;
}

// 验证图片文件
function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: `不支持的文件格式: ${file.type}。支持的格式: ${ALLOWED_IMAGE_TYPES.join(', ')}` };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `文件大小超过限制: ${(file.size / 1024 / 1024).toFixed(1)}MB > ${MAX_FILE_SIZE / 1024 / 1024}MB` };
  }

  return { valid: true };
}

export async function POST(request: Request) {
  try {
    let type: string;
    let content: string;
    let images: File[] = [];

    // 检查Content-Type来决定解析方式
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      // 处理FormData格式的请求
      const formData = await request.formData();

      type = formData.get('type') as string;
      content = formData.get('content') as string || '';

      // 提取所有图片文件
      const imageFiles = formData.getAll('images');
      for (const file of imageFiles) {
        if (file instanceof File) {
          images.push(file);
        }
      }
    } else {
      // 处理JSON格式的请求（向后兼容）
      const body = await request.json();
      type = body.type;
      content = body.content;
    }

    // 基础类型验证
    if (!type || !['text', 'multiImage'].includes(type)) {
      return NextResponse.json(
        { success: false, error: { message: "不支持的生成类型。支持的类型: text, multiImage" } },
        { status: 400 }
      );
    }

    // 根据类型进行不同的验证
    if (type === 'text') {
      // text类型验证（保持原有逻辑）
      if (!content || content.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: { message: "请输入文字描述" } },
          { status: 400 }
        );
      }

      if (content.length > 500) {
        return NextResponse.json(
          { success: false, error: { message: "描述文字不能超过500字符" } },
          { status: 400 }
        );
      }
    } else if (type === 'multiImage') {
      // multiImage类型验证
      if (images.length < MIN_IMAGES) {
        return NextResponse.json(
          { success: false, error: { message: `至少需要上传${MIN_IMAGES}张图片` } },
          { status: 400 }
        );
      }

      if (images.length > MAX_IMAGES) {
        return NextResponse.json(
          { success: false, error: { message: `最多只能上传${MAX_IMAGES}张图片` } },
          { status: 400 }
        );
      }

      // 验证每张图片
      for (let i = 0; i < images.length; i++) {
        const validation = validateImageFile(images[i]);
        if (!validation.valid) {
          return NextResponse.json(
            { success: false, error: { message: `第${i + 1}张图片${validation.error}` } },
            { status: 400 }
          );
        }
      }

      // 文字描述对于multiImage是可选的，但如果提供了要验证长度
      if (content && content.length > 500) {
        return NextResponse.json(
          { success: false, error: { message: "描述文字不能超过500字符" } },
          { status: 400 }
        );
      }
    }

    // 记录开始时间
    const startTime = Date.now();

    let result;

    if (type === 'text') {
      // 原有的文字生成逻辑
      const detectedStyle = detectImageStyle(content);
      console.log(`Detected style: ${detectedStyle} for prompt: "${content}"`);

      result = await generateImageWithNanoBanana({
        userPrompt: content,
        style: detectedStyle,
      });

      const processingTime = Date.now() - startTime;

      if (result.success && result.data?.image_url) {
        return NextResponse.json({
          success: true,
          data: {
            id: `mvp-${Date.now()}`,
            outputImageUrl: result.data.image_url,
            processingTime: processingTime,
            detectedStyle: detectedStyle,
          },
        });
      }
    } else if (type === 'multiImage') {
      // 多图片生成逻辑
      try {
        // 将图片转换为data URL格式
        const imageUrls: string[] = [];
        for (const image of images) {
          const dataUrl = await fileToDataUrl(image);
          imageUrls.push(dataUrl);
        }

        // 如果有文字描述，结合文字和图片；否则仅基于图片
        const prompt = content ? content : "Generate a polaroid-style image based on the provided reference images";
        const detectedStyle = content ? detectImageStyle(content) : 'portrait';

        console.log(`Processing ${images.length} images with style: ${detectedStyle}, prompt: "${prompt}"`);

        result = await generateImageWithNanoBanana({
          userPrompt: prompt,
          style: detectedStyle,
          referenceImages: imageUrls, // 传递参考图片
        });

        const processingTime = Date.now() - startTime;

        if (result.success && result.data?.image_url) {
          return NextResponse.json({
            success: true,
            data: {
              id: `mvp-${Date.now()}`,
              outputImageUrl: result.data.image_url,
              processingTime: processingTime,
              detectedStyle: detectedStyle,
              inputImageCount: images.length,
            },
          });
        }
      } catch (error) {
        console.error('多图片处理失败:', error);
        return NextResponse.json(
          {
            success: false,
            error: {
              message: "图片处理失败，请检查图片格式和大小"
            }
          },
          { status: 400 }
        );
      }
    }

    // 通用的生成失败处理
    return NextResponse.json(
      {
        success: false,
        error: {
          message: result?.error || "图片生成失败，请稍后重试"
        }
      },
      { status: 500 }
    );

  } catch (error) {
    console.error("MVP生成失败:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: "服务异常，请稍后重试。如果问题持续，请联系技术支持。"
        }
      },
      { status: 500 }
    );
  }
}