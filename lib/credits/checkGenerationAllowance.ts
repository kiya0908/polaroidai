import { getAnonymousAllowance } from "@/lib/anonymous/allowance";
import { GENERATION_CREDIT_COST } from "@/lib/constants/generation";
import { ensureUserCreditInitialized } from "@/lib/credits/ensureUserCreditInitialized";

type CheckGenerationAllowanceParams = {
  userId?: string | null;
  anonymousId: string;
};

export async function checkGenerationAllowance({
  userId,
  anonymousId,
}: CheckGenerationAllowanceParams) {
  if (userId) {
    const account = await ensureUserCreditInitialized(userId);
    return {
      mode: "user" as const,
      allowed: account.credit >= GENERATION_CREDIT_COST,
      balance: account.credit,
      cost: GENERATION_CREDIT_COST,
    };
  }

  const allowance = await getAnonymousAllowance(anonymousId);
  return {
    mode: "anonymous" as const,
    allowed: allowance.remaining > 0,
    remaining: allowance.remaining,
    used: allowance.used,
    limit: allowance.limit,
    cost: 0,
  };
}
