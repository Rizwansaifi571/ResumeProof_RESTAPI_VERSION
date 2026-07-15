'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { setTokens } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/v1/auth/login', { email, password });
      setTokens(response.data.accessToken, response.data.refreshToken);
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { error?: string } } };
      
      if (error.response?.status === 429) {
        setError('Too many requests. Please slow down.');
      } else if (error.response?.status === 401 || error.response?.data?.error === 'invalid_credentials') {
        setError('Invalid email or password.');
      } else if (error.response?.status === 403 || error.response?.data?.error === 'email_not_verified') {
        setError('Please verify your email address before logging in.');
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      <Link href="/" className="flex items-center gap-2.5 group mb-8 absolute top-8 left-8">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
            <path d="M2 11L5 2L9 9L11 5L12 11" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="font-semibold text-slate-900 text-lg tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>ResumeProof</span>
      </Link>

      <div className="bg-white border border-slate-200 p-10 rounded-2xl max-w-md w-full shadow-xl shadow-slate-200/50">
        <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Welcome back</h1>
        <p className="text-slate-500 text-sm text-center mb-8">Log in to manage your API keys and verification jobs.</p>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/><path d="M7 4.5V7M7 9.5h.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-slate-700 text-sm font-semibold mb-1.5">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
          </div>
          <div>
            <div className="flex justify-between mb-1.5">
              <label className="block text-slate-700 text-sm font-semibold">Password</label>
              <Link href="/forgot-password" className="text-indigo-600 text-sm hover:text-indigo-500 transition">Forgot password?</Link>
            </div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-16 text-slate-900 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 hover:text-slate-700 font-medium focus:outline-none"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full text-white font-semibold py-3 rounded-xl transition-all hover:opacity-90 hover:shadow-lg hover:shadow-indigo-200 active:scale-[0.98] mt-6 disabled:opacity-50 flex justify-center items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', fontFamily: 'Space Grotesk, sans-serif' }}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Logging in...
              </>
            ) : 'Log in'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Don&apos;t have an account? <Link href="/register" className="text-indigo-600 font-medium hover:text-indigo-500 transition">Register</Link>
        </p>
      </div>
    </main>
  );
}
