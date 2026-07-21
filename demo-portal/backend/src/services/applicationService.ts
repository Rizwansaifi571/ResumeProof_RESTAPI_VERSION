import * as applicationRepository from '../repositories/applicationRepository';
import * as jobService from './jobService';
import { CreateApplicationDto } from '../repositories/applicationRepository';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env';
import { AppError } from '../errors/AppError';

export const submitApplication = async (data: CreateApplicationDto) => {
  // Validate job exists
  const job = await jobService.getJobById(data.jobId);
  
  const applicationId = await applicationRepository.createApplication(data);

  // Trigger MS1 Verification
  try {
    const resumePath = path.join(__dirname, '../../uploads', data.resumeFilename);
    const form = new FormData();
    form.append('resume', fs.createReadStream(resumePath), { filename: data.resumeFilename });
    form.append('githubUrl', data.githubUrl);
    form.append('jdText', job.requirements);
    form.append('candidateEmail', data.candidateEmail);

    const ms1Url = env.RESUMEPROOF_API_URL || 'http://localhost:7000';
    const apiKey = env.RESUMEPROOF_API_KEY;

    if (apiKey) {
      const response = await axios.post(`${ms1Url}/v1/verify`, form, {
        headers: {
          ...form.getHeaders(),
          'x-api-key': apiKey
        }
      });
      
      const transactionId = response.data.trackingId || response.data.transactionId;
      if (transactionId) {
        await applicationRepository.updateApplicationTransaction(applicationId, transactionId);
      }
    }
  } catch (error: any) {
    console.error('Failed to trigger MS1 verification:', error?.response?.data || error.message);
    // Don't fail the overall application submission if MS1 triggering fails, just log it.
  }

  return applicationId;
};

export const checkApplicationStatus = async (applicationId: string) => {
  const app = await applicationRepository.findApplicationById(applicationId);
  if (!app) throw new AppError('application_not_found', 404);
  if (!app.transaction_id) throw new AppError('no_transaction_id', 400);
  if (app.status !== 'processing') return app; // already done

  try {
    const ms1Url = env.RESUMEPROOF_API_URL || 'http://localhost:7000';
    const apiKey = env.RESUMEPROOF_API_KEY;

    const response = await axios.get(`${ms1Url}/v1/verify/${app.transaction_id}`, {
      headers: { 'x-api-key': apiKey }
    });

    const ms1Data = response.data;
    if (ms1Data.status === 'completed' || ms1Data.status === 'failed') {
      const newStatus = ms1Data.status === 'completed' ? 'verified' : 'failed';
      await applicationRepository.updateApplicationResult(applicationId, newStatus, ms1Data.result || ms1Data);
      app.status = newStatus;
      app.verification_result = ms1Data.result || ms1Data;
    }
  } catch (error: any) {
    console.error('Failed to poll MS1:', error?.response?.data || error.message);
  }

  return app;
};

export const getAllApplications = async () => {
  return await applicationRepository.findAllApplications();
};

export const getApplicationsByJob = async (jobId: string) => {
  return await applicationRepository.findApplicationsByJob(jobId);
};
