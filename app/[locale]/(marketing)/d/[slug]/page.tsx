
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getPolaroidById, incrementViewCount } from "@/actions/polaroid-action";
import { Link } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDate } from "@/lib/utils"
import { CopyButton } from "@/components/shared/copy-button";
import { DownloadAction } from "@/components/history/download-action";
import { env } from "@/env.mjs";
import { prisma } from "@/db/prisma";
import { auth } from "@clerk/nextjs/server";
import { PolaroidHashids } from "@/db/dto/polaroid.dto";

interface RootPageProps {
  params: { locale: string, slug: string };
}

export async function generateStaticParams() {
  const polaroids = await prisma.polaroidai_PolaroidGeneration.findMany({
    where: {
      isPrivate: false,
      taskStatus: 'completed',
    },
    select: {
      id: true
    }
  });
  return polaroids.map((polaroid) => ({
    slug: PolaroidHashids.encode(polaroid.id)
  }))
}

export async function generateMetadata({
  params: { locale, slug },
}: Omit<RootPageProps, "children">) {
  const t = await getTranslations({ locale, namespace: "ExplorePage" });
  const polaroid = await getPolaroidById(slug);
  if (!polaroid) {
    return notFound();
  }
  return {
    title: t("layout.title"),
    description: polaroid.inputContent || "Polaroid AI Generated Image",
    openGraph: {
      title: "Polaroid AI Image Generator",
      description: polaroid.inputContent || "Vintage Polaroid style image",
      images: [
        {
          url: polaroid.outputImageUrl!,
        },
      ],
      type: 'article',
    },
    image: polaroid.outputImageUrl,
  };
}
const breakpointColumnsObj = {
  default: 4,
  1024: 3,
  768: 2,
  640: 1,
};
export default async function PolaroidPage({
  params,
}: RootPageProps) {
  unstable_setRequestLocale(params.locale);
  const t = await getTranslations({ namespace: "ExplorePage" });
  const polaroid = await getPolaroidById(params.slug);
  if (!polaroid) {
    return notFound();
  }
  const { userId } = auth();

  // 增加查看次数
  if (env.VERCEL_ENV === 'production' && userId) {
    await incrementViewCount(params.slug, userId);
  }

  return (
    <section className="container mx-auto py-20">
      <div className="flex flex-col md:flex-row min-h-screen">
        <div className="w-full md:w-1/2 checkerboard h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          <div className="relative">
            <img
              src={polaroid.outputImageUrl!}
              alt={polaroid.inputContent || "Polaroid AI Generated Image"}
              title={polaroid.inputContent || "Polaroid AI Generated Image"}
              className="h-full max-h-96 rounded-xl object-cover shadow-lg border-8 border-white"
              style={{ aspectRatio: '1/1.2' }} // 宝丽来经典比例
            />
            <div className="absolute -bottom-2 -right-2 bg-white text-black text-xs px-2 py-1 rounded shadow">
              Polaroid AI
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/2 p-4 bg-background text-foreground">
          <ScrollArea className="h-full">
            <Card className="border-none shadow-none">
              <CardContent className="p-6 space-y-4">
                {polaroid.inputContent && (
                  <div>
                    <h2 className="text-lg font-semibold mb-2">输入描述</h2>
                    <p className="text-sm text-muted-foreground">
                      {polaroid.inputContent}
                      <CopyButton
                        value={polaroid.inputContent}
                        className={cn(
                          "relative ml-2",
                          "duration-250 transition-all",
                        )}
                      />
                    </p>
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-semibold mb-2">生成类型</h2>
                  <p className="text-sm text-muted-foreground">
                    {polaroid.inputType === 'text' ? '文字生成' : '图片转换'}
                  </p>
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-2">宝丽来风格</h2>
                  <p className="text-sm text-muted-foreground">{polaroid.styleType}</p>
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-2">处理时间</h2>
                  <p className="text-sm text-muted-foreground">
                    {polaroid.processingTime ? `${(polaroid.processingTime / 1000).toFixed(1)}秒` : '未知'}
                  </p>
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-2">积分消耗</h2>
                  <p className="text-sm text-muted-foreground">{polaroid.creditCost} 积分</p>
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-2">创建时间</h2>
                  <p className="text-sm text-muted-foreground">{formatDate(polaroid.createdAt!)}</p>
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-2">统计信息</h2>
                  <p className="text-sm text-muted-foreground">
                    查看 {polaroid.viewsNum} 次 · 下载 {polaroid.downloadNum} 次
                  </p>
                </div>
                <div className="flex flex-row justify-between space-x-2 pt-0">
                  <DownloadAction
                    showText
                    id={polaroid.id}
                  />
                </div>
              </CardContent>
            </Card>
          </ScrollArea>
        </div>
      </div>
    </section>
  );
}
