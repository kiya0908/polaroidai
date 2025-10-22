import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://polaroidai.pro";
  
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/_next/",
          "/admin/",
          "/blocked/",
          "/confirm/",
          "/*.json$",
        ],
      },
      // 允许搜索引擎访问公开内容
      {
        userAgent: "Googlebot",
        allow: ["/", "/en/", "/zh/", "/blog/", "/explore/", "/pricing/"],
        disallow: ["/api/", "/_next/", "/admin/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
