import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    // 本地开发阶段放宽校验，避免缺少非核心变量导致启动失败。
    DATABASE_URL: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
    HASHID_SALT: z.string().optional(),
    VERCEL_ENV: z
      .enum(["development", "preview", "production"])
      .default("development"),
    UPSTASH_REDIS_REST_URL: z.string().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
    LINK_PREVIEW_API_BASE_URL: z.string().optional(),
    SITE_NOTIFICATION_EMAIL_TO: z.string().optional(),

    S3_ENDPOINT: z.string().optional(),
    S3_REGION: z.string().optional(),
    S3_ACCESS_KEY: z.string().optional(),
    S3_SECRET_KEY: z.string().optional(),
    S3_URL_BASE: z.string().optional(),
    S3_BUCKET: z.string().optional(),

    CREEM_API_KEY: z.string().optional(),
    CREEM_WEBHOOK_SECRET: z.string().optional(),
    WEBHOOK_SECRET: z.string().optional(),
    CLERK_SECRET_KEY: z.string().optional(),
    LOG_SNAG_TOKEN: z.string().optional(),
    TASK_HEADER_KEY: z.string().optional(),
    APP_ENV: z
      .enum(["development", "production", "staging"])
      .default("development"),
    KIE_AI_API_KEY: z.string().optional(),
    KIE_AI_BASE_URL: z.string().url().default("https://api.kie.ai"),
    KIE_IMAGE_SIZE: z.string().default("1:1"),
    KIE_IMAGE_ENABLE_FALLBACK: z.boolean().optional().default(false),
    KIE_IMAGE_FALLBACK_MODEL: z.string().default("FLUX_MAX"),
    KIE_IMAGE_UPLOAD_CN: z.boolean().optional().default(false),
    ADMIN_PASSWORD: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_SITE_URL: z.string().min(1),
    NEXT_PUBLIC_SITE_EMAIL_FROM: z.string().optional(),
    NEXT_PUBLIC_SITE_LINK_PREVIEW_ENABLED: z
      .boolean()
      .optional()
      .default(false),

    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),

    NEXT_PUBLIC_UMAMI_DATA_ID: z.string().optional(),
    NEXT_PUBLIC_GA_ID: z.string().optional(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    HASHID_SALT: process.env.HASHID_SALT,
    LOG_SNAG_TOKEN: process.env.LOG_SNAG_TOKEN,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    VERCEL_ENV: process.env.VERCEL_ENV,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SITE_EMAIL_FROM: process.env.NEXT_PUBLIC_SITE_EMAIL_FROM,
    NEXT_PUBLIC_SITE_LINK_PREVIEW_ENABLED:
      process.env.NEXT_PUBLIC_SITE_LINK_PREVIEW_ENABLED === "true",
    LINK_PREVIEW_API_BASE_URL: process.env.LINK_PREVIEW_API_BASE_URL,
    SITE_NOTIFICATION_EMAIL_TO: process.env.SITE_NOTIFICATION_EMAIL_TO,
    WEBHOOK_SECRET: process.env.WEBHOOK_SECRET,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    S3_ENDPOINT: process.env.S3_ENDPOINT,
    S3_REGION: process.env.S3_REGION,
    S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
    S3_SECRET_KEY: process.env.S3_SECRET_KEY,
    S3_URL_BASE: process.env.S3_URL_BASE,
    S3_BUCKET: process.env.S3_BUCKET,

    CREEM_API_KEY: process.env.CREEM_API_KEY,
    CREEM_WEBHOOK_SECRET: process.env.CREEM_WEBHOOK_SECRET,
    TASK_HEADER_KEY: process.env.TASK_HEADER_KEY,
    APP_ENV: process.env.APP_ENV,

    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
    NEXT_PUBLIC_UMAMI_DATA_ID: process.env.NEXT_PUBLIC_UMAMI_DATA_ID,

    KIE_AI_API_KEY: process.env.KIE_AI_API_KEY,
    KIE_AI_BASE_URL: process.env.KIE_AI_BASE_URL,
    KIE_IMAGE_SIZE: process.env.KIE_IMAGE_SIZE,
    KIE_IMAGE_ENABLE_FALLBACK:
      process.env.KIE_IMAGE_ENABLE_FALLBACK === "true",
    KIE_IMAGE_FALLBACK_MODEL: process.env.KIE_IMAGE_FALLBACK_MODEL,
    KIE_IMAGE_UPLOAD_CN: process.env.KIE_IMAGE_UPLOAD_CN === "true",
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  },
});
