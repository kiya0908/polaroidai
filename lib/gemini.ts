export type GeminiGenerateParams = {
  type: "text" | "image";
  content?: string;
  imageUrl?: string;
  style?: string;
  locale?: string;
};

export type GeminiGenerateResult = {
  outputImageUrl: string;
  thumbnailUrl?: string;
  requestId: string;
  response: unknown;
};

export async function generatePolaroidImage(): Promise<GeminiGenerateResult> {
  throw new Error(
    "Legacy Gemini generation is disabled. Use the KIE.ai MVP provider instead.",
  );
}
