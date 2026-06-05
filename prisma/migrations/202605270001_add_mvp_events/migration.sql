CREATE TABLE "polaroidai_mvp_events" (
    "id" SERIAL NOT NULL,
    "event_type" VARCHAR(50) NOT NULL,
    "anonymous_id" VARCHAR(80),
    "session_id" VARCHAR(80),
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "page_path" VARCHAR(500),
    "referer" VARCHAR(1000),
    "country" VARCHAR(10),
    "device_type" VARCHAR(30),
    "task_id" VARCHAR(120),
    "provider" VARCHAR(50),
    "duration_ms" INTEGER,
    "is_bot" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "polaroidai_mvp_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "polaroidai_mvp_events_event_type_created_at_idx" ON "polaroidai_mvp_events"("event_type", "created_at");
CREATE INDEX "polaroidai_mvp_events_task_id_idx" ON "polaroidai_mvp_events"("task_id");
CREATE INDEX "polaroidai_mvp_events_session_id_idx" ON "polaroidai_mvp_events"("session_id");
CREATE INDEX "polaroidai_mvp_events_anonymous_id_idx" ON "polaroidai_mvp_events"("anonymous_id");
CREATE INDEX "polaroidai_mvp_events_provider_created_at_idx" ON "polaroidai_mvp_events"("provider", "created_at");
