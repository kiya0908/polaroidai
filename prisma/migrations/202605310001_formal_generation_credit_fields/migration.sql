ALTER TABLE "polaroidai_polaroid_generation"
  ALTER COLUMN "user_id" DROP NOT NULL,
  ADD COLUMN "provider_name" VARCHAR(50),
  ADD COLUMN "provider_task_id" VARCHAR(120),
  ADD COLUMN "refunded_at" TIMESTAMP(6),
  ADD COLUMN "refund_billing_id" INTEGER;

CREATE UNIQUE INDEX "polaroidai_polaroid_generation_provider_task_id_key"
  ON "polaroidai_polaroid_generation"("provider_task_id");
