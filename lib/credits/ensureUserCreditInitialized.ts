import { Prisma } from "@prisma/client";

import { prisma } from "@/db/prisma";
import {
  BILLING_STATE,
  BILLING_TYPE,
  CREDIT_TRANSACTION_TYPE,
  INITIAL_USER_CREDITS,
} from "@/lib/constants/billing";

export async function ensureUserCreditInitialized(userId: string) {
  const existing = await prisma.polaroidai_UserCredit.findUnique({
    where: { userId },
  });
  if (existing) return existing;

  try {
    return await prisma.$transaction(async (tx) => {
      const account = await tx.polaroidai_UserCredit.create({
        data: {
          userId,
          credit: INITIAL_USER_CREDITS,
        },
      });

      const billing = await tx.polaroidai_UserBilling.create({
        data: {
          userId,
          state: BILLING_STATE.SUCCEEDED,
          amount: INITIAL_USER_CREDITS,
          type: BILLING_TYPE.INITIAL_GRANT,
          description: "Initial signup credits",
        },
      });

      await tx.polaroidai_UserCreditTransaction.create({
        data: {
          userId,
          credit: INITIAL_USER_CREDITS,
          balance: account.credit,
          billingId: billing.id,
          type: CREDIT_TRANSACTION_TYPE.INITIAL_GRANT,
        },
      });

      return account;
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const account = await prisma.polaroidai_UserCredit.findUnique({
        where: { userId },
      });
      if (account) return account;
    }

    throw error;
  }
}
