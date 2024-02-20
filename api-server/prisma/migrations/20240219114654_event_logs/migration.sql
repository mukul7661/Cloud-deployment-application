-- CreateTable
CREATE TABLE "EventLog" (
    "event_id" TEXT NOT NULL,
    "deployment_id" TEXT NOT NULL,
    "log" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventLog_pkey" PRIMARY KEY ("event_id")
);
