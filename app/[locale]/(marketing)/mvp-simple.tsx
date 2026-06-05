"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { useAuth } from "@clerk/nextjs";
import {
  Camera,
  Coins,
  Download,
  Image as ImageIcon,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";

import Features from "@/components/sections/features";
import HowItWorksSection from "@/components/sections/how-it-works-section";
import PolaroidFAQ from "@/components/sections/polaroid-faq";
import WhatIsSection from "@/components/sections/what-is-section";
import WhyPolaroidGenerator from "@/components/sections/why-polaroid-generator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

interface GenerationResult {
  id: string;
  outputImageUrl: string;
  processingTime?: number;
}

interface MVPPageProps {
  locale: string;
  showSeoContent?: boolean;
}

const FREE_GENERATION_LIMIT = 2;
const CREDITS_PER_GENERATION = 3;
const POLL_INTERVAL_MS = 2500;
const MAX_POLL_MS = 90_000;

function pagePathHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  return { "x-page-path": window.location.pathname };
}

function createRequestId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `gen_${crypto.randomUUID()}`;
  }

  return `gen_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export default function MVPSimplePage({
  locale,
  showSeoContent = false,
}: MVPPageProps) {
  const t = useTranslations("MVP");
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("text");
  const [taskId, setTaskId] = useState<string | null>(null);
  const [remainingFreeGenerations, setRemainingFreeGenerations] = useState(
    FREE_GENERATION_LIMIT,
  );
  const [creditsBalance, setCreditsBalance] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/mvp-events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...pagePathHeader(),
      },
      body: JSON.stringify({ eventType: "page_view", metadata: { locale } }),
      keepalive: true,
    }).catch(() => {});
  }, [locale]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setCreditsBalance(null);
      return;
    }

    let cancelled = false;

    async function loadCredits() {
      try {
        const token = await getToken();
        const response = await fetch("/api/account", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled) {
          setCreditsBalance(typeof data.credit === "number" ? data.credit : 0);
        }
      } catch (error) {
        console.error("Failed to load credits:", error);
      }
    }

    loadCredits();

    return () => {
      cancelled = true;
    };
  }, [getToken, isLoaded, isSignedIn]);

  const recordCompositionTabClick = () => {
    fetch("/api/mvp-events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...pagePathHeader(),
      },
      body: JSON.stringify({
        eventType: "composition_tab_click",
        metadata: { locale },
      }),
      keepalive: true,
    }).catch(() => {});
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setError(null);
    if (value === "images") {
      recordCompositionTabClick();
    }
  };

  const pollGenerationStatus = async (nextTaskId: string) => {
    const startedAt = Date.now();

    while (Date.now() - startedAt < MAX_POLL_MS) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

      const response = await fetch(
        `/api/mvp-generate/status?taskId=${encodeURIComponent(nextTaskId)}`,
        {
          headers: pagePathHeader(),
        },
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || t("errors.generateFailed"));
      }

      const status = data.data?.status;
      if (status === "succeeded") {
        setResult({
          id: nextTaskId,
          outputImageUrl: data.data.outputImageUrl || data.data.imageUrls?.[0],
          processingTime: data.data.durationMs,
        });
        return;
      }

      if (status === "failed") {
        if (data.data?.refunded) {
          throw new Error("Generation failed and credits were refunded.");
        }

        throw new Error(
          data.data?.errorMessage ||
            data.error?.message ||
            t("errors.generateFailed"),
        );
      }
    }

    throw new Error("Generation is still running. Please try again later.");
  };

  const handleGenerate = async () => {
    if (isLoading) return;

    if (activeTab === "images") {
      setError("Image composition is coming soon.");
      recordCompositionTabClick();
      return;
    }

    const content = prompt.trim();
    if (!content) {
      setError(t("errors.emptyPrompt"));
      return;
    }

    if (content.length > 500) {
      setError("Prompt must be 500 characters or fewer.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setTaskId(null);

    try {
      const requestId = createRequestId();
      const response = await fetch("/api/mvp-generate/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...pagePathHeader(),
        },
        body: JSON.stringify({ type: "text", content, requestId, locale }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 429) {
          setRemainingFreeGenerations(0);
        }
        if (typeof data.data?.creditsBalance === "number") {
          setCreditsBalance(data.data.creditsBalance);
        }
        throw new Error(data.error?.message || t("errors.generateFailed"));
      }

      const nextTaskId = data.data?.taskId;
      if (!nextTaskId) {
        throw new Error("Generation task id was not returned.");
      }

      setTaskId(nextTaskId);
      if (typeof data.data.creditsBalance === "number") {
        setCreditsBalance(data.data.creditsBalance);
      }
      if (typeof data.data.remainingFreeGenerations === "number") {
        setRemainingFreeGenerations(data.data.remainingFreeGenerations);
      }
      sessionStorage.setItem("mvp_generation_task_id", nextTaskId);
      sessionStorage.setItem("mvp_generation_request_id", requestId);
      await pollGenerationStatus(nextTaskId);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("errors.networkError");
      setError(
        isSignedIn && message.toLowerCase().includes("failed")
          ? `${message} Credits are refunded automatically when provider generation fails.`
          : message,
      );
    } finally {
      setIsLoading(false);
      if (isSignedIn) {
        const token = await getToken().catch(() => null);
        const response = await fetch("/api/account", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }).catch(() => null);
        if (response?.ok) {
          const data = await response.json();
          setCreditsBalance(typeof data.credit === "number" ? data.credit : 0);
        }
      }
    }
  };

  const handleDownload = async () => {
    if (!result?.outputImageUrl) return;

    try {
      const response = await fetch("/api/mvp-download-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...pagePathHeader(),
        },
        body: JSON.stringify({
          taskId: result.id,
          imageUrl: result.outputImageUrl,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "Download failed");
      }

      const link = document.createElement("a");
      link.href = data.data.downloadUrl;
      link.download = `polaroid-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#f7f7f7] text-[#08304c]">
      <div className="relative px-3 py-10 sm:py-14 lg:py-16">
        <div
          aria-hidden="true"
          className="hero-polaroid hero-polaroid-left-top"
        >
          <div className="hero-polaroid-drift">
            <Image
              src="/images/polaroid-photo-1.webp"
              alt=""
              width={494}
              height={620}
              sizes="(min-width: 1280px) 152px, 136px"
            />
          </div>
        </div>
        <div
          aria-hidden="true"
          className="hero-polaroid hero-polaroid-left-bottom"
        >
          <div className="hero-polaroid-drift">
            <Image
              src="/images/polaroid-photo-2.webp"
              alt=""
              width={253}
              height={290}
              sizes="(min-width: 1280px) 112px, 100px"
            />
          </div>
        </div>
        <div
          aria-hidden="true"
          className="hero-polaroid hero-polaroid-right-top"
        >
          <div className="hero-polaroid-drift">
            <Image
              src="/images/polaroid-photo-4.webp"
              alt=""
              width={249}
              height={296}
              sizes="(min-width: 1280px) 136px, 120px"
            />
          </div>
        </div>
        <div
          aria-hidden="true"
          className="hero-polaroid hero-polaroid-right-bottom"
        >
          <div className="hero-polaroid-drift">
            <Image
              src="/images/polaroid-photo-3.webp"
              alt=""
              width={249}
              height={441}
              sizes="(min-width: 1280px) 108px, 96px"
            />
          </div>
        </div>

        <div className="container mx-auto max-w-5xl px-4">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <div
              aria-hidden="true"
              className="portrait-pill mx-auto mb-5 inline-flex items-center gap-2 px-4 py-2"
            >
              <Sparkles className="h-4 w-4 text-[#d6883f]" />
            </div>
            <h1 className="mb-5 text-balance font-heading text-4xl font-medium leading-none tracking-[-0.04em] text-[#08304c] sm:text-5xl md:text-6xl lg:text-[62px]">
              {t("title")}
            </h1>
            <p className="mx-auto max-w-2xl text-balance text-lg leading-8 text-[#08304c]/70">
              {t("subtitle")}
            </p>
          </div>

          <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-[1.04fr_0.96fr]">
            <Card className="portrait-card overflow-hidden">
              <CardHeader className="p-6 pb-4 sm:p-8 sm:pb-4">
                <CardTitle className="flex items-center gap-3 font-heading text-2xl font-medium tracking-[-0.02em] text-[#08304c]">
                  <span className="bg-[#d6883f]/12 flex h-11 w-11 items-center justify-center rounded-full">
                    <Camera className="h-5 w-5 text-[#08304c]" />
                  </span>
                  {t("generator.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 p-6 pt-0 sm:p-8 sm:pt-0">
                <div className="flex items-center justify-between gap-3 rounded-full bg-[#f7f7f7] px-4 py-3 text-sm">
                  <span className="flex items-center gap-2 text-[#08304c]/70">
                    {isSignedIn ? (
                      <>
                        <Coins className="h-4 w-4 text-[#d6883f]" />
                        Credits balance
                      </>
                    ) : (
                      t("credits.freeGenerations")
                    )}
                  </span>
                  <Badge
                    variant="secondary"
                    className="rounded-full bg-white px-3 text-[#08304c]"
                  >
                    {isSignedIn
                      ? `${creditsBalance ?? "-"} credits`
                      : `${remainingFreeGenerations} / ${FREE_GENERATION_LIMIT}`}
                  </Badge>
                </div>
                <div className="rounded-3xl bg-[#d6883f]/10 px-4 py-3 text-xs leading-5 text-[#08304c]/60">
                  {isSignedIn
                    ? `${CREDITS_PER_GENERATION} credits are used only when a provider task starts. Downloading and viewing existing results are free.`
                    : "Free generations are used only when a provider task starts. Downloading existing results is free."}
                </div>

                <Tabs value={activeTab} onValueChange={handleTabChange}>
                  <TabsList className="grid h-12 w-full grid-cols-2 rounded-full bg-[#f7f7f7] p-1">
                    <TabsTrigger
                      value="text"
                      className="flex items-center gap-2 rounded-full data-[state=active]:bg-white data-[state=active]:text-[#08304c]"
                    >
                      <Camera className="h-4 w-4" />
                      {t("tabs.textGeneration")}
                    </TabsTrigger>
                    <TabsTrigger
                      value="images"
                      className="flex items-center gap-2 rounded-full data-[state=active]:bg-white data-[state=active]:text-[#08304c]"
                    >
                      <ImageIcon className="h-4 w-4" />
                      {t("tabs.imageComposition")}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="text" className="space-y-4">
                    <Textarea
                      placeholder={t("generator.placeholder")}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[150px] resize-none rounded-[24px] border-[#08304c]/10 bg-[#f7f7f7] p-5 text-base text-[#08304c] shadow-none placeholder:text-[#08304c]/35 focus-visible:ring-[#d6883f]"
                      disabled={isLoading}
                    />

                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className="rounded-full border-[#d6883f]/35 bg-[#d6883f]/10 text-xs text-[#08304c]"
                      >
                        {t("generator.textGenerationCost")}
                      </Badge>
                      <span className="text-sm text-[#08304c]/60">
                        {prompt.length}/500
                      </span>
                    </div>
                  </TabsContent>

                  <TabsContent value="images" className="space-y-4">
                    <div className="flex min-h-[190px] flex-col items-center justify-center rounded-[24px] border border-dashed border-[#08304c]/15 bg-[#f7f7f7] p-6 text-center">
                      <Sparkles className="mb-3 h-8 w-8 text-[#d6883f]" />
                      <div className="font-medium text-[#08304c]">
                        Coming soon
                      </div>
                      <p className="mt-2 text-sm text-[#08304c]/60">
                        Image composition is being reconnected after the API
                        recovery.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                <Button
                  onClick={handleGenerate}
                  disabled={
                    isLoading ||
                    activeTab === "images" ||
                    !prompt.trim() ||
                    prompt.length > 500 ||
                    (isSignedIn &&
                      creditsBalance !== null &&
                      creditsBalance < CREDITS_PER_GENERATION)
                  }
                  className="portrait-action w-full text-base font-medium"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {taskId
                        ? "Checking status..."
                        : t("generator.generating")}
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2 h-4 w-4" />
                      {activeTab === "text"
                        ? isSignedIn
                          ? `${t("generator.generate")} (${CREDITS_PER_GENERATION} credits)`
                          : t("generator.generate")
                        : "Coming soon"}
                    </>
                  )}
                </Button>

                {error && (
                  <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600">
                    {error}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="portrait-card overflow-hidden">
              <CardHeader className="p-6 pb-4 sm:p-8 sm:pb-4">
                <CardTitle className="font-heading text-2xl font-medium tracking-[-0.02em] text-[#08304c]">
                  {t("result.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 sm:p-8 sm:pt-0">
                {isLoading && (
                  <div className="flex aspect-square items-center justify-center rounded-[24px] bg-[#f7f7f7]">
                    <div className="text-center">
                      <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-[#d6883f]" />
                      <p className="text-sm text-[#08304c]/60">
                        {taskId
                          ? "Waiting for image..."
                          : t("result.processing")}
                      </p>
                    </div>
                  </div>
                )}

                {result && (
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={result.outputImageUrl}
                        alt={t("result.altText")}
                        className="aspect-square w-full rounded-[24px] object-cover shadow-[10px_16px_14px_rgba(0,0,0,0.04)]"
                      />
                      {typeof result.processingTime === "number" && (
                        <div className="absolute bottom-4 right-4">
                          <Badge variant="secondary">
                            {result.processingTime}ms
                          </Badge>
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      className="portrait-outline-action w-full"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {t("result.download")}
                    </Button>
                  </div>
                )}

                {!isLoading && !result && (
                  <div className="flex aspect-square items-center justify-center rounded-[24px] border border-dashed border-[#08304c]/15 bg-[#f7f7f7]">
                    <div className="text-center">
                      <Camera className="mx-auto mb-2 h-12 w-12 text-[#08304c]/30" />
                      <p className="text-sm text-[#08304c]/60">
                        {t("result.placeholder")}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-[#08304c]/60">
              {t("footer.description")}
            </p>
          </div>
        </div>
      </div>

      {showSeoContent ? (
        <div className="bg-[#f7f7f7]">
          <WhatIsSection />
          <HowItWorksSection />
          <WhyPolaroidGenerator />
          <Features />
          <PolaroidFAQ />
        </div>
      ) : null}
    </div>
  );
}
