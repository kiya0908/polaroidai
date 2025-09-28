import { Prisma } from "@prisma/client";

export enum Currency {
  CNY = "CNY",
  USD = "USD",
}

export enum OrderPhase {
  Pending = "Pending",
  Paid = "Paid",
  Canceled = "Canceled",
  Failed = "Failed",
}

export enum PaymentChannelType {
  Alipay = "Alipay",
  WeChat = "WeChat",
  Stripe = "Stripe",
  GiftCode = "GiftCode",
  InviteCode = "InviteCode",
  ActivityCredit = "Event Gift",
}

export enum BillingType {
  Refund = "Refund", // 退款
  Withdraw = "Withdraw",
}

export enum FluxTaskStatus {
  Processing = "processing",
  Succeeded = "succeeded",
  Failed = "failed",
  Canceled = "canceled",
}

export type UserCreditDto = Prisma.polaroidai_UserCreditGetPayload<any>;

export type UserCreditSchema = Prisma.polaroidai_UserCreditCreateInput;

export type UserCreditSelectDto = Omit<UserCreditDto, "id"> & { id: string };

export type ChargeProductDto = Prisma.polaroidai_ChargeProductGetPayload<any>;

export type ChargeProductSchema = Prisma.polaroidai_ChargeProductCreateInput;

export type ChargeProductSelectDto = Omit<ChargeProductDto, "id"> & {
  id: string;
};

export type ChargeOrderDto = Prisma.ChargeOrderGetPayload<any>;

export type GiftCodeDto = Prisma.polaroidai_GiftCodeGetPayload<any>;

export type GiftCodeSchema = Prisma.polaroidai_GiftCodeCreateInput;

export type GiftCodeSelectDto = Omit<GiftCodeDto, "id"> & { id: string };

// Flux相关类型已弃用，使用宝丽来相关类型
// export type FluxDto = Prisma.FluxDataGetPayload<any>;
// export type FluxSchema = Prisma.FluxDataCreateInput;
// export type FluxSelectDto = Omit<FluxDto, "id"> & { id: string };

// 宝丽来相关类型
export type PolaroidDto = Prisma.polaroidai_PolaroidGenerationGetPayload<any>;
export type PolaroidSchema = Prisma.polaroidai_PolaroidGenerationCreateInput;
export type PolaroidSelectDto = Omit<PolaroidDto, "id"> & { id: string };
