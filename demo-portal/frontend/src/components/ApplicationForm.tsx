import React, { useState } from 'react';
import { applyForJob } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';

export const ApplicationForm = ({ jobId, jobTitle }: { jobId: string, jobTitle: string }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    candidateName: '',
    candidateEmail: '',
    githubUrl: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Resume (PDF) is required.');
      return;
    }
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed.');
      return;
    }
    if (!formData.githubUrl.startsWith('https://github.com/')) {
      setError('GitHub URL must start with https://github.com/');
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      data.append('jobId', jobId);
      data.append('candidateName', formData.candidateName);
      data.append('candidateEmail', formData.candidateEmail);
      data.append('githubUrl', formData.githubUrl);
      data.append('resume', file);

      await applyForJob(data);
      navigate('/success', { state: { jobTitle } });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 mt-8">
      <h3 className="text-2xl font-bold text-slate-800 mb-6">Apply for this Position</h3>
      {error && <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input 
              required type="text"
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={formData.candidateName}
              onChange={e => setFormData({...formData, candidateName: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input 
              required type="email"
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={formData.candidateEmail}
              onChange={e => setFormData({...formData, candidateEmail: e.target.value})}
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">GitHub Profile URL</label>
          <input 
            required type="url" placeholder="https://github.com/username"
            className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={formData.githubUrl}
            onChange={e => setFormData({...formData, githubUrl: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Resume (PDF)</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md bg-slate-50 hover:bg-slate-100 transition-colors">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-slate-400" />
              <div className="flex text-sm text-slate-600 justify-center">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" accept=".pdf" className="sr-only" onChange={e => setFile(e.target.files?.[0] || null)} />
                </label>
              </div>
              <p className="text-xs text-slate-500">PDF up to 10MB</p>
              {file && <p className="text-sm font-medium text-slate-900 mt-2">Selected: {file.name}</p>}
            </div>
          </div>
        </div>

        <button 
          type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
};
