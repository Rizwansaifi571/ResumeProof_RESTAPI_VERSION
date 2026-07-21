import { useState, useEffect } from 'react';
import type { Application } from '../types';
import { getAdminApplications, refreshApplicationStatus } from '../lib/api';
import { ApplicationsTable } from '../components/ApplicationsTable';
import { ShieldCheck } from 'lucide-react';

export const AdminPage = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  const fetchApps = async () => {
    try {
      const data = await getAdminApplications();
      setApplications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleRefreshStatus = async (id: string) => {
    setRefreshingId(id);
    try {
      await refreshApplicationStatus(id);
      await fetchApps();
    } catch (e) {
      console.error('Failed to refresh status', e);
    } finally {
      setRefreshingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center">
            <ShieldCheck className="w-8 h-8 text-blue-600 mr-2" />
            University Admin Dashboard
          </h1>
          <p className="text-slate-600 mt-2">Manage incoming applications and view ResumeProof verification scores.</p>
        </div>
        <button 
          onClick={fetchApps}
          className="bg-white border border-slate-300 text-slate-700 py-2 px-4 rounded-md font-medium hover:bg-slate-50 transition-colors"
        >
          Refresh List
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading applications...</div>
      ) : (
        <ApplicationsTable 
          applications={applications} 
          onRefreshStatus={handleRefreshStatus}
          refreshingId={refreshingId}
        />
      )}
    </div>
  );
};
