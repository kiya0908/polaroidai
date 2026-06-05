# polaroidai.pro KIE.ai MVP 技术恢复实施说明

## 目标与边界

本次只恢复匿名图片生成的最小可用版本，不接登录、支付、会员和 credits 扣费。生成链路改为两阶段任务模式，避免 Vercel/Serverless 函数因后端长轮询超时。

明确不做：

- 不接登录、支付、订阅、会员系统。
- 不把成功图片长期归档到 S3/R2。
- 不做复杂数据看板，只做后台每日核心指标。
- 不开放图片合成，合成 tab 仅展示 Coming soon 并记录需求信号。

## API 设计

### 创建任务

```txt
POST /api/mvp-generate/start
```

请求：

```json
{
  "type": "text",
  "content": "a cozy polaroid photo of..."
}
```

行为：

- 校验 body 最大 8KB。
- `content` trim 后不能为空，最大 500 字符。
- 记录 `attempt_count` 和 `generate_click`。
- 检查 `mvp:generating:{ip}` 并发锁，TTL 60 秒。
- 检查 `provider_call_count`，每 IP 每天最多 2 次。
- 调用 KIE.ai 创建 task，返回 `taskId`。

响应：

```json
{
  "success": true,
  "data": {
    "taskId": "xxx",
    "status": "queued",
    "remainingFreeGenerations": 1
  }
}
```

### 查询状态

```txt
GET /api/mvp-generate/status?taskId=xxx
```

行为：

- 调用 KIE.ai 查询任务。
- 统一返回 `queued | generating | succeeded | failed`。
- 成功且有图片时记录 `generate_success`、`duration_ms`、`provider=kie_ai`。
- 失败或空图时记录 `generate_failed`。

### 获取下载链接

```txt
POST /api/mvp-download-url
```

请求：

```json
{
  "taskId": "xxx",
  "imageUrl": "https://..."
}
```

行为：

- 后端调用 KIE.ai direct download URL API。
- 记录 `download_click`。
- 返回 20 分钟有效下载链接，避免跨域图片无法下载。

## Provider 层

KIE.ai 细节集中在：

```txt
lib/ai/providers/kie.ts
```

route 层只调用：

- `createKieImageTask`
- `getKieImageTaskStatus`
- `getKieImageDownloadUrl`
- `normalizeKieStatus`
- `buildPolaroidPrompt`

## 环境变量

```env
KIE_AI_API_KEY=xxx
KIE_AI_BASE_URL=https://api.kie.ai
KIE_IMAGE_SIZE=1:1
KIE_IMAGE_ENABLE_FALLBACK=false
KIE_IMAGE_FALLBACK_MODEL=FLUX_MAX
KIE_IMAGE_UPLOAD_CN=false
ADMIN_PASSWORD=xxx
UPSTASH_REDIS_REST_URL=xxx
UPSTASH_REDIS_REST_TOKEN=xxx
DATABASE_URL=xxx
NEXT_PUBLIC_SITE_URL=xxx
```

真实密钥只允许放在 `.env` 或部署平台环境变量中，不能提交到代码仓库。

## 限流与并发

Redis key：

- `mvp:generating:{ip}`：并发锁，TTL 60 秒。
- `mvp:daily:{yyyy-mm-dd}:{ip}:attempt_count`
- `mvp:daily:{yyyy-mm-dd}:{ip}:provider_call_count`
- `mvp:daily:{yyyy-mm-dd}:{ip}:success_count`

生产环境 Redis 不可用时生成接口直接 fail closed，返回 `Generation is temporarily unavailable`，不能 fallback 成无限生成。

## 事件表

表：`polaroidai_mvp_events`

字段：

- `event_type`
- `anonymous_id`
- `session_id`
- `ip_address`
- `user_agent`
- `page_path`
- `referer`
- `country`
- `device_type`
- `task_id`
- `provider`
- `duration_ms`
- `is_bot`
- `metadata`
- `created_at`

事件：

- `page_view`
- `composition_tab_click`
- `generate_click`
- `generate_success`
- `generate_failed`
- `download_click`

后台 `/admin` 聚合最近 14 天非 bot 的每日访问量、生成点击、成功、失败、下载。

## Admin 保护

`/admin` 和 `/:locale/admin` 使用 Basic Auth，用户名固定为 `admin`，密码来自 `ADMIN_PASSWORD`。生产环境缺少 `ADMIN_PASSWORD` 时后台不放行。现有 Clerk `siteOwner` 校验继续保留为第二层保护。

## 失败场景

- KIE.ai key 缺失或错误：记录 `generate_failed`，用户看到通用错误。
- KIE.ai 返回成功但图片为空：视为失败并记录。
- 重复点击：并发锁返回 `Generation already in progress`。
- 超过每日免费 provider call：返回 `More generations coming soon`。
- direct download URL 失败：记录带失败 metadata 的 `download_click`，前端提示下载失败。

## 后续 credits/payment 接入点

后续不要把支付直接耦合到 provider。建议新增 `checkGenerationAllowance()`：

- 未登录：IP 免费额度。
- 已登录：用户 credits。
- 管理员：可配置无限制。

正式版本应在 KIE.ai 成功后转存图片到 S3/R2，再写入 `polaroidai_PolaroidGeneration`，并在成功后扣 credits。

## 验证清单

- `pnpm run build`
- `POST /api/mvp-generate/start` 返回 `taskId`，不等待图片完成。
- `GET /api/mvp-generate/status` 返回任务状态。
- 同一 IP 并发双击只创建 1 个 task。
- 第 3 次 provider call 返回 `More generations coming soon`。
- 生产 Redis 缺失时 fail closed。
- `/api/mvp-download-url` 返回可下载链接。
- `/admin` 无 Basic Auth 不可访问。
- 六类事件均可落表。
- `.env.example` 无真实密钥，`KIE_AI_API_KEY` 不出现在客户端变量中。
