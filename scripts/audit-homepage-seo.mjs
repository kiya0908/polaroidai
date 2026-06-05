import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const messages = JSON.parse(read("messages/en.json"));
const zhMessages = JSON.parse(read("messages/zh.json"));
const homepageRoute = read("app/[locale]/(marketing)/page.tsx");
const mvpRoute = read("app/[locale]/(marketing)/mvp-simple/page.tsx");
const homepageComponent = read("app/[locale]/(marketing)/mvp-simple.tsx");

const expected = {
  title: "Polaroid AI Photo Generator - Create Vintage Photos with AI",
  description:
    "Polaroid AI Photo Generator lets you instantly create retro, vintage-style Polaroid photos with realistic white borders and nostalgic film effects.",
  h1: "Polaroid AI Generator",
};

const expectedZh = {
  title: "宝丽来AI照片生成器 - 用AI创建复古照片",
  description:
    "使用AI将您的回忆转化为真实的复古宝丽来照片。从文字描述创建怀旧即时照片，或将您的图片转换为具有白边框和复古效果的经典宝丽来风格。",
  h1: "宝丽来AI生成器",
};

assert.equal(messages.LocaleLayout.title, expected.title, "Title changed");
assert.equal(
  messages.LocaleLayout.description,
  expected.description,
  "Meta description changed",
);
assert.equal(messages.MVP.title, expected.h1, "H1 changed");
assert.equal(
  zhMessages.LocaleLayout.title,
  expectedZh.title,
  "Chinese title changed",
);
assert.equal(
  zhMessages.LocaleLayout.description,
  expectedZh.description,
  "Chinese meta description changed",
);
assert.equal(zhMessages.MVP.title, expectedZh.h1, "Chinese H1 changed");

const requiredSections = ["whatIs", "howItWorks", "why", "features", "faq"];
for (const section of requiredSections) {
  assert.ok(messages.IndexPage[section], `Missing IndexPage.${section}`);
  assert.ok(
    zhMessages.IndexPage[section],
    `Missing Chinese IndexPage.${section}`,
  );
}

function collectStrings(value, result = []) {
  if (typeof value === "string") {
    result.push(value);
  } else if (value && typeof value === "object") {
    Object.values(value).forEach((item) => collectStrings(item, result));
  }
  return result;
}

const content = collectStrings({
  hero: {
    title: messages.MVP.title,
    subtitle: messages.MVP.subtitle,
    footer: messages.MVP.footer.description,
  },
  whatIs: messages.IndexPage.whatIs,
  howItWorks: messages.IndexPage.howItWorks,
  why: messages.IndexPage.why,
  features: {
    title: messages.IndexPage.features.title,
    description: messages.IndexPage.features.description,
    item1: messages.IndexPage.features.item1,
    item2: messages.IndexPage.features.item2,
    item3: messages.IndexPage.features.item3,
    item4: messages.IndexPage.features.item4,
    item5: messages.IndexPage.features.item5,
    item6: messages.IndexPage.features.item6,
  },
  faq: {
    title: messages.IndexPage.faq.title,
    subtitle: messages.IndexPage.faq.subtitle,
    item1: messages.IndexPage.faq.item1,
    item2: messages.IndexPage.faq.item2,
    item3: messages.IndexPage.faq.item3,
    item4: messages.IndexPage.faq.item4,
    item5: messages.IndexPage.faq.item5,
    item6: messages.IndexPage.faq.item6,
  },
}).join(" ");

const words = content.match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) ?? [];
const exactPhraseCount =
  content.match(/polaroid photo generator/gi)?.length ?? 0;
const weightedDensity = (exactPhraseCount * 3 * 100) / words.length;

