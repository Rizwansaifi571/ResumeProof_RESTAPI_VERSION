import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Job } from '../types';
import { getJobById } from '../lib/api';
import { ApplicationForm } from '../components/ApplicationForm';
import { ArrowLeft } from 'lucide-react';

export const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getJobById(id).then(data => {
        setJob(data);
        setLoading(false);
      }).catch(() => {
        navigate('/jobs');
      });
    }
  }, [id, navigate]);

  if (loading) return <div className="text-center py-20 text-slate-500">Loading details...</div>;
  if (!job) return null;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <button onClick={() => navigate('/jobs')} className="flex items-center text-blue-600 hover:text-blue-800 mb-8 font-medium">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to all jobs
      </button>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-4">{job.title}</h1>
        
        <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">About the Role</h2>
        <p className="text-slate-600 whitespace-pre-wrap">{job.description}</p>
        
        <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">Requirements</h2>
        <p className="text-slate-600 whitespace-pre-wrap">{job.requirements}</p>
      </div>

      <ApplicationForm jobId={job.id} jobTitle={job.title} />
    </div>
  );
};
