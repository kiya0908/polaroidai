export const INITIAL_USER_CREDITS = 20;

export const BILLING_STATE = {
  SUCCEEDED: "succeeded",
  FAILED: "failed",
} as const;

export type BillingState = (typeof BILLING_STATE)[keyof typeof BILLING_STATE];

export const BILLING_TYPE = {
  INITIAL_GRANT: "initial_grant",
  GENERATION_DEBIT: "generation_debit",
  GENERATION_REFUND: "generation_refund",
} as const;

export type BillingType = (typeof BILLING_TYPE)[keyof typeof BILLING_TYPE];

export const CREDIT_TRANSACTION_TYPE = {
  INITIAL_GRANT: "initial_grant",
  GENERATION_DEBIT: "generation_debit",
  GENERATION_REFUND: "generation_refund",
} as const;

export type CreditTransactionType =
  (typeof CREDIT_TRANSACTION_TYPE)[keyof typeof CREDIT_TRANSACTION_TYPE];
