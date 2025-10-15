import { getTranslations, unstable_setRequestLocale } from "next-intl/server";

import { OrderInfo } from "@/components/order-info";

// 使用动态渲染避免构建时数据库连接问题
export const dynamic = 'force-dynamic';

interface PageProps {
  params: { locale: string };
}

export async function generateMetadata({
  params: { locale },
}: PageProps) {
  const t = await getTranslations({ locale, namespace: "Orders" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function BillingPage({ params: { locale } }: PageProps) {
  unstable_setRequestLocale(locale);

  return <OrderInfo />;
}
