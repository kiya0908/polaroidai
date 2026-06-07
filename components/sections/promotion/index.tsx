import { getChargeProduct } from "@/db/queries/charge-product";
import { hasClerkPublishableKey } from "@/lib/clerk-runtime";

import PromotionBanner from "./promotion-banner";

export default async function Promotion({ locale }: { locale: string }) {
  if (!hasClerkPublishableKey()) {
    return null;
  }

  const { data: chargeProduct } = await getChargeProduct(locale);
  let claimed = true;
  const targetDate = new Date("2024-08-20T20:20:00+08:00");
  const oneMonthLater = new Date(
    targetDate.getTime() + 30 * 24 * 60 * 60 * 1000,
  );
  const now = new Date();

  if (now >= oneMonthLater) {
    return null;
  }

  return (
    <PromotionBanner
      claimed={claimed}
      locale={locale}
      chargeProduct={chargeProduct}
    />
  );
}
