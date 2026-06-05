import { env } from "@/env.mjs";

export type ProviderTaskStatus =
  | { status: "queued" | "generating"; taskId: string; raw: unknown }
  | { status: "succeeded"; taskId: string; imageUrls: string[]; raw: unknown }
  | { status: "failed"; taskId: string; errorMessage: string; raw: unknown };

type KieCreateTaskParams = {
  prompt: string;
  size?: string;
  callbackUrl?: string;
};

type KieDownloadUrlParams = {
  taskId: string;
  url: string;
};

const REQUEST_TIMEOUT_MS = 15_000;
const KIE_IMAGE_MODEL = "z-image";

function getKieConfig() {
  const apiKey = env.KIE_AI_API_KEY;
  const baseUrl = env.KIE_AI_BASE_URL.replace(/\/$/, "");

  if (!apiKey) {
    throw new Error("KIE.ai API key is not configured");
  }

  return { apiKey, baseUrl };
}

async function kieFetch(path: string, init: RequestInit) {
  const { apiKey, baseUrl } = getKieConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      cache: "no-store",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...init.headers,
      },
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok || (payload?.code && payload.code !== 200)) {
      throw new Error(
        payload?.msg ||
          payload?.message ||
          payload?.error ||
          `KIE.ai request failed (${response.status})`,
      );
    }

    return payload;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("KIE.ai request timed out");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function parseMaybeJson(value: unknown) {
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function getTaskId(payload: any) {
  return (
    payload?.data?.taskId ||
    payload?.data?.task_id ||
    payload?.data?.id ||
    payload?.taskId ||
    payload?.id
  );
}

export function buildPolaroidPrompt(content: string) {
  return [
    "Create a realistic AI Polaroid-style photo.",
    "Use a classic instant-film look with a clean white instant-photo border, warm vintage colors, subtle film grain, soft natural lighting, and a nostalgic candid-photo feeling.",
    "Keep the scene photorealistic and emotionally warm.",
    "Do not add logos, watermarks, UI text, captions, signatures, or brand marks.",
    `User request: ${content.trim()}`,
  ].join("\n");
}

export async function createKieImageTask({
  prompt,
  size = env.KIE_IMAGE_SIZE,
  callbackUrl,
}: KieCreateTaskParams) {
  const payload = await kieFetch("/api/v1/jobs/createTask", {
    method: "POST",
    body: JSON.stringify({
      model: KIE_IMAGE_MODEL,
      ...(callbackUrl ? { callBackUrl: callbackUrl } : {}),
      input: {
        prompt,
        aspect_ratio: size,
        nsfw_checker: true,
      },
    }),
  });

  const taskId = getTaskId(payload);
  if (!taskId) {
    throw new Error("KIE.ai task id was not returned");
  }

  return { taskId: String(taskId), raw: payload };
}

export function normalizeKieStatus(raw: unknown): ProviderTaskStatus {
  const payload = raw as any;
  const data = payload?.data || payload;
  const taskId = String(getTaskId(payload) || data?.taskId || "");
  const status = String(data?.status || data?.state || "").toUpperCase();
  const response = parseMaybeJson(data?.response);
  const resultJson = parseMaybeJson(data?.resultJson);
  const resultUrls = Array.isArray((resultJson as any)?.resultUrls)
    ? (resultJson as any).resultUrls
    : Array.isArray((response as any)?.resultUrls)
      ? (response as any).resultUrls
      : Array.isArray((response as any)?.result_urls)
        ? (response as any).result_urls
        : Array.isArray(data?.resultUrls)
          ? data.resultUrls
          : Array.isArray(data?.result_urls)
            ? data.result_urls
            : [];

  if (status === "SUCCESS" || data?.successFlag === 1) {
    if (!resultUrls.length) {
      return {
        status: "failed",
        taskId,
        errorMessage: "Generation succeeded but returned no image",
        raw,
      };
    }

    return {
      status: "succeeded",
      taskId,
      imageUrls: resultUrls.filter(Boolean).map(String),
      raw,
    };
  }

  if (
    status === "CREATE_TASK_FAILED" ||
    status === "GENERATE_FAILED" ||
    status === "FAILED" ||
    status === "ERROR" ||
    status === "FAIL" ||
    data?.successFlag === 2
  ) {
    return {
      status: "failed",
      taskId,
      errorMessage:
        data?.errorMessage ||
        data?.error ||
        data?.failMsg ||
        payload?.msg ||
        payload?.message ||
        "Generation failed",
      raw,
    };
  }

  return {
    status:
      status === "QUEUED" ||
      status === "PENDING" ||
      status === "WAITING" ||
      status === "QUEUING"
        ? "queued"
        : "generating",
    taskId,
    raw,
  };
}

export async function getKieImageTaskStatus(taskId: string) {
  const payload = await kieFetch(
    `/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`,
    { method: "GET" },
  );

  return normalizeKieStatus(payload);
}

export async function getKieImageDownloadUrl({
  taskId,
  url,
}: KieDownloadUrlParams) {
  const payload = await kieFetch("/api/v1/gpt4o-image/download-url", {
    method: "POST",
    body: JSON.stringify({ taskId, url }),
  });

  if (!payload?.data || typeof payload.data !== "string") {
    throw new Error("KIE.ai download URL was not returned");
  }

  return { downloadUrl: payload.data, expiresInSeconds: 20 * 60, raw: payload };
}
