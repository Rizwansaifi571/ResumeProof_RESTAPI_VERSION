'use client';
import React, { useState } from 'react';
import api from '@/lib/api';

interface GenerateKeyModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const GenerateKeyModal: React.FC<GenerateKeyModalProps> = ({ onClose, onSuccess }) => {
  const [label, setLabel] = useState('');
  const [environment, setEnvironment] = useState('test');
  const [loading, setLoading] = useState(false);
  const [rawKey, setRawKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/v1/keys/generate', { label, environment });
      setRawKey(res.data.apiKey);
      onSuccess(); // Trigger parent refresh so the masked key appears in the list
    } catch {
      setError('Failed to generate key. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (rawKey) {
      navigator.clipboard.writeText(rawKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setRawKey(null); // Clear from memory
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-50/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white/50">
          <h3 className="text-lg font-bold text-slate-900">Generate API Key</h3>
          <button onClick={handleClose} className="text-slate-500 hover:text-slate-900 transition">
            ✕
          </button>
        </div>

        <div className="p-6">
          {rawKey ? (
            <div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 text-amber-700 p-4 rounded-xl text-sm mb-6 flex space-x-3">
                <span className="text-lg">⚠️</span>
                <div>
                  <strong className="block mb-1 text-amber-600">Save this key now</strong>
                  This is the only time this key will be displayed. For security reasons, it cannot be retrieved later.
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-slate-500 text-sm font-medium mb-2">Your API Key</label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="text" 
                    readOnly
                    value={rawKey}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-indigo-600 font-mono text-sm outline-none"
                  />
                  <button 
                    onClick={copyToClipboard}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-900 px-4 py-2.5 rounded-lg border border-slate-300 transition flex items-center space-x-2"
                  >
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <button 
                onClick={handleClose}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-slate-900 font-medium py-2.5 rounded-lg transition"
              >
                I have saved it securely
              </button>
            </div>
          ) : (
            <form onSubmit={handleGenerate}>
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
                  {error}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="block text-slate-500 text-sm font-medium mb-1">Key Label</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Production Server 1"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 transition"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-slate-500 text-sm font-medium mb-2">Environment</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`cursor-pointer border rounded-lg p-3 text-center transition ${environment === 'test' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                      <input type="radio" name="env" value="test" className="hidden" checked={environment === 'test'} onChange={() => setEnvironment('test')} />
                      <div className="font-semibold mb-1">Test</div>
                      <div className="text-xs opacity-70">Doesn&apos;t consume quota</div>
                    </label>
                    <label className={`cursor-pointer border rounded-lg p-3 text-center transition ${environment === 'live' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                      <input type="radio" name="env" value="live" className="hidden" checked={environment === 'live'} onChange={() => setEnvironment('live')} />
                      <div className="font-semibold mb-1">Live</div>
                      <div className="text-xs opacity-70">Consumes quota</div>
                    </label>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-slate-900 font-medium py-2.5 rounded-lg transition disabled:opacity-50"
                  >
                    {loading ? 'Generating...' : 'Generate Key'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
