import { INITIAL_USER_CREDITS } from "@/lib/constants/billing";
import { ensureUserCreditInitialized } from "@/lib/credits/ensureUserCreditInitialized";

export { INITIAL_USER_CREDITS };

export async function getUserCredit(userId: string) {
  return ensureUserCreditInitialized(userId);
}
