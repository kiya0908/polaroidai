import { prisma } from "@/db/prisma";
import {
  BILLING_STATE,
  BILLING_TYPE,
  CREDIT_TRANSACTION_TYPE,
} from "@/lib/constants/billing";

type RefundGenerationCreditsParams = {
  generationId: number;
  reason?: string;
};

export async function refundGenerationCredits({
  generationId,
  reason = "Generation failed",
}: RefundGenerationCreditsParams) {
  return prisma.$transaction(async (tx) => {
    const generation = await tx.polaroidai_PolaroidGeneration.findUnique({
      where: { id: generationId },
    });

    if (!generation?.userId || generation.creditCost <= 0) {
      return { refunded: false as const, reason: "not_chargeable" };
    }

    const guarded = await tx.polaroidai_PolaroidGeneration.updateMany({
      where: {
        id: generation.id,
        refundedAt: null,
      },
      data: {
        refundedAt: new Date(),
      },
    });

    if (guarded.count === 0) {
      return { refunded: false as const, reason: "already_refunded" };
    }

    const account = await tx.polaroidai_UserCredit.findUnique({
      where: { userId: generation.userId },
    });

    if (!account) {
      throw new Error("User credit account was not found for refund");
    }

    const updatedAccount = await tx.polaroidai_UserCredit.update({
      where: { userId: generation.userId },
      data: {
        credit: {
          increment: generation.creditCost,
        },
      },
    });

    const billing = await tx.polaroidai_UserBilling.create({
      data: {
        userId: generation.userId,
        state: BILLING_STATE.SUCCEEDED,
        amount: generation.creditCost,
        type: BILLING_TYPE.GENERATION_REFUND,
        polaroidId: generation.id,
        description: reason,
      },
    });

    await tx.polaroidai_UserCreditTransaction.create({
      data: {
        userId: generation.userId,
        credit: generation.creditCost,
        balance: updatedAccount.credit,
        billingId: billing.id,
        type: CREDIT_TRANSACTION_TYPE.GENERATION_REFUND,
      },
    });

    await tx.polaroidai_PolaroidGeneration.update({
      where: { id: generation.id },
      data: {
        refundBillingId: billing.id,
      },
    });

    return {
      refunded: true as const,
      account: updatedAccount,
      billing,
    };
  });
}
