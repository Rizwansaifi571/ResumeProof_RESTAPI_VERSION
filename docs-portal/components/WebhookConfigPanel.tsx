'use client';
import React, { useState } from 'react';
import api from '@/lib/api';

export function WebhookConfigPanel({ initialWebhookUrl }: { initialWebhookUrl?: string }) {
  const [url, setUrl] = useState(initialWebhookUrl || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [secret, setSecret] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSecret('');

    if (!url.startsWith('https://') && !url.includes('localhost')) {
      setError('Webhook URL must use HTTPS.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/v1/settings/webhook', { webhookUrl: url });
      setSecret(res.data.webhookSecret);
      setSuccess('Webhook configured successfully! Save your signing secret below.');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      if (err.response?.data?.message === 'webhook_endpoint_unreachable') {
        setError("We couldn't reach that URL — check it's publicly accessible and returns a 2xx response.");
      } else {
        setError(err.response?.data?.message || 'Failed to configure webhook.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 shadow-slate-200/50 p-6 rounded-2xl shadow-xl">
      <h2 className="text-xl font-bold text-slate-900 mb-2">Webhook Configuration</h2>
      <p className="text-slate-500 text-sm mb-6">Receive real-time HTTP POST payloads when verification jobs complete.</p>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      {success && !secret && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-4 py-3 rounded-lg text-sm mb-6">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-slate-500 text-sm font-medium mb-1">Endpoint URL</label>
          <input 
            type="url"
            required
            placeholder="https://api.yourdomain.com/webhooks/resumeproof"
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 transition"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 text-slate-900 font-medium px-5 py-2.5 rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'Testing & Saving...' : 'Save Webhook'}
        </button>
      </form>

      {secret && (
        <div className="mt-8 p-6 bg-slate-50 border border-indigo-100 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Webhook Signing Secret</h3>
          <p className="text-red-600 text-sm mb-4 font-medium flex items-center gap-2">
            ⚠️ Please copy this secret now. For your security, it will never be shown again!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <code className="flex-1 bg-white border border-slate-200 px-4 py-3 rounded-lg text-indigo-600 font-mono text-sm break-all">
              {secret}
            </code>
            <button
              onClick={handleCopy}
              className="bg-indigo-600 hover:bg-indigo-500 text-slate-900 px-6 py-3 rounded-lg font-medium transition whitespace-nowrap"
            >
              {copied ? 'Copied!' : 'Copy Secret'}
            </button>
          </div>
          
          <button
            onClick={() => setSecret('')}
            className="mt-6 w-full text-slate-500 hover:text-slate-900 text-sm font-medium transition bg-slate-100 hover:bg-slate-200 py-2 rounded-lg"
          >
            I have saved it safely
          </button>
        </div>
      )}
    </div>
  );
}
