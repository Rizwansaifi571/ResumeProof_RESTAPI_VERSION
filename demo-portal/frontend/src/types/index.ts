export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string;
  created_at: string;
}

export interface Application {
  id: string;
  job_id: string;
  candidate_name: string;
  candidate_email: string;
  github_url: string;
  resume_filename: string;
  transaction_id: string | null;
  verification_result: any | null;
  status: string;
  created_at: string;
  job_title?: string;
}
