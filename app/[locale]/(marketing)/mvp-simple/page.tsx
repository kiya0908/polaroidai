import { unstable_setRequestLocale } from "next-intl/server";

import MVPSimplePage from "../mvp-simple";

type Props = {
  params: { locale: string };
};

export default function MVPSimpleRoute({ params: { locale } }: Props) {
  // Enable static rendering
  unstable_setRequestLocale(locale);

  return <MVPSimplePage locale={locale} />;
}
