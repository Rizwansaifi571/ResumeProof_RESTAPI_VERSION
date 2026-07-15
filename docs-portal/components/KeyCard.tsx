'use client';
import React, { useState } from 'react';

interface KeyCardProps {
  id: string;
  label: string;
  prefix: string;
  environment: string;
  lastUsed: string | null;
  isActive: boolean;
  createdAt: string;
  onRevoke: (id: string) => Promise<void>;
}

export const KeyCard: React.FC<KeyCardProps> = ({
  id, label, prefix, environment, lastUsed, isActive, createdAt, onRevoke
}) => {
  const [revoking, setRevoking] = useState(false);

  const handleRevoke = async () => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone and any integrations using this key will break immediately.')) {
      return;
    }
    setRevoking(true);
    await onRevoke(id);
    setRevoking(false);
  };

  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  const lastUsedText = lastUsed 
    ? new Date(lastUsed).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Never used';

  return (
    <div className={`border p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between transition ${isActive ? 'bg-white/50 border-slate-200' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
      <div className="flex-1 mb-4 md:mb-0">
        <div className="flex items-center space-x-3 mb-2">
          <h3 className="text-slate-900 font-medium">{label}</h3>
          {isActive ? (
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">Active</span>
          ) : (
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600 border border-red-100">Revoked</span>
          )}
          <span className={`px-2 py-0.5 rounded text-xs font-mono font-medium border ${environment === 'live' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
            {environment}
          </span>
        </div>
        <div className="font-mono text-slate-500 text-sm mb-3">
          {prefix}••••••••••••••••••••••••
        </div>
        <div className="flex space-x-6 text-xs text-slate-500">
          <div>Created: {formattedDate}</div>
          <div>Last used: {lastUsedText}</div>
        </div>
      </div>
      
      {isActive && (
        <div className="flex items-center">
          <button 
            onClick={handleRevoke}
            disabled={revoking}
            className="text-sm bg-slate-100 hover:bg-red-500/20 hover:text-red-600 text-slate-700 px-4 py-2 rounded-lg transition border border-slate-300 hover:border-red-500/30 disabled:opacity-50"
          >
            {revoking ? 'Revoking...' : 'Revoke Key'}
          </button>
        </div>
      )}
    </div>
  );
};
