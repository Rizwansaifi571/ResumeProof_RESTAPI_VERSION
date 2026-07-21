import { query } from '../config/db';

export interface CreateApplicationDto {
  jobId: string;
  candidateName: string;
  candidateEmail: string;
  githubUrl: string;
  resumeFilename: string;
}

export const createApplication = async (data: CreateApplicationDto) => {
  const res = await query(
    `INSERT INTO applications (job_id, candidate_name, candidate_email, github_url, resume_filename, status) 
     VALUES ($1, $2, $3, $4, $5, 'received') RETURNING id`,
    [data.jobId, data.candidateName, data.candidateEmail, data.githubUrl, data.resumeFilename]
  );
  return res.rows[0].id;
};

export const findAllApplications = async () => {
  const sql = `
    SELECT a.*, j.title as job_title 
    FROM applications a 
    JOIN jobs j ON a.job_id = j.id 
    ORDER BY a.created_at DESC
  `;
  const res = await query(sql);
  return res.rows;
};

export const findApplicationsByJob = async (jobId: string) => {
  const sql = `
    SELECT a.*, j.title as job_title 
    FROM applications a 
    JOIN jobs j ON a.job_id = j.id 
    WHERE a.job_id = $1 
    ORDER BY a.created_at DESC
  `;
  const res = await query(sql, [jobId]);
  return res.rows;
};

export const countApplicationsByJob = async (jobId: string) => {
  const res = await query('SELECT count(*) FROM applications WHERE job_id = $1', [jobId]);
  return parseInt(res.rows[0].count, 10);
};

export const updateApplicationTransaction = async (id: string, transactionId: string) => {
  await query(
    'UPDATE applications SET transaction_id = $1, status = $2 WHERE id = $3',
    [transactionId, 'processing', id]
  );
};

export const updateApplicationResult = async (id: string, status: string, result: any) => {
  await query(
    'UPDATE applications SET status = $1, verification_result = $2 WHERE id = $3',
    [status, JSON.stringify(result), id]
  );
};

export const findApplicationById = async (id: string) => {
  const res = await query('SELECT * FROM applications WHERE id = $1', [id]);
  return res.rows[0];
};

export const updateApplicationResultByTransactionId = async (transactionId: string, status: string, result: any) => {
  await query(
    'UPDATE applications SET status = $1, verification_result = $2 WHERE transaction_id = $3',
    [status, JSON.stringify(result), transactionId]
  );
};
