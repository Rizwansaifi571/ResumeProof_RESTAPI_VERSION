# ResumeProof Microservice 1 (ms1) - Gateway & Orchestrator

## Introduction
The `ms1` microservice is the primary gateway and orchestrator for the ResumeProof platform. It handles client authentication (JWT for the dashboard, API keys for the widget), manages client accounts and webhook configurations, processes incoming resume verification requests via file uploads, enforces usage quotas using Redis, and enqueues verification jobs for processing by worker services (`ms2`). It also provides endpoints for clients to poll for verification status and manages webhook dispatching once results are ready.

## Setup & Run
This is a Node.js/TypeScript application. Standard scripts include:
- `npm run dev` - Starts the development server with live reload.
- `npm run build` - Compiles the TypeScript source code into the `dist/` directory.
- `npm start` - Runs the compiled production code.
- `npm run db:push` / `npm run db:migrate` - Synchronizes the Prisma schema with the PostgreSQL database.

## Controllers

### `authController.ts`
Handles client registration, authentication, and session management.
- `register`: Validates input and creates a new client account.
- `verifyEmail`: Marks a newly registered client's email as verified via token.
- `login`: Authenticates credentials and returns JWT access/refresh tokens.
- `refresh`: Issues a new access token using a valid refresh token.
- `logout`: Revokes the current session refresh token.
- `forgotPassword`: Generates a reset token and triggers a password reset email.
- `resetPassword`: Validates the reset token and updates the client's password.

### `internalController.ts`
Handles internal communication from other microservices (like `ms2` workers).
- `handleResult`: Receives verification results, updates the transaction, and triggers webhook delivery.

### `keyController.ts`
Manages API keys for clients.
- `generate`: Creates a new API key (hashed for security) and returns the raw key to the client.
- `list`: Returns all active API keys associated with the authenticated client.
- `revoke`: Deactivates a specific API key so it can no longer be used.

### `pollController.ts`
Provides polling endpoints for the widget.
- `getStatus`: Returns the current status of a verification job (pending, processing, or done) by tracking ID.

### `settingsController.ts`
Manages client account settings.
- `updateWebhook`: Updates the client's webhook URL and sends a test ping to verify connectivity.
- `getProfile`: Retrieves the client's account profile (plan, quota, verification status).

### `usageController.ts`
Tracks API usage metrics.
- `getUsage`: Fetches the client's current monthly usage from Redis and returns it against their quota.

### `verifyController.ts`
Handles the core verification submission logic.
- `submitVerification`: Parses the uploaded PDF resume, creates a transaction, and enqueues a verification job.

## Services

### `apiKeyService.ts`
- `generateApiKey`: Hashes a raw key, stores it in the DB, and returns the raw key to the caller.
- `listClientKeys`: Queries the database for all active keys for a specific client.
- `revokeKey`: Soft-deletes (deactivates) an API key in the database.
- `verifyApiKey`: Validates an incoming raw API key against the stored hashes.

### `auditService.ts`
- `logEvent`: Inserts audit trail records into the database for significant actions (e.g., job submissions).

### `clientService.ts`
- `registerNewClient`: Hashes passwords, creates a client record, and sends an email verification link.
- `verifyClientEmail`: Validates the email token and marks the client as verified.
- `authenticateClient`: Compares passwords and issues a new JWT token pair if valid.
- `setWebhookConfig`: Generates a webhook secret, tests the URL, and saves it to the client record.
- `requestPasswordReset`: Creates a reset token and sends a password reset email if the client exists.
- `resetPassword`: Validates the reset token and updates the client's password hash.
- `getProfile`: Fetches client account details from the repository.

### `emailService.ts`
- `sendEmailVerificationLink`: Dispatches an email containing the account verification link via AWS SES/Nodemailer.
- `sendPasswordResetEmail`: Dispatches an email containing the password reset link via AWS SES/Nodemailer.

### `jwtService.ts`
- `issueTokenPair`: Generates a new JWT access token and refresh token, storing the refresh session in the DB.
- `verifyRefreshToken`: Validates a refresh token against the database to ensure it hasn't expired or been revoked.
- `rotateRefreshToken`: Revokes an old refresh token and issues a new token pair.
- `revokeSession`: Deletes a specific refresh token session from the database.

### `pdfService.ts`
- `extractTextFromPdfBuffer`: Uses `pdf-parse` to extract plain text from an uploaded PDF buffer.

### `queueService.ts`
- `enqueueVerificationJob`: Adds a new verification task to the Redis BullMQ queue for `ms2` to process.
- `getQueueStats`: Returns current queue metrics (wait, active, completed, failed counts).

### `verificationService.ts`
- `initiateVerification`: Extracts text from the PDF, creates a database transaction, and enqueues the job.
- `getVerificationStatus`: Looks up a transaction by tracking ID and returns its current status and results if completed.

### `webhookService.ts`
- `sendWebhookTestPing`: Sends a signed test payload to verify a newly configured webhook URL.
- `dispatchWebhook`: Sends a signed payload containing verification results to the client, handling retries on failure.

## Repositories

### `apiKeyRepository.ts`
- `findActiveKeysByPrefix`: Looks up active API keys by their prefix.
- `createApiKey`: Inserts a new hashed API key record into the database.
- `listKeysByClient`: Retrieves all keys belonging to a specific client.
- `revokeKey`: Updates an API key record to set `isActive` to false.
- `updateLastUsed`: Updates the `lastUsed` timestamp for an API key.

