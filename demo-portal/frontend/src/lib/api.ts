import axios from 'axios';
import type { Job, Application } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

export const getJobs = async (): Promise<Job[]> => {
  const { data } = await api.get('/jobs');
  return data;
};

export const getJobById = async (id: string): Promise<Job> => {
  const { data } = await api.get(`/jobs/${id}`);
  return data;
};

export const applyForJob = async (formData: FormData): Promise<{ applicationId: string }> => {
  const { data } = await api.post('/apply', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};

export const getAdminApplications = async (): Promise<Application[]> => {
  const { data } = await api.get('/admin/applications');
  return data;
};

export const refreshApplicationStatus = async (applicationId: string): Promise<any> => {
  const { data } = await api.get(`/apply/${applicationId}/status`);
  return data;
};
