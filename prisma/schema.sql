-- ResumeProof — Raw SQL Schema Equivalent
-- Matches the Prisma schema defined in schema.prisma

CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "webhookUrl" TEXT,
    "webhookSecret" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "label" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsed" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "trackingId" TEXT NOT NULL,
    "candidateEmail" TEXT,
    "githubUrl" TEXT NOT NULL,
    "jdText" TEXT,
    "resumeFilename" TEXT,
    "resumeText" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "bullJobId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "results" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "confidenceScore" INTEGER,
    "status" TEXT,
    "githubUsername" TEXT,
    "reposFound" INTEGER,
    "claimedProjects" INTEGER,
    "verifiedProjects" INTEGER,
    "commitAuthorship" BOOLEAN,
    "skillAlignment" INTEGER,
    "matchedSkills" JSONB,
    "missingSkills" JSONB,
    "flags" JSONB,
    "rawGithubData" JSONB,
    "aiAnalysis" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "results_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "webhook_deliveries" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "statusCode" INTEGER,
    "responseBody" TEXT,
    "delivered" BOOLEAN NOT NULL DEFAULT false,
    "attempt" INTEGER NOT NULL DEFAULT 1,
    "nextRetryAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_deliveries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "audit_logs" (
    "id" BIGSERIAL NOT NULL,
    "clientId" TEXT,
    "event" TEXT NOT NULL,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- Unique constraints
CREATE UNIQUE INDEX "clients_email_key" ON "clients"("email");
CREATE UNIQUE INDEX "api_keys_keyHash_key" ON "api_keys"("keyHash");
CREATE UNIQUE INDEX "transactions_trackingId_key" ON "transactions"("trackingId");
CREATE UNIQUE INDEX "jobs_transactionId_key" ON "jobs"("transactionId");
CREATE UNIQUE INDEX "results_transactionId_key" ON "results"("transactionId");

-- Regular indexes
CREATE INDEX "api_keys_clientId_idx" ON "api_keys"("clientId");
CREATE INDEX "transactions_clientId_idx" ON "transactions"("clientId");
CREATE INDEX "transactions_trackingId_idx" ON "transactions"("trackingId");
CREATE INDEX "transactions_status_idx" ON "transactions"("status");
CREATE INDEX "webhook_deliveries_transactionId_idx" ON "webhook_deliveries"("transactionId");
CREATE INDEX "webhook_deliveries_delivered_idx" ON "webhook_deliveries"("delivered");
CREATE INDEX "audit_logs_clientId_idx" ON "audit_logs"("clientId");
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- Foreign key constraints
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "results" ADD CONSTRAINT "results_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
