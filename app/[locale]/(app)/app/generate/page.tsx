import { redirect } from "next/navigation";

export default function GeneratePage({
  params,
}: {
  params: { locale: string };
}) {
  redirect(`/${params.locale}/mvp-simple`);
}
