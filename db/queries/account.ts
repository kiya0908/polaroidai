import { prisma } from "@/db/prisma";

export async function getUserCredit(userId: string) {
  let accountInfo = await prisma.polaroidai_UserCredit.findFirst({
    where: {
      userId,
    },
  });
  if (!accountInfo?.id) {
    const data = await prisma.polaroidai_UserCredit.create({
      data: {
        userId: userId,
        credit: 0,
      },
    });
    accountInfo = data;
  }
  return accountInfo;
}
