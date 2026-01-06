import { Checkout } from "@creem_io/nextjs";

// 强制动态渲染，避免在构建时预渲染
export const dynamic = 'force-dynamic';

import { env } from "@/env.mjs";

export const GET = Checkout({
  apiKey: env.CREEM_API_KEY,
  testMode: true, // 测试环境
  defaultSuccessUrl: "/app?success=true",
});
