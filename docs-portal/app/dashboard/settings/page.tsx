'use client';
import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { WebhookConfigPanel } from '@/components/WebhookConfigPanel';

interface Profile {
  name: string;
  email: string;
  webhookUrl?: string;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/v1/settings/profile');
        setProfile(res.data);
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Settings</h1>
      <p className="text-slate-500 mb-8">Manage your account preferences and integrations.</p>

      <div className="space-y-8">
        <div className="bg-white border border-slate-200 shadow-slate-200/50 p-6 rounded-2xl shadow-xl">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Organization Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-slate-500 text-sm font-medium mb-1">Organization Name</label>
              <input 
                type="text" 
                disabled 
                value={profile?.name || ''} 
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-slate-500 cursor-not-allowed" 
              />
            </div>
            <div>
              <label className="block text-slate-500 text-sm font-medium mb-1">Email Address</label>
              <input 
                type="email" 
                disabled 
                value={profile?.email || ''} 
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-slate-500 cursor-not-allowed" 
              />
            </div>
          </div>
        </div>

          <WebhookConfigPanel initialWebhookUrl={profile?.webhookUrl} />
      </div>
    </div>
  );
}