const zhContent = collectStrings({
  hero: {
    title: zhMessages.MVP.title,
    subtitle: zhMessages.MVP.subtitle,
    footer: zhMessages.MVP.footer.description,
  },
  whatIs: zhMessages.IndexPage.whatIs,
  howItWorks: zhMessages.IndexPage.howItWorks,
  why: zhMessages.IndexPage.why,
  features: {
    title: zhMessages.IndexPage.features.title,
    description: zhMessages.IndexPage.features.description,
    item1: zhMessages.IndexPage.features.item1,
    item2: zhMessages.IndexPage.features.item2,
    item3: zhMessages.IndexPage.features.item3,
    item4: zhMessages.IndexPage.features.item4,
    item5: zhMessages.IndexPage.features.item5,
    item6: zhMessages.IndexPage.features.item6,
  },
  faq: {
    title: zhMessages.IndexPage.faq.title,
    subtitle: zhMessages.IndexPage.faq.subtitle,
    item1: zhMessages.IndexPage.faq.item1,
    item2: zhMessages.IndexPage.faq.item2,
    item3: zhMessages.IndexPage.faq.item3,
    item4: zhMessages.IndexPage.faq.item4,
    item5: zhMessages.IndexPage.faq.item5,
    item6: zhMessages.IndexPage.faq.item6,
  },
}).join("");

const zhCharacterCount = zhContent.replace(/\s/g, "").length;
const zhPrimaryKeywordCount = zhContent.match(/宝丽来照片生成器/g)?.length ?? 0;

assert.ok(
  words.length >= 1000 && words.length <= 1400,
  `Expected 1000-1400 English words, found ${words.length}`,
);
assert.ok(
  exactPhraseCount >= 14 && exactPhraseCount <= 18,
  `Expected 14-18 exact keyword phrases, found ${exactPhraseCount}`,
);
assert.ok(
  weightedDensity >= 3.5 && weightedDensity <= 5,
  `Expected weighted keyword density of 3.5%-5%, found ${weightedDensity.toFixed(2)}%`,
);
assert.ok(
  zhCharacterCount >= 2500,
  `Expected at least 2500 visible Chinese content characters, found ${zhCharacterCount}`,
);
assert.ok(
  zhPrimaryKeywordCount >= 10 && zhPrimaryKeywordCount <= 24,
  `Expected 10-24 natural Chinese primary keyword mentions, found ${zhPrimaryKeywordCount}`,
);

const bannedClaims = [
  "100 free test credits",
  "10-second",
  "10 seconds",
  "10-15 seconds",
  "1080x1080",
  "trained on thousands",
  "satisfaction rate exceeding 90%",
  "complete usage rights",
  "describe a scene or upload a photo",
  "upload your existing photos",
  "we support jpg",
  "image conversion consumes",
];

for (const claim of bannedClaims) {
  assert.ok(
    !content.toLowerCase().includes(claim.toLowerCase()),
    `Homepage content contains unsupported claim: ${claim}`,
  );
}

const bannedZhClaims = [
  "100免费测试积分",
  "10秒",
  "10-15秒",
  "1080x1080",
  "数千张真实宝丽来照片训练",
  "满意度超过90%",
  "拥有完整的使用权",
  "描述场景或上传照片",
  "上传您现有的照片",
  "支持JPG和PNG",
  "图片转换消耗8积分",
];

for (const claim of bannedZhClaims) {
  assert.ok(
    !zhContent.includes(claim),
    `Chinese homepage content contains unsupported claim: ${claim}`,
  );
}

assert.match(
  homepageRoute,
  /showSeoContent/,
  "Homepage must explicitly enable content sections",
);
assert.match(
  mvpRoute,
  /showSeoContent=\{false\}/,
  "MVP route must explicitly disable duplicate SEO content",
);
assert.ok(
  !homepageComponent.includes("Examples"),
  "Community review module is still mounted",
);
assert.ok(
  homepageComponent.includes("WhyPolaroidGenerator"),
  "Why module is not mounted",
);
assert.ok(
  !homepageComponent.includes(
    'locale === "en" ? <WhyPolaroidGenerator /> : null',
  ),
  "Why module must be mounted for every homepage locale",
);
assert.ok(
  !homepageRoute.includes(
    'locale === "en" ? <HomepageStructuredData locale={locale} /> : null',
  ),
  "Structured data must be mounted for every homepage locale",
);
assert.ok(
  fs.existsSync("components/seo/homepage-structured-data.tsx"),
  "Homepage structured data component is missing",
);

console.log(
  JSON.stringify(
    {
      wordCount: words.length,
      exactPhraseCount,
      weightedDensityPercent: Number(weightedDensity.toFixed(2)),
      zhCharacterCount,
      zhPrimaryKeywordCount,
      protectedMetadata: "unchanged",
    },
    null,
    2,
  ),
);
