import { MetadataRoute } from "next";
// Note: Avoid DB access in sitemap to prevent failures in dev/build

import { allPosts } from "contentlayer/generated";

import { defaultLocale, locales, pathnames } from "@/config";
import { env } from "@/env.mjs";
import { getPathname } from "@/lib/navigation";
import { siteConfig } from "@/config/site";

const getFluxUrl = async () => {
  // Defer dynamic URLs to future iterations; keep sitemap robust in dev
  return [] as string[];
};
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const keys = Object.keys(pathnames) as Array<keyof typeof pathnames>;
  // posts 读取容错
  let posts: string[] = [];
  try {
    posts = await Promise.all(
      allPosts
        .filter((post) => post.published && post.language === defaultLocale)
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((post) => post.slug?.replace(`/${defaultLocale}`, "")),
    );
  } catch (error) {
    console.warn("sitemap: failed to load posts, use empty list.", error);
    posts = [];
  }
  // 依赖数据库的 explore 分页容错
  const explorePages: string[] = [];

  function getUrl(
    key: keyof typeof pathnames,
    locale: (typeof locales)[number],
  ) {
    const pathname = getPathname({ locale, href: key });
    const rawBase = env.NEXT_PUBLIC_SITE_URL || siteConfig.url || "http://localhost:3000";
    const base = rawBase.replace(/\/+$/, "");
    const localePath = locale === defaultLocale ? "" : `/${locale}`;
    const path = pathname === "/" ? "" : pathname;
    return `${base}${localePath}${path}`;
  }

  // return [...posts, ...keys].map((key) => ({
  //   url: getUrl(key, defaultLocale),
  //   priority: 0.7,
  //   changeFrequency: 'daily',
  //   alternates: {
  //     languages: Object.fromEntries(
  //       locales.map((locale) => [locale, getUrl(key, locale)]),
  //     ),
  //   },
  // }));
  const fluxUrls = await getFluxUrl();

  const items = [...posts, ...keys, ...fluxUrls, ...explorePages];
  if (items.length === 0) {
    // 最小化站点地图，避免 500
    const rawBase = env.NEXT_PUBLIC_SITE_URL || siteConfig.url || "http://localhost:3000";
    const base = rawBase.replace(/\/+$/, "");
    return [
      { url: `${base}/`, priority: 0.7, changeFrequency: "daily" as const },
      ...locales
        .filter((l) => l !== defaultLocale)
        .map((l) => ({ url: `${base}/${l}`, priority: 0.5, changeFrequency: "daily" as const })),
    ];
  }

  return items.flatMap((key) =>
    locales.map((locale) => ({
      url: getUrl(key as keyof typeof pathnames, locale),
      priority: 0.7,
      changeFrequency: "daily" as const,
    })),
  );
}
