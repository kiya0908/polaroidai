import { SidebarNavItem, SiteConfig } from "types";
import { env } from "@/env.mjs";

const site_url = env.NEXT_PUBLIC_SITE_URL;

export const siteConfig: SiteConfig = {
  name: "Polaroid AI Photo Generator",
  description:
    "Transform your memories into authentic vintage Polaroid photos with AI. Create nostalgic instant photos from text descriptions or upload your images for Polaroid-style conversion.",
  url: site_url || "http://localhost:3000",
  ogImage: `${site_url || "http://localhost:3000"}/og.png`,
  links: {
    twitter: "https://x.com/polaroidai",
    github: "https://github.com/polaroidai",
  },
  mailSupport: "support@polaroidai.art",
};
