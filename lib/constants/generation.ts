export const PROVIDER_NAME = {
  KIE_AI: "kie_ai",
} as const;

export type ProviderName = (typeof PROVIDER_NAME)[keyof typeof PROVIDER_NAME];

export const GENERATION_STATUS = {
  PENDING: "pending",
  QUEUED: "queued",
  GENERATING: "generating",
  SUCCEEDED: "succeeded",
  FAILED: "failed",
} as const;

export type GenerationStatus =
  (typeof GENERATION_STATUS)[keyof typeof GENERATION_STATUS];

export const GENERATION_INPUT_TYPE = {
  TEXT: "text",
  MULTI_IMAGE: "multiImage",
  MULTI: "multi",
} as const;

export type GenerationInputType =
  (typeof GENERATION_INPUT_TYPE)[keyof typeof GENERATION_INPUT_TYPE];

export const GENERATION_CREDIT_COST = 3;
export const ANONYMOUS_FREE_GENERATION_LIMIT = 2;
