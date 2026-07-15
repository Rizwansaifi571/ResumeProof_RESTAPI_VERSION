'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Sending request to /v1/auth/forgot-password with email:', email);
      const response = await api.post('/v1/auth/forgot-password', { email });
      console.log('Response received:', response.status);
      setSuccess(true);
    } catch (err: unknown) {
      console.error('Forgot password error:', err);
      const error = err as { response?: { status?: number; data?: { error?: string } }, message?: string };
      
      if (error.response?.status === 429) {
        setError('Too many requests. Please try again later.');
      } else if (error.response?.status === 404) {
        setError('Backend route not found (404). Please ensure the backend was built and restarted.');
      } else if (error.response?.data?.error) {
        // Fallback for string-based errors that might come from Express AppError
        const errorMsg = error.response.data.error;
        setError(typeof errorMsg === 'string' ? errorMsg : 'An error occurred.');
      } else if (error.message) {
        setError(`Error: ${error.message}`);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-zinc-900/50 border border-zinc-800 p-10 rounded-2xl max-w-md w-full">
          <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Check your inbox</h2>
          <p className="text-zinc-400 mb-8">If your email is registered, we&apos;ve sent you a password reset link.</p>
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition">
            Back to login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
      <div className="bg-zinc-900/50 border border-zinc-800 p-10 rounded-2xl max-w-md w-full shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-2 text-center">Reset your password</h1>
        <p className="text-zinc-400 text-sm text-center mb-8">Enter your email address and we&apos;ll send you a link to reset your password.</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-zinc-400 text-sm font-medium mb-1">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg transition mt-4 disabled:opacity-50"
          >
            {loading ? 'Sending link...' : 'Send reset link'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-zinc-400">
          Remember your password? <Link href="/login" className="text-indigo-400 hover:text-indigo-300">Log in</Link>
        </p>
      </div>
    </main>
  );
}
