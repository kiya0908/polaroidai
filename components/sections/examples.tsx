"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";

// 动态导入Tweet组件，禁用SSR以避免hydration错误
const Tweet = dynamic(() => import("react-tweet").then((mod) => ({ default: mod.Tweet })), {
  ssr: false,
  loading: () => <TweetSkeleton />,
});

import { HeaderSection } from "@/components/shared/header-section";
import { cn } from "@/lib/utils";

// 示例推文ID - 这些是实际存在的Twitter ID，用于展示社区反馈
const EXAMPLE_TWEET_IDS = [
  "1969813979636900078",
  "1969820383487590795",
  "1969681790685122877",
];

// Tweet组件的加载状态
function TweetSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="w-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600"></div>
          <div className="space-y-2">
            <div className="h-4 w-20 rounded bg-gray-300 dark:bg-gray-600"></div>
            <div className="h-3 w-16 rounded bg-gray-300 dark:bg-gray-600"></div>
          </div>
        </div>
        <div className="mt-3 space-y-2">
          <div className="h-4 w-full rounded bg-gray-300 dark:bg-gray-600"></div>
          <div className="h-4 w-3/4 rounded bg-gray-300 dark:bg-gray-600"></div>
        </div>
      </div>
    </div>
  );
}

// 错误状态组件（暂时未使用）
function TweetError({ tweetId }: { tweetId: string }) {
  return (
    <div className="w-full rounded-lg border border-red-200 bg-red-50 p-4 text-center dark:border-red-800 dark:bg-red-900/10">
      <p className="text-sm text-red-600 dark:text-red-400">
        无法加载推文 {tweetId}
      </p>
      <p className="mt-1 text-xs text-red-500 dark:text-red-500">
        推文可能已被删除或设为私有
      </p>
    </div>
  );
}

// 单个Tweet容器组件
function TweetContainer({ tweetId }: { tweetId: string }) {
  return (
    <div className="w-full">
      <Suspense fallback={<TweetSkeleton />}>
        <div className="tweet-container w-full">
          <Tweet id={tweetId} />
        </div>
      </Suspense>
    </div>
  );
}

export default function Examples() {
  const t = useTranslations("IndexPage");

  return (
    <section className="py-16 sm:py-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 标题部分 */}
        <div className="mx-auto max-w-3xl text-center">
          <HeaderSection
            title={t("examples.title")}
            subtitle={t("examples.subtitle")}
          />
        </div>

        {/* Twitter推文网格容器 */}
        <div className="mx-auto mt-12 w-full max-w-6xl px-4 sm:mt-16 sm:px-6">
          <div
            className={cn(
              "grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3"
            )}
          >
            {EXAMPLE_TWEET_IDS.map((tweetId, index) => (
              <div
                key={tweetId}
                className={cn(
                  "transform transition-all duration-300 ease-in-out",
                  // 增强悬停效果
                  "hover:scale-[1.02] hover:shadow-lg",
                  // 渐入动画
                  "animate-in fade-in-50 slide-in-from-bottom-2",
                  // 网格项优化
                  "w-full"
                )}
                style={{
                  // 为每个推文添加不同的延迟，调整为100ms间隔
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <TweetContainer tweetId={tweetId} />
              </div>
            ))}
          </div>

          {/* 底部说明文本 */}
          <div className="mt-8 text-center sm:mt-12">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("examples.subtitle")}
            </p>
            <div className="mt-3 flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-500">
              <span className="text-blue-500">🐦</span>
              <span>{t("examples.communityFeedback")}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}