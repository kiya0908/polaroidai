"use client";

import React, { useEffect, useId, useRef, useState } from "react";

import { useAuth } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";
import copy from "copy-to-clipboard";
import { debounce } from "lodash-es";
import { Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import qs from "query-string";
import InfiniteScroll from "react-infinite-scroll-component";
import Masonry from "react-masonry-css";
import { toast } from "sonner";
import Link from "next/link";
import Loading from "@/components/loading";
import BlurFade from "@/components/magicui/blur-fade";
import { EmptyPlaceholder } from "@/components/shared/empty-placeholder";
import { cn } from "@/lib/utils";

import { Button } from "../ui/button";
import Container from "./container";
import LoadMoreLoading from "./loading";

// 数据类型定义
interface PolaroidHistoryItem {
  id: string;
  input_type: 'text' | 'image';
  input_content: string | null;
  input_image_url: string | null;
  output_image_url: string | null;
  thumbnail_url: string | null;
  style_type: string;
  task_status: 'completed' | 'processing' | 'failed';
  is_private: boolean;
  credit_cost: number;
  created_at: string;
}

interface PolaroidHistoryResponse {
  records: PolaroidHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 组件内部使用的格式
interface DisplayItem {
  id: string;
  inputPrompt: string;
  imageUrl: string | null;
  taskStatus: 'Processing' | 'Completed' | 'Failed';
  styleType: string;
  creditCost: number;
  createdAt: string;
}

// 数据适配函数：将 API 返回的数据转换为组件需要的格式
const adaptPolaroidData = (record: PolaroidHistoryItem): DisplayItem => {
  let status: 'Processing' | 'Completed' | 'Failed';
  if (record.task_status === 'processing') status = 'Processing';
  else if (record.task_status === 'completed') status = 'Completed';
  else status = 'Failed';

  return {
    id: record.id,
    inputPrompt: record.is_private && record.input_type === 'text'
      ? '(Private content)'
      : (record.input_content || record.input_image_url || ''),
    imageUrl: record.thumbnail_url || record.output_image_url,
    taskStatus: status,
    styleType: record.style_type,
    creditCost: record.credit_cost,
    createdAt: record.created_at,
  };
};

const useQueryHistoryMutation = (config?: {
  onSuccess: (result: PolaroidHistoryResponse) => void;
}) => {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (values: any) => {
      const res = await fetch(`/api/polaroid-history?${qs.stringify(values)}`, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const result = await res.json();
      return result as PolaroidHistoryResponse;
    },
    onSuccess: async (result) => {
      config?.onSuccess(result);
    },
    onError: (error) => {
      console.error("Failed to fetch history:", error);
      toast.error("Failed to load history");
    },
  });
};

const breakpointColumnsObj = {
  default: 4,
  1024: 3,
  768: 2,
  640: 1,
};

export default function History({ locale }: { locale: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [init, setInit] = useState(false);
  const t = useTranslations("History");
  const id = useId();
  const [pageParams, setPageParams] = useState({
    page: 1,
    limit: 12,
  });
  const [hasMore, setHasMore] = useState(true);
  const [dataSource, setDataSource] = useState<DisplayItem[]>([]);
  const useQueryHistory = useQueryHistoryMutation({
    onSuccess(result) {
      // 转换数据格式
      const adaptedData = result.records.map(adaptPolaroidData);

      setDataSource(
        result.pagination.page === 1
          ? adaptedData
          : [...dataSource, ...adaptedData]
      );
      setPageParams({
        page: result.pagination.page,
        limit: result.pagination.limit,
      });
      setHasMore(result.pagination.hasNext);
      setInit(true);
    },
  });

  useEffect(() => {
    useQueryHistory.mutate({
      page: pageParams.page,
      limit: pageParams.limit,
    });
  }, []);

  const loadMore = () => {
    console.log("load more");
    useQueryHistory.mutate({
      page: pageParams.page + 1,
      limit: pageParams.limit,
    });
  };

  const copyPrompt = (prompt: string) => {
    copy(prompt);
    toast.success(t("action.copySuccess"));
  };

  const debounceLoadMore = debounce(loadMore, 500);

  return (
    <Container className="h-[calc(100vh_-_76px)]">
      <div
        className="no-scrollbar h-full overflow-y-auto overflow-x-hidden"
        id={id}
        ref={containerRef}
      >
        <InfiniteScroll
          scrollThreshold={0.58}
          dataLength={dataSource.length}
          next={debounceLoadMore}
          hasMore={hasMore}
          loader={
            init ? (
              <div className="flex h-16 w-full items-center justify-center">
                <LoadMoreLoading />
              </div>
            ) : (
              <div className="flex h-full min-h-96 w-full items-center justify-center">
                <Loading />
              </div>
            )
          }
          className="pb-10"
          scrollableTarget={id}
        >
          {dataSource.length > 0 ? (
            <Masonry
              breakpointCols={breakpointColumnsObj}
              className="flex w-auto"
              columnClassName="bg-clip-padding pl-4 first:pl-0"
            >
              {dataSource.map((item, idx) => (
                <div
                  key={item.id}
                  className="border-stroke-light bg-surface-300 hover:border-stroke-strong mb-4 flex break-inside-avoid flex-col space-y-4 overflow-hidden rounded-xl border relative"
                >
                  {item.taskStatus === 'Processing' ? (
                    <div className="bg-pattern flx w-full items-center justify-center rounded-xl aspect-square pointer-events-none">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-polaroid-orange mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-2">Processing...</p>
                      </div>
                    </div>
                  ) : item.imageUrl ? (
                    <BlurFade
                      key={item.imageUrl}
                      delay={0.25 + (idx % pageParams.limit) * 0.05}
                      inView
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.inputPrompt}
                        title={item.inputPrompt}
                        className="w-full rounded-xl object-cover aspect-square pointer-events-none"
                      />
                    </BlurFade>
                  ) : (
                    <div className="w-full rounded-xl bg-gray-100 aspect-square flex items-center justify-center">
                      <p className="text-gray-400">No image available</p>
                    </div>
                  )}

                  <div className="text-content-light inline-block px-4 py-2 text-sm">
                    <p className="line-clamp-4 italic">
                      {item.inputPrompt}
                    </p>
                  </div>

                  <div className="flex flex-row flex-wrap space-x-1 px-2">
                    <div className="bg-surface-alpha-strong text-content-base inline-flex items-center rounded-md border border-transparent px-1.5 py-0.5 font-mono text-xs font-semibold">
                      {item.styleType}
                    </div>
                    <div className="bg-surface-alpha-strong text-content-base inline-flex items-center rounded-md border border-transparent px-1.5 py-0.5 font-mono text-xs font-semibold">
                      {item.creditCost} credits
                    </div>
                  </div>

                  <div className="flex flex-row justify-between space-x-2 p-4 pt-0">
                    <button
                      className="focus-ring text-content-strong border-stroke-strong hover:border-stroke-stronger data-[state=open]:bg-surface-alpha-light inline-flex h-8 items-center justify-center whitespace-nowrap rounded-lg border bg-transparent px-2.5 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50"
                      onClick={() => copyPrompt(item.inputPrompt)}
                      disabled={item.taskStatus === 'Processing'}
                    >
                      <Copy className="icon-xs me-1" size={14} />
                      {t("action.copy")}
                    </button>
                    {item.imageUrl && item.taskStatus !== 'Processing' && (
                      <a
                        href={item.imageUrl}
                        download={`polaroid-${item.id}.jpg`}
                        className="focus-ring text-content-strong border-stroke-strong hover:border-stroke-stronger inline-flex h-8 items-center justify-center whitespace-nowrap rounded-lg border bg-transparent px-2.5 text-sm font-medium transition-colors"
                      >
                        Download
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </Masonry>
          ) : init ? (
            <div className="flex min-h-96 items-center justify-center">
              <EmptyPlaceholder>
                <EmptyPlaceholder.Icon name="post" />
                <EmptyPlaceholder.Title>
                  {t("empty.title")}
                </EmptyPlaceholder.Title>
                <EmptyPlaceholder.Description>
                  {t("empty.description")}
                </EmptyPlaceholder.Description>
                <Button variant="outline" asChild>
                  <Link href="/mvp-simple">{t("action.generate")}</Link>
                </Button>
              </EmptyPlaceholder>
            </div>
          ) : (
            <div className="hidden"></div>
          )}
        </InfiniteScroll>
      </div>
    </Container>
  );
}
