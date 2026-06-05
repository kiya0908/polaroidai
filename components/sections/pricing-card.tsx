import { PricingCards } from "@/components/pricing-cards";
import { getChargeProduct } from "@/db/queries/charge-product";

type Props = {
  locale: string;
};

export default async function PricingCard({ locale }: Props) {
  const { data: chargeProduct = [] } = await getChargeProduct(locale);

  return (
    <section className="w-full py-16 sm:py-20">
      <PricingCards chargeProduct={chargeProduct} />
    </section>
  );
}
