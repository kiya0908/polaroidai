"use client";

import { Camera, Quote, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { HeaderSection } from "@/components/shared/header-section";
import { cn } from "@/lib/utils";

const EXAMPLE_REVIEWS = [
  {
    name: "Maya R.",
    handle: "@mayacreates",
    text: "The Polaroid look is surprisingly close to the old instant photos in my family albums. Warm, soft, and ready to post.",
    tag: "Portrait",
  },
  {
    name: "Jonas K.",
    handle: "@jonask",
    text: "I used it for travel photos and the vintage border made every shot feel like a printed keepsake instead of another phone image.",
    tag: "Travel",
  },
  {
    name: "Ari S.",
    handle: "@arisnaps",
    text: "Fast enough for prompt testing, and the credit cost is clear before generating. That makes it easy to experiment without guessing.",
    tag: "Creative",
  },
];

function ReviewCard({
  review,
  index,
}: {
  review: (typeof EXAMPLE_REVIEWS)[number];
  index: number;
}) {
  return (
    <article
      className={cn(
        "portrait-card flex h-full min-h-[250px] flex-col p-6",
        "transition duration-200 hover:-translate-y-1",
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#d6883f]/12 text-[#08304c]">
            <Camera className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="font-heading font-medium leading-none text-[#08304c]">{review.name}</p>
            <p className="mt-1 text-sm text-[#08304c]/60">
              {review.handle}
            </p>
          </div>
        </div>
        <Quote
          className="h-5 w-5 shrink-0 text-[#08304c]/25"
          aria-hidden="true"
        />
      </div>

      <p className="mt-6 flex-1 text-pretty text-sm leading-6 text-[#08304c]/60">
        {review.text}
      </p>

      <div className="mt-6 flex items-center justify-between border-t border-[#08304c]/10 pt-4">
        <span className="text-xs font-medium uppercase tracking-wide text-[#08304c]/50">
          {review.tag}
        </span>
        <Sparkles className="h-4 w-4 text-[#d6883f]" aria-hidden="true" />
      </div>
    </article>
  );
}

export default function Examples() {
  const t = useTranslations("IndexPage");

  return (
    <section className="py-16 sm:py-28">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <HeaderSection
            title={t("examples.title")}
            subtitle={t("examples.subtitle")}
          />
        </div>

        <div className="mx-auto mt-12 grid w-full max-w-6xl grid-cols-1 gap-4 sm:mt-16 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
          {EXAMPLE_REVIEWS.map((review, index) => (
            <ReviewCard key={review.handle} review={review} index={index} />
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-[#08304c]/60 sm:mt-12">
          {t("examples.communityFeedback")}
        </p>
      </div>
    </section>
  );
}
