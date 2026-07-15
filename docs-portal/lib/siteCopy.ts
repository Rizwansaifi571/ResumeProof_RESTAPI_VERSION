export const heroVariants = [
  {
    h1: 'Verify claims from code',
    subheading: 'Cross-check a PDF, commit history, and repository signals in one verification job.',
    supporting: 'Built for ATS vendors, hiring platforms, and technical teams that need a real signal before interviews.',
  },
  {
    h1: 'Know if the code is real',
    subheading: 'POST a PDF and GitHub username, then score project matches and commit authorship.',
    supporting: 'Built for teams adding verification to recruiting workflows without building the pipeline themselves.',
  },
  {
    h1: 'Screen candidates by code',
    subheading: 'Extract claims, compare them to GitHub history, and return a 0-100 score.',
    supporting: 'Built for CTOs and engineering leads who want a fast, defensible check before technical interviews.',
  },
] as const;

export const howItWorks = [
  'Client uploads a PDF and GitHub username to POST /v1/verify; ms1 extracts the file and queues the job.',
  'ms2 pulls repos, commits, pinned projects, languages by code volume, account age, and README signals.',
  'The orchestrator cross-checks claims, computes a deterministic score, and delivers a signed webhook payload.',
] as const;

export const featureGrid = [
  {
    title: 'GitHub Cross-Check',
    description: 'Matches claimed projects against public repositories, pinned repos, and commit history before scoring.',
  },
  {
    title: 'Project Verification',
    description: 'Marks a project verified only when the repository evidence lines up with the resume claim.',
  },
  {
    title: 'Skill Alignment',
    description: 'Compares claimed skills against languages by code volume and flags gaps explicitly.',
  },
  {
    title: 'Confidence Score',
    description: 'Returns a 0-100 score from weighted signals, so teams can see why the result landed there.',
  },
  {
    title: 'Webhook Delivery',
    description: 'Pushes verification results to your endpoint when the job completes, with signed payloads.',
  },
  {
    title: 'Flags System',
    description: 'Adds clear flags when the profile is thin, inconsistent, or suspicious.',
  },
] as const;

export const socialProof = [
  '6 core signals checked',
  'PDF + GitHub username',
  'Deterministic score, not a black box',
  'HMAC-signed webhooks',
] as const;

export const ctaSection = {
  headline: 'Add verification before the interview',
  subtext: 'Create an API key, connect your webhook, and start scoring GitHub-backed claims in the same workflow you already use.',
  primaryLabel: 'Create API key',
  secondaryLabel: 'Read the docs',
} as const;

export const dashboardEmptyState = {
  headline: 'Create your first API key',
  description:
    'You need a key before you can send verification jobs or review webhook payloads. Create a test key for staging or a live key for production.',
  cta: 'Generate API key',
} as const;

export const docsIntro = [
  'ResumeProof verifies a PDF resume against a GitHub username and returns a confidence score, verified projects, commit authorship, skill alignment, and flags in one webhook payload. Use POST /v1/verify to queue the job, then read the result when delivery completes.',
  'To get started, create an API key in the dashboard, send a PDF plus GitHub username, and point webhooks at your app. If you are evaluating the API, start in the dashboard and then move into the request and response shapes below.',
] as const;

export const emailSubjects = {
  verificationComplete: 'Verification complete for a candidate',
  webhookFailure: 'Webhook delivery failed: action needed',
  monthlyUsage: 'Your ResumeProof monthly usage summary',
  apiKeyCreated: 'New ResumeProof API key created',
  apiKeyRevoked: 'ResumeProof API key revoked',
} as const;

export const flagMessages = [
  {
    code: 'NO_PROJECTS_VERIFIED',
    message: 'No repository evidence matched the projects listed on the resume.',
  },
  {
    code: 'NO_COMMIT_AUTHORSHIP',
    message: 'We could not verify commit authorship for the repos tied to this profile.',
  },
  {
    code: 'LOW_SKILL_ALIGNMENT',
    message: 'The claimed skills did not align closely with the languages used in the codebase.',
  },
  {
    code: 'SPARSE_GITHUB_PROFILE',
    message: 'The GitHub profile has limited public activity, which reduces confidence.',
  },
  {
    code: 'HIGH_FORK_RATIO',
    message: 'Most visible repositories are forks, so there is less original work to score.',
  },
  {
    code: 'INACTIVE_PROFILE',
    message: 'Recent public activity is low, which weakens the signal from GitHub history.',
  },
  {
    code: 'SUSPICIOUS_ACCOUNT_PATTERN',
    message: 'The account activity pattern differs from profiles we can verify cleanly.',
  },
  {
    code: 'AI_FLAGGED_SUSPICIOUS',
    message: 'The cross-checking model found profile details that deserve manual review.',
  },
] as const;