### `clientRepository.ts`
- `findClientByEmail`: Retrieves a client record by their email address.
- `createClient`: Inserts a new client record with a hashed password.
- `findClientById`: Retrieves a client record by their unique ID.
- `markEmailVerified`: Updates a client record to set `isVerified` to true.
- `updateWebhookConfig`: Updates a client's webhook URL and HMAC secret.
- `createEmailVerification`: Inserts a new email verification token record.
- `findEmailVerificationByHash`: Looks up an email verification token by its hash.
- `deleteEmailVerification`: Removes an email verification token after use.

### `resultRepository.ts`
- `createResult`: Upserts verification results into the database linked to a transaction.

### `transactionRepository.ts`
- `updateTransactionComplete`: Marks a transaction status as `done` and sets the completion timestamp.

### `webhookDeliveryRepository.ts`
- `createDeliveryRecord`: Creates a new record to track webhook delivery attempts.
- `markDelivered`: Updates a webhook record as successfully delivered with status code.
- `incrementAttempt`: Increments the attempt counter and schedules a retry for failed webhooks.
- `getPendingRetries`: Retrieves webhook deliveries that failed and are scheduled for retry.

## Middlewares

### `authenticateApiKey.ts`
- `authenticateApiKey`: Validates the `Authorization: Bearer <API_KEY>` header, authenticates it via `apiKeyService`, and attaches `clientId` to the request.

### `authenticateJwt.ts`
- `authenticateJwt`: Validates the JWT access token from headers and attaches `clientId` to the request for dashboard endpoints.

### `enforceQuotaMiddleware.ts`
- `enforceQuotaMiddleware`: Checks Redis to ensure the authenticated client has not exceeded their monthly verification limit.

### `internalAuthMiddleware.ts`
- `internalAuthMiddleware`: Validates the `x-internal-secret` header to secure endpoints called by other internal microservices.

### `multerUploadMiddleware.ts`
- `upload`: Configures `multer` to accept PDF file uploads and store them in memory buffers.

### `validateVerifyRequestMiddleware.ts`
- `validateVerifyRequestMiddleware`: Validates incoming verification payloads (like GitHub URLs) using Zod schemas.

## Routes

### `authRoutes.ts`
- `POST /v1/auth/register` -> `authController.register`
- `GET /v1/auth/verify-email` -> `authController.verifyEmail`
- `POST /v1/auth/login` -> `authController.login`
- `POST /v1/auth/refresh` -> `authController.refresh`
- `POST /v1/auth/logout` -> `authController.logout` (Protected by JWT)
- `POST /v1/auth/forgot-password` -> `authController.forgotPassword`
- `POST /v1/auth/reset-password` -> `authController.resetPassword`

### `internalRoutes.ts`
- `POST /internal/result` -> `internalController.handleResult` (Protected by Internal Secret)

### `keyRoutes.ts`
- `POST /v1/keys/generate` -> `keyController.generate` (Protected by JWT)
- `GET /v1/keys/` -> `keyController.list` (Protected by JWT)
- `DELETE /v1/keys/:keyId` -> `keyController.revoke` (Protected by JWT)

### `pollRoutes.ts`
- `GET /v1/verify/:trackingId` -> `pollController.getStatus` (Protected by API Key)

### `settingsRoutes.ts`
- `POST /v1/settings/webhook` -> `settingsController.updateWebhook` (Protected by JWT)
- `GET /v1/settings/profile` -> `settingsController.getProfile` (Protected by JWT)

### `usageRoutes.ts`
- `GET /v1/usage/` -> `usageController.getUsage` (Protected by JWT)

### `verifyRoutes.ts`
- `POST /v1/verify/` -> `verifyController.submitVerification` (Protected by API Key, checks quota, handles PDF upload)

### `healthRoutes.ts`
- `GET /health` -> Returns a simple JSON response indicating server uptime and OK status.

### `index.ts`
- Aggregates all route modules and mounts them under their respective prefixes (e.g., `/v1/auth`, `/v1/keys`, `/internal`).

## Jobs

### `cleanupJob.ts`
- `startCleanupJob`: Initializes a cron job that periodically clears `resumeText` from transactions older than 30 days to save database storage.

## Errors

### `AppError.ts`
- `AppError`: A custom Error class that extends `Error` to include an HTTP status code and a predictable error message string.

### `globalErrorHandler.ts`
- `globalErrorHandler`: An Express error-handling middleware that catches `AppError`s to return clean JSON responses, and logs/masks unexpected 500 server errors.

## Config & Utils

### `config/env.ts`
- Loads `.env` file and uses Zod to validate and type-cast required environment variables on startup.

### `config/prismaClient.ts`
- Initializes and exports a singleton instance of the Prisma ORM client for database interactions.

### `config/redisClient.ts`
- Initializes and exports a singleton Redis connection used for caching quotas and BullMQ queues.

### `utils/generateTrackingId.ts`
- `generateTrackingId`: Generates unique, human-readable identifiers (e.g., `RPV-YYYY-MM-DD-XXXX`) for tracking verification requests.

### `utils/logger.ts`
- Configures `winston` for structured logging, appending timestamps and outputting to console and PM2 logs.

### `utils/validatePdfMagicBytes.ts`
- `isValidPdf`: Inspects the first few bytes of a file buffer to ensure it genuinely has a PDF signature, preventing spoofed extensions.
