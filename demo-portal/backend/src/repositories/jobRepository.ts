import { query } from '../config/db';

export const findAllJobs = async () => {
  const res = await query('SELECT id, title, description, requirements, created_at FROM jobs ORDER BY created_at DESC');
  return res.rows;
};

export const findJobById = async (id: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) return null;

  const res = await query('SELECT id, title, description, requirements, created_at FROM jobs WHERE id = $1', [id]);
  return res.rows[0] || null;
};
