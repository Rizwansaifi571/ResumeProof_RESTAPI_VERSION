import type { Job } from '../types';
import { Link } from 'react-router-dom';
import { Briefcase, Clock } from 'lucide-react';

export const JobCard = ({ job }: { job: Job }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex hover:shadow-md transition-shadow">
      <div className="w-2 bg-blue-600 flex-shrink-0" />
      <div className="p-6 flex-grow">
        <h2 className="text-xl font-bold text-slate-800 mb-2">{job.title}</h2>
        <div className="flex items-center text-sm text-slate-500 mb-4 space-x-4">
          <span className="flex items-center"><Briefcase className="w-4 h-4 mr-1" /> Full-time</span>
          <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> Posted {new Date(job.created_at).toLocaleDateString()}</span>
        </div>
        <p className="text-slate-600 line-clamp-2 mb-4">{job.description}</p>
        <Link 
          to={`/jobs/${job.id}`}
          className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-800"
        >
          View Details & Apply &rarr;
        </Link>
      </div>
    </div>
  );
};
