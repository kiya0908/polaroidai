//语言选项设置：默认语言、支持语言、路径配置、语言前缀、端口、主机
import { LocalePrefix, Pathnames } from "next-intl/routing";

export const defaultLocale = "en" as const;
export const locales = [
  // MVP: Only Chinese and English
  "en",
  "zh",
] as const;

export type Locale = (typeof locales)[number];

export const pathnames: Pathnames<typeof locales> = {
  "/": "/",
  "/blog": "/blog",
  "/flux-schnell": "/flux-schnell",
  "/flux-prompt-generator": "/flux-prompt-generator",
};

export const localePrefix: LocalePrefix<typeof locales> = "as-needed";

export const port = process.env.PORT || 3000;
export const host = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : `http://localhost:${port}`;
