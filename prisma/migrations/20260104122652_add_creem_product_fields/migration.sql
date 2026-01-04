/*
  Warnings:

  - You are about to drop the `charge_order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `charge_product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `claimed_activity_order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `flux_data` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `flux_downloads` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `flux_views` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `gift_code` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `media` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `newsletters` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subscribers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_billing` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_credit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_credit_transaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_payment_info` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "charge_order";

-- DropTable
DROP TABLE "charge_product";

-- DropTable
DROP TABLE "claimed_activity_order";

-- DropTable
DROP TABLE "flux_data";

-- DropTable
DROP TABLE "flux_downloads";

-- DropTable
DROP TABLE "flux_views";

-- DropTable
DROP TABLE "gift_code";

-- DropTable
DROP TABLE "media";

-- DropTable
DROP TABLE "newsletters";

-- DropTable
DROP TABLE "subscribers";

-- DropTable
DROP TABLE "user_billing";

-- DropTable
DROP TABLE "user_credit";

-- DropTable
DROP TABLE "user_credit_transaction";

-- DropTable
DROP TABLE "user_payment_info";

-- CreateTable
CREATE TABLE "polaroidai_user_credit" (
    "id" SERIAL NOT NULL,
    "user_id" VARCHAR(200) NOT NULL,
    "credit" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "polaroidai_user_credit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "polaroidai_user_billing" (
    "id" SERIAL NOT NULL,
    "user_id" VARCHAR(200) NOT NULL,
    "state" VARCHAR NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" VARCHAR NOT NULL,
    "polaroid_id" INTEGER,
    "description" VARCHAR,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "polaroidai_user_billing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "polaroidai_user_credit_transaction" (
    "id" SERIAL NOT NULL,
    "user_id" VARCHAR(200) NOT NULL,
    "credit" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL,
    "billing_id" INTEGER,
    "type" VARCHAR NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "polaroidai_user_credit_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "polaroidai_user_payment_info" (
    "id" SERIAL NOT NULL,
    "user_id" VARCHAR(200) NOT NULL,
    "user_info" JSON,
    "creem_customer_id" VARCHAR,
    "creem_subscription_id" VARCHAR,
    "creem_price_id" VARCHAR,
    "creem_current_period_end" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "polaroidai_user_payment_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "polaroidai_polaroid_generation" (
    "id" SERIAL NOT NULL,
    "user_id" VARCHAR(200) NOT NULL,
    "request_id" VARCHAR NOT NULL,
    "input_type" VARCHAR NOT NULL,
    "input_content" TEXT,
    "input_image_url" VARCHAR,
    "output_image_url" VARCHAR,
    "thumbnail_url" VARCHAR,
    "style_type" VARCHAR(50) NOT NULL DEFAULT 'classic_polaroid',
    "task_status" VARCHAR NOT NULL,
    "is_private" BOOLEAN DEFAULT false,
    "download_num" INTEGER NOT NULL DEFAULT 0,
    "views_num" INTEGER NOT NULL DEFAULT 0,
    "credit_cost" INTEGER NOT NULL,
    "processing_time" INTEGER,
    "gemini_request_id" VARCHAR,
    "gemini_response" TEXT,
    "locale" VARCHAR(64),
    "error_msg" TEXT,
    "execute_start_time" BIGINT,
    "execute_end_time" BIGINT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSON,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "polaroidai_polaroid_generation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "polaroidai_polaroid_downloads" (
    "id" SERIAL NOT NULL,
    "polaroid_id" INTEGER NOT NULL,
    "user_id" VARCHAR(200) NOT NULL,
    "download_type" VARCHAR NOT NULL DEFAULT 'original',
    "user_agent" TEXT,
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "polaroidai_polaroid_downloads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "polaroidai_polaroid_views" (
    "id" SERIAL NOT NULL,
    "polaroid_id" INTEGER NOT NULL,
    "user_id" VARCHAR(200) NOT NULL,
    "view_duration" INTEGER,
    "referrer" VARCHAR(500),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "polaroidai_polaroid_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "polaroidai_media" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "key" VARCHAR NOT NULL,
    "url" VARCHAR NOT NULL,
    "color" VARCHAR,
    "blurhash" VARCHAR,
    "file_size" INTEGER NOT NULL,
    "file_type" VARCHAR NOT NULL,
    "md5" VARCHAR NOT NULL,
    "ext" JSON,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "polaroidai_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "polaroidai_charge_product" (
    "id" SERIAL NOT NULL,
    "amount" INTEGER NOT NULL,
    "original_amount" INTEGER NOT NULL,
    "credit" INTEGER NOT NULL,
    "currency" VARCHAR NOT NULL,
    "locale" VARCHAR NOT NULL,
    "title" VARCHAR NOT NULL,
    "tag" JSON,
    "message" TEXT,
    "state" VARCHAR NOT NULL,
    "creem_product_id" VARCHAR,
    "is_popular" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "polaroidai_charge_product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "polaroidai_charge_order" (
    "id" SERIAL NOT NULL,
    "user_id" VARCHAR(200) NOT NULL,
    "user_info" JSON,
    "amount" INTEGER NOT NULL,
    "credit" INTEGER NOT NULL,
    "phase" VARCHAR NOT NULL,
    "channel" VARCHAR NOT NULL,
    "currency" VARCHAR NOT NULL,
    "payment_at" TIMESTAMP(6),
    "result" JSON,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "polaroidai_charge_order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "polaroidai_gift_code" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(256) NOT NULL,
    "credit_amount" INTEGER NOT NULL,
    "used" BOOLEAN DEFAULT false,
    "used_by" VARCHAR(200),
    "used_at" TIMESTAMP(6),
    "transaction_id" INTEGER,
    "expired_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "polaroidai_gift_code_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "polaroidai_claimed_activity_order" (
    "id" SERIAL NOT NULL,
    "charge_order_id" INTEGER NOT NULL,
    "user_id" VARCHAR(200) NOT NULL,
    "credit" INTEGER NOT NULL,
    "activity_code" VARCHAR(200) NOT NULL,
    "transaction_id" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "polaroidai_claimed_activity_order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "polaroidai_newsletters" (
    "id" SERIAL NOT NULL,
    "subject" VARCHAR(200),
    "body" TEXT,
    "locale" VARCHAR(10),
    "sent_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "polaroidai_newsletters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "polaroidai_subscribers" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(120),
    "token" VARCHAR(50),
    "locale" VARCHAR(10),
    "subscribed_at" TIMESTAMP(6),
    "unsubscribed_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "polaroidai_subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "polaroidai_user_credit_user_id_key" ON "polaroidai_user_credit"("user_id");

-- CreateIndex
CREATE INDEX "polaroidai_user_billing_user_id_idx" ON "polaroidai_user_billing"("user_id");

-- CreateIndex
CREATE INDEX "polaroidai_user_credit_transaction_user_id_idx" ON "polaroidai_user_credit_transaction"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "polaroidai_user_payment_info_user_id_key" ON "polaroidai_user_payment_info"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "polaroidai_polaroid_generation_request_id_key" ON "polaroidai_polaroid_generation"("request_id");

-- CreateIndex
CREATE INDEX "polaroidai_polaroid_generation_user_id_idx" ON "polaroidai_polaroid_generation"("user_id");

-- CreateIndex
CREATE INDEX "polaroidai_polaroid_generation_task_status_idx" ON "polaroidai_polaroid_generation"("task_status");

-- CreateIndex
CREATE INDEX "polaroidai_polaroid_downloads_polaroid_id_idx" ON "polaroidai_polaroid_downloads"("polaroid_id");

-- CreateIndex
CREATE INDEX "polaroidai_polaroid_views_polaroid_id_idx" ON "polaroidai_polaroid_views"("polaroid_id");

-- CreateIndex
CREATE UNIQUE INDEX "polaroidai_media_key_key" ON "polaroidai_media"("key");

-- CreateIndex
CREATE UNIQUE INDEX "polaroidai_media_md5_key" ON "polaroidai_media"("md5");

-- CreateIndex
CREATE INDEX "polaroidai_charge_order_user_id_idx" ON "polaroidai_charge_order"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "polaroidai_gift_code_code_key" ON "polaroidai_gift_code"("code");

-- CreateIndex
CREATE UNIQUE INDEX "polaroidai_subscribers_email_key" ON "polaroidai_subscribers"("email");
