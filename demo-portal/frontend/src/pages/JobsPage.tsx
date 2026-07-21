import { useEffect, useState } from 'react';
import type { Job } from '../types';
import { getJobs } from '../lib/api';
import { JobCard } from '../components/JobCard';

export const JobsPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getJobs().then(data => {
      setJobs(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Open Positions</h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">Join our team and help build the future of our university placement portal.</p>
      </div>
      
      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading jobs...</div>
      ) : (
        <div className="space-y-6">
          {jobs.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
};
