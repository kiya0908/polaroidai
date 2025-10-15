import { getTranslations, unstable_setRequestLocale } from "next-intl/server";

import History from "@/components/history";

// 使用动态渲染避免构建时数据库连接问题
export const dynamic = 'force-dynamic';

interface PageProps {
  params: { locale: string };
}

export async function generateMetadata({
  params: { locale },
}: PageProps) {
  const t = await getTranslations({ locale, namespace: "History" });

  return {
    title: t("title"),
    description: t("description"),
  };
}



export default function PlaygroundPage({ params: { locale } }: PageProps) {
  unstable_setRequestLocale(locale);

  return <History locale={locale} />;
}
