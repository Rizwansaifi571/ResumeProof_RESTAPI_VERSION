import { Pool } from "@neondatabase/serverless";
import { Candidate } from "./types";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS candidates (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(255),
      role VARCHAR(255) NOT NULL,
      githubUsername VARCHAR(255) NOT NULL,
      linkedinUrl VARCHAR(255),
      trackingId VARCHAR(255) UNIQUE NOT NULL,
      verificationStatus VARCHAR(50) NOT NULL,
      verificationResult JSONB,
      verifiedAt TIMESTAMP,
      appliedAt TIMESTAMP NOT NULL
    );
  `);
}

export async function readCandidates(): Promise<Candidate[]> {
  await initDb();
  const { rows } = await pool.query("SELECT * FROM candidates ORDER BY appliedAt DESC");
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || undefined,
    role: row.role,
    githubUsername: row.githubusername,
    linkedinUrl: row.linkedinurl || undefined,
    trackingId: row.trackingid,
    verificationStatus: row.verificationstatus as Candidate["verificationStatus"],
    verificationResult: row.verificationresult as Candidate["verificationResult"],
    verifiedAt: row.verifiedat ? new Date(row.verifiedat).toISOString() : null,
    appliedAt: new Date(row.appliedat).toISOString(),
  }));
}

export async function appendCandidate(candidate: Candidate): Promise<void> {
  await initDb();
  await pool.query(
    `INSERT INTO candidates (id, name, email, phone, role, "githubusername", "linkedinurl", "trackingid", "verificationstatus", "verificationresult", "verifiedat", "appliedat")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [
      candidate.id,
      candidate.name,
      candidate.email,
      candidate.phone || null,
      candidate.role,
      candidate.githubUsername,
      candidate.linkedinUrl || null,
      candidate.trackingId,
      candidate.verificationStatus,
      candidate.verificationResult ? JSON.stringify(candidate.verificationResult) : null,
      candidate.verifiedAt ? new Date(candidate.verifiedAt) : null,
      new Date(candidate.appliedAt),
    ]
  );
}

export async function updateCandidateByTrackingId(
  trackingId: string,
  updates: Partial<Candidate>
): Promise<boolean> {
  await initDb();
  
  const setClauses: string[] = [];
  const values: any[] = [];
  let index = 1;
  
  if (updates.verificationStatus !== undefined) {
    setClauses.push(`"verificationstatus" = $${index++}`);
    values.push(updates.verificationStatus);
  }
  if (updates.verificationResult !== undefined) {
    setClauses.push(`"verificationresult" = $${index++}`);
    values.push(updates.verificationResult ? JSON.stringify(updates.verificationResult) : null);
  }
  if (updates.verifiedAt !== undefined) {
    setClauses.push(`"verifiedat" = $${index++}`);
    values.push(updates.verifiedAt ? new Date(updates.verifiedAt) : null);
  }

  if (setClauses.length === 0) return false;

  values.push(trackingId);
  const result = await pool.query(
    `UPDATE candidates SET ${setClauses.join(", ")} WHERE trackingid = $${index}`,
    values
  );
  
  return result.rowCount ? result.rowCount > 0 : false;
}

export async function getCandidateByTrackingId(trackingId: string): Promise<Candidate | null> {
  await initDb();
  const { rows } = await pool.query("SELECT * FROM candidates WHERE trackingid = $1 LIMIT 1", [trackingId]);
  
  if (rows.length === 0) return null;
  const row = rows[0];
  
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || undefined,
    role: row.role,
    githubUsername: row.githubusername,
    linkedinUrl: row.linkedinurl || undefined,
    trackingId: row.trackingid,
    verificationStatus: row.verificationstatus as Candidate["verificationStatus"],
    verificationResult: row.verificationresult as Candidate["verificationResult"],
    verifiedAt: row.verifiedat ? new Date(row.verifiedat).toISOString() : null,
    appliedAt: new Date(row.appliedat).toISOString(),
  };
}
