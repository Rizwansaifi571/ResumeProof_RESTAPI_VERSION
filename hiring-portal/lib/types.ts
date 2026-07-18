export interface VerificationResult {
  id: string;
  transactionId: string;
  confidenceScore: number;
  status: "verified" | "flagged" | "rejected" | "error";
  githubUsername: string;
  reposFound: number;
  claimedProjects: number;
  verifiedProjects: number;
  commitAuthorship: boolean;
  skillAlignment: number;
  matchedSkills: string[];
  missingSkills: string[];
  flags: string[];
  aiAnalysis: AiAnalysis | null;
  rawGithubData: RawGithubData | null;
  createdAt: string;
}

export interface AiAnalysis {
  projectMatches: ProjectMatch[];
  skillVerification: {
    verifiedSkills: string[];
    unverifiedSkills: string[];
    missingFromGithub: string[];
  };
  redFlags: string[];
  overallVerdict: "authentic" | "mostly_authentic" | "suspicious" | "fabricated";
  summary: string;
}

export interface ProjectMatch {
  claimedProject: string;
  matchedRepo: string | null;
  matchConfidence: number;
  commitsByCandidate: number;
  techOverlap: string[];
  verdict: "verified" | "partial" | "not_found";
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  githubUsername: string;
  linkedinUrl?: string;
  trackingId: string;
  verificationStatus: "pending" | "verified" | "flagged" | "rejected" | "error";
  verificationResult: VerificationResult | null;
  verifiedAt: string | null;
  appliedAt: string;
}

export interface QualitySignals {
  accountAuthenticityScore: number;
  forkRatio: number;
  forkCount: number;
  originalCount: number;
  readmeCoverage: number;
  reposWithGoodReadme: number;
  lastCommitDaysAgo: number;
  activeMonthsInLastYear: number;
  contributionPattern: string;
  consistentWeeksLast6Months: number;
  primaryLanguage: string;
  languagesByDepth: { language: string; totalBytes: number; repoCount: number }[];
}

export interface RawGithubData {
  username?: string;
  qualitySignals?: QualitySignals;
  [key: string]: unknown;
}
