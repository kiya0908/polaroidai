"use client";

import { useState } from "react";

import { useUser } from "@clerk/nextjs";
import { useTranslations } from "next-intl";

import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import type { ChargeProductSelectDto } from "@/db/type";
import { url } from "@/lib";
import { usePathname } from "@/lib/navigation";

interface CreemBillingButtonProps {
  offer: ChargeProductSelectDto;
  btnText?: string;
}

export function CreemBillingButton({
  offer,
  btnText = "Buy Plan",
}: CreemBillingButtonProps) {
  const { user } = useUser();
  const pathname = usePathname();
  const t = useTranslations("PricingPage");
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // 从产品数据中获取 Creem 产品 ID
  const creemProductId = offer.creemProductId;

  if (!creemProductId) {
    console.error("No Creem product ID found for product:", {
      id: offer.id,
      title: offer.title,
      credit: offer.credit,
    });
    return (
      <Button variant="outline" className="w-full" disabled>
        {t("action.unavailable") || "Unavailable"}
      </Button>
    );
  }

  const userOffer = offer.isPopular === true;

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please sign in to continue",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('🛒 开始创建Creem订单，请求数据:', {
        productId: offer.id,
        amount: offer.amount,
        creemProductId,
        pathname: pathname,
        url: url("/app").href
      });

      // 调用API创建订单和Creem checkout
      const response = await fetch("/api/charge-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: offer.id,
          amount: offer.amount,
          currency: "USD",
          channel: "Creem",
          creemProductId,
          url: url("/app").href,
        }),
      });

      console.log('📡 API响应状态:', response.status);

      const data = await response.json();
      console.log('📦 API响应数据:', data);

      if (!response.ok) {
        console.error('❌ API错误响应:', data);
        throw new Error(data.error || "Failed to create checkout");
      }

      // 跳转到Creem支付页面
      if (data.url) {
        console.log('✅ 准备跳转到Creem:', data.url);
        window.location.href = data.url;
      } else {
        console.error('❌ 响应中没有URL字段，完整响应:', data);
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("💥 Checkout error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create checkout",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={userOffer ? "default" : "outline"}
      className="w-full"
      onClick={handleCheckout}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          {t("action.processing") || "Processing..."}
        </>
      ) : (
        btnText
      )}
    </Button>
  );
}
