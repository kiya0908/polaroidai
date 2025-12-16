import Hashids from "hashids";

import { env } from "@/env.mjs";

// 宝丽来生成记录ID哈希化
export const PolaroidHashids = new Hashids(
  env.HASHID_SALT + "polaroid",
  10,
  "abcdefghijklmnopqrstuvwxyz1234567890",
);

// 兼容旧代码的别名 (原 flux.dto.ts)
export const FluxHashids = PolaroidHashids;

// 宝丽来下载记录ID哈希化
export const PolaroidDownloadHashids = new Hashids(
  env.HASHID_SALT + "polaroid_download",
  10,
  "abcdefghijklmnopqrstuvwxyz1234567890",
);

// 宝丽来查看记录ID哈希化
export const PolaroidViewHashids = new Hashids(
  env.HASHID_SALT + "polaroid_view",
  10,
  "abcdefghijklmnopqrstuvwxyz1234567890",
);

// 宝丽来生成请求DTO
export interface PolaroidGenerateRequest {
  input_type: 'text' | 'image';
  input_content?: string;
  input_image_url?: string;
  style_type?: string;
  is_private?: boolean;
  locale?: string;
}

// 宝丽来生成响应DTO
export interface PolaroidGenerateResponse {
  id: string;
  output_image_url: string;
  thumbnail_url: string;
  processing_time: number;
  credit_cost: number;
  task_status: 'completed' | 'processing' | 'failed';
}

// 宝丽来历史记录DTO
export interface PolaroidHistoryItem {
  id: string;
  input_type: 'text' | 'image';
  input_content?: string | null;
  input_image_url?: string | null;
  output_image_url?: string | null;
  thumbnail_url?: string | null;
  style_type: string;
  task_status: 'pending' | 'processing' | 'completed' | 'failed';
  is_private: boolean;
  credit_cost: number;
  processing_time?: number | null;
  download_num: number;
  views_num: number;
  created_at: Date;
  updated_at: Date;
}

// 宝丽来历史记录查询参数DTO
export interface PolaroidHistoryQuery {
  page?: number;
  limit?: number;
  type?: 'text' | 'image' | 'all';
  status?: 'completed' | 'processing' | 'failed' | 'all';
  sort?: 'newest' | 'oldest';
}

// 宝丽来历史记录响应DTO
export interface PolaroidHistoryResponse {
  records: PolaroidHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    type: string;
    status: string;
    sort: string;
  };
}

// 宝丽来下载记录DTO
export interface PolaroidDownloadRecord {
  id: string;
  polaroid_id: string;
  userId: string;
  download_type: 'original' | 'thumbnail';
  user_agent?: string | null;
  ip_address?: string | null;
  created_at: Date;
}

// 宝丽来查看记录DTO
export interface PolaroidViewRecord {
  id: string;
  polaroid_id: string;
  userId: string;
  view_duration?: number | null;
  referrer?: string | null;
  created_at: Date;
}