export interface VerificationResult {
  confidenceScore: number;
  status: string;
  githubUsername?: string;
  reposFound: number;
  claimedProjects: number;
  verifiedProjects: number;
  commitAuthorship: string;
  skillAlignment: number;
  matchedSkills: string[];
  missingSkills: string[];
  flags: string[];
  rawGithubData?: string;
  aiAnalysis?: string;
}

export interface VerificationResponse {
  trackingId: string;
  status: string;
  createdAt: string;
  completedAt?: string;
  result?: VerificationResult;
}
