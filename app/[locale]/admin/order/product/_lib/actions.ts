"use server";

import { unstable_noStore as noStore, revalidatePath } from "next/cache";

import { omitBy } from "lodash-es";

import { ChargeProductHashids } from "@/db/dto/charge-product.dto";
import { prisma } from "@/db/prisma";
import { getErrorMessage } from "@/lib/handle-error";

import { assertSiteOwner } from "../../../_lib/auth";
import type { CreateSchema, UpdateSchema } from "./validations";

export async function createAction(input: CreateSchema) {
  noStore();
  try {
    await assertSiteOwner();
    const {
      title,
      locale,
      credit,
      amount,
      currency,
      creemProductId,
      tag = [],
      originalAmount,
      message = "",
      state,
    } = input;

    await Promise.all([
      await prisma.polaroidai_ChargeProduct.create({
        data: {
          title,
          locale,
          credit,
          amount,
          currency,
          originalAmount,
          creemProductId: creemProductId || null,
          tag,
          message,
          state,
        },
      }),
    ]);

    revalidatePath("/");

    return {
      data: null,
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}

export async function updateAction(input: UpdateSchema & { id: string }) {
  noStore();
  try {
    await assertSiteOwner();
    const [id] = ChargeProductHashids.decode(input.id);
    const {
      title,
      locale,
      credit,
      amount,
      currency,
      creemProductId,
      originalAmount,
      tag,
      message,
      state,
    } = input;
    await prisma.polaroidai_ChargeProduct.update({
      where: {
        id: id as number,
      },
      data: {
        title,
        locale,
        credit,
        amount,
        currency,
        creemProductId: creemProductId || null,
        originalAmount,
        tag,
        message,
        state,
      },
    });

    revalidatePath("/");

    return {
      data: null,
      error: null,
    };
  } catch (err) {
    console.log("err--->", err);
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}

export async function deleteAction(input: { id: string }) {
  try {
    await assertSiteOwner();
    const [id] = ChargeProductHashids.decode(input.id);
    await prisma.polaroidai_ChargeProduct.delete({
      where: {
        id: id as number,
      },
    });

    revalidatePath("/");
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}
