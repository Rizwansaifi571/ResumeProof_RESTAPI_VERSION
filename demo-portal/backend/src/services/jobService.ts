import * as jobRepository from '../repositories/jobRepository';
import { AppError } from '../errors/AppError';

export const getJobs = async () => {
  return await jobRepository.findAllJobs();
};

export const getJobById = async (id: string) => {
  const job = await jobRepository.findJobById(id);
  if (!job) {
    throw new AppError('job_not_found', 404);
  }
  return job;
};
