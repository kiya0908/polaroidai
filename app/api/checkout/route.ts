import { Checkout } from "@creem_io/nextjs";

import { env } from "@/env.mjs";

export const GET = Checkout({
  apiKey: env.CREEM_API_KEY,
  testMode: true, // 测试环境
  defaultSuccessUrl: "/app?success=true",
});
