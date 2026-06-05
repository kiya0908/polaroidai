import { prisma } from "@/db/prisma";
import {
  BILLING_STATE,
  BILLING_TYPE,
  CREDIT_TRANSACTION_TYPE,
} from "@/lib/constants/billing";
import { GENERATION_CREDIT_COST } from "@/lib/constants/generation";

export class InsufficientCreditsError extends Error {
  status = 402;

  constructor(message = "Insufficient credits") {
    super(message);
    this.name = "InsufficientCreditsError";
  }
}

type ConsumeGenerationCreditsParams = {
  userId: string;
  generationId: number;
  cost?: number;
};

export async function consumeGenerationCredits({
  userId,
  generationId,
  cost = GENERATION_CREDIT_COST,
}: ConsumeGenerationCreditsParams) {
  return prisma.$transaction(async (tx) => {
    const account = await tx.polaroidai_UserCredit.findUnique({
      where: { userId },
    });

    if (!account) {
      throw new Error("User credit account was not initialized");
    }

    if (account.credit < cost) {
      throw new InsufficientCreditsError();
    }

    const debit = await tx.polaroidai_UserCredit.updateMany({
      where: {
        userId,
        credit: {
          gte: cost,
        },
      },
      data: {
        credit: {
          decrement: cost,
        },
      },
    });

    if (debit.count === 0) {
      throw new InsufficientCreditsError();
    }

    const updatedAccount = await tx.polaroidai_UserCredit.findUniqueOrThrow({
      where: { userId },
    });

    const billing = await tx.polaroidai_UserBilling.create({
      data: {
        userId,
        state: BILLING_STATE.SUCCEEDED,
        amount: -cost,
        type: BILLING_TYPE.GENERATION_DEBIT,
        polaroidId: generationId,
        description: "Generation credits debit",
      },
    });

    await tx.polaroidai_UserCreditTransaction.create({
      data: {
        userId,
        credit: -cost,
        balance: updatedAccount.credit,
        billingId: billing.id,
        type: CREDIT_TRANSACTION_TYPE.GENERATION_DEBIT,
      },
    });

    return {
      account: updatedAccount,
      billing,
    };
  });
}
