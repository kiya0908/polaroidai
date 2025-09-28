import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Ratelimit } from "@upstash/ratelimit";
import { z } from "zod";

import { env } from "@/env.mjs";
import { redis } from "@/lib/redis";
import { getErrorMessage } from "@/lib/handle-error";

// API错误类型
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// 认证错误
export class AuthenticationError extends APIError {
  constructor(message: string = "Not authenticated") {
    super(message, 401, "AUTH_REQUIRED");
  }
}

// 权限错误
export class AuthorizationError extends APIError {
  constructor(message: string = "No permission") {
    super(message, 403, "NO_PERMISSION");
  }
}

// 限流错误
export class RateLimitError extends APIError {
  constructor(message: string = "Too Many Requests") {
    super(message, 429, "RATE_LIMIT_EXCEEDED");
  }
}

// 验证错误
export class ValidationError extends APIError {
  constructor(message: string, public details?: any) {
    super(message, 400, "VALIDATION_ERROR");
  }
}

// 业务逻辑错误
export class BusinessError extends APIError {
  constructor(message: string, code?: string) {
    super(message, 400, code);
  }
}

// API中间件配置
export interface APIMiddlewareConfig {
  requireAuth?: boolean;
  requireOwner?: boolean;
  rateLimit?: {
    requests: number;
    window: string;
    keyPrefix?: string;
  };
  validation?: {
    body?: z.ZodSchema;
    query?: z.ZodSchema;
  };
}

// API处理器类型
export type APIHandler = (
  req: NextRequest,
  context: {
    user?: any;
    userId?: string;
    validatedData?: any;
    params?: any;
  }
) => Promise<NextResponse>;

// 创建API中间件
export function createAPIMiddleware(
  config: APIMiddlewareConfig,
  handler: APIHandler
) {
  return async (req: NextRequest, params?: any) => {
    try {
      const context: any = { params };

      // 认证检查
      if (config.requireAuth) {
        const { userId } = auth();
        const user = await currentUser();

        if (!userId || !user) {
          throw new AuthenticationError();
        }

        context.user = user;
        context.userId = userId;

        // 权限检查
        if (config.requireOwner) {
          if (env.APP_ENV !== "production" && !user.publicMetadata.siteOwner) {
            throw new AuthorizationError();
          }
        }
      }

      // 限流检查
      if (config.rateLimit) {
        const { requests, window, keyPrefix = "api" } = config.rateLimit;
        
        const ratelimit = new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(requests, window),
          analytics: true,
        });

        const key = context.userId 
          ? `${keyPrefix}:${context.userId}`
          : `${keyPrefix}:${req.ip ?? "anonymous"}`;

        const { success } = await ratelimit.limit(key);
        if (!success) {
          throw new RateLimitError();
        }
      }

      // 数据验证
      if (config.validation) {
        const validatedData: any = {};

        // 验证请求体
        if (config.validation.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
          try {
            const body = await req.json();
            validatedData.body = config.validation.body.parse(body);
          } catch (error) {
            if (error instanceof z.ZodError) {
              throw new ValidationError("Invalid request body", error.errors);
            }
            throw new ValidationError("Invalid JSON in request body");
          }
        }

        // 验证查询参数
        if (config.validation.query) {
          try {
            const { searchParams } = new URL(req.url);
            const queryParams = Object.fromEntries(searchParams.entries());
            validatedData.query = config.validation.query.parse(queryParams);
          } catch (error) {
            if (error instanceof z.ZodError) {
              throw new ValidationError("Invalid query parameters", error.errors);
            }
            throw new ValidationError("Invalid query parameters");
          }
        }

        context.validatedData = validatedData;
      }

      // 执行处理器
      return await handler(req, context);

    } catch (error) {
      return handleAPIError(error);
    }
  };
}

// 统一错误处理
export function handleAPIError(error: unknown): NextResponse {
  console.error("API Error:", error);

  if (error instanceof APIError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        ...(error instanceof ValidationError && error.details ? { details: error.details } : {}),
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: error.errors,
      },
      { status: 400 }
    );
  }

  // 未知错误
  return NextResponse.json(
    {
      error: env.APP_ENV === "production" 
        ? "Internal server error" 
        : getErrorMessage(error),
      code: "INTERNAL_ERROR",
    },
    { status: 500 }
  );
}

// 成功响应辅助函数
export function successResponse(data: any, status: number = 200): NextResponse {
  return NextResponse.json(data, { status });
}

// 创建分页响应
export function paginatedResponse(
  data: any[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  }
): NextResponse {
  const { page, limit, total } = pagination;
  const totalPages = Math.ceil(total / limit);
  
  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
}

// 常用的限流配置
export const RATE_LIMITS = {
  // 账户信息查询：5次/5秒
  account: { requests: 5, window: "5 s", keyPrefix: "account" },
  
  // 宝丽来生成：10次/10秒
  generate: { requests: 10, window: "10 s", keyPrefix: "generate" },
  
  // 历史记录查询：20次/10秒
  history: { requests: 20, window: "10 s", keyPrefix: "history" },
  
  // 文件上传：5次/60秒
  upload: { requests: 5, window: "60 s", keyPrefix: "upload" },
  
  // 下载：30次/60秒
  download: { requests: 30, window: "60 s", keyPrefix: "download" },
  
  // 一般API：30次/10秒
  general: { requests: 30, window: "10 s", keyPrefix: "api" },
};

// 常用的验证Schema
export const COMMON_SCHEMAS = {
  // 分页查询
  pagination: z.object({
    page: z.string().transform(Number).pipe(z.number().min(1)).default("1"),
    limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default("20"),
  }),
  
  // ID参数
  id: z.object({
    id: z.string().min(1),
  }),
  
  // 批量ID
  ids: z.object({
    ids: z.array(z.string().min(1)).min(1).max(100),
  }),
};