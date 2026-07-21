import type { Application } from '../types';
import { StatusBadge } from './StatusBadge';
import { RefreshCw, ExternalLink, FileText } from 'lucide-react';

export const ApplicationsTable = ({ 
  applications, 
  onRefreshStatus,
  refreshingId 
}: { 
  applications: Application[],
  onRefreshStatus: (id: string) => void,
  refreshingId: string | null
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Candidate</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Position</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Links</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {applications.map(app => (
            <tr key={app.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-slate-900">{app.candidate_name}</div>
                <div className="text-sm text-slate-500">{app.candidate_email}</div>
                <div className="text-xs text-slate-400 mt-1">{new Date(app.created_at).toLocaleDateString()}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                {app.job_title}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 space-y-2">
                <a href={app.github_url} target="_blank" rel="noreferrer" className="flex items-center text-blue-600 hover:underline">
                  <ExternalLink className="w-4 h-4 mr-1" /> GitHub
                </a>
                <a href={`http://localhost:7005/uploads/${app.resume_filename}`} target="_blank" rel="noreferrer" className="flex items-center text-blue-600 hover:underline">
                  <FileText className="w-4 h-4 mr-1" /> Resume
                </a>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={app.status} />
                {app.verification_result && app.verification_result.confidenceScore && (
                  <div className="text-xs text-slate-500 mt-2">
                    Score: <span className="font-bold text-slate-700">{app.verification_result.confidenceScore}/100</span>
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {(app.status === 'processing' || app.status === 'received') && app.transaction_id && (
                  <button 
                    onClick={() => onRefreshStatus(app.id)}
                    disabled={refreshingId === app.id}
                    className="text-blue-600 hover:text-blue-900 disabled:opacity-50 inline-flex items-center"
                  >
                    <RefreshCw className={`w-4 h-4 mr-1 ${refreshingId === app.id ? 'animate-spin' : ''}`} />
                    Poll Status
                  </button>
                )}
              </td>
            </tr>
          ))}
          {applications.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                No applications received yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
