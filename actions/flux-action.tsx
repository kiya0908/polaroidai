// 临时兼容性文件 - 将逐步迁移到 polaroid-action.tsx
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getErrorMessage } from "@/lib/handle-error";

// 临时的兼容性函数，返回空数据避免构建错误
export const searchParamsSchema = z.object({
  page: z.coerce.number().default(1),
  pageSize: z.coerce.number().default(12),
  sort: z.string().optional(),
  model: z.string().optional(),
});

export async function getFluxById(fluxId: string) {
  // 临时返回null，避免构建错误
  console.warn('getFluxById is deprecated, please use getPolaroidById from polaroid-action.tsx');
  return null;
}

export async function getFluxDataByPage(params: {
  page: number;
  pageSize: number;
  model?: string;
}) {
  // 临时返回空数据，避免构建错误
  console.warn('getFluxDataByPage is deprecated, please use getPolaroidDataByPage from polaroid-action.tsx');
  
  try {
    return {
      data: {
        total: 0,
        page: params.page,
        pageSize: params.pageSize,
        data: [],
      },
    };
  } catch (error) {
    return {
      data: {
        total: 0,
        page: 0,
        pageSize: 0,
        data: [],
      },
      error: getErrorMessage(error),
    };
  }
}
