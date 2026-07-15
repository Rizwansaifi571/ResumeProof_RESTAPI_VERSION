'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  const hasCalled = React.useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }
    
    if (hasCalled.current) return;
    hasCalled.current = true;

    api.get(`/v1/auth/verify-email?token=${token}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 p-10 rounded-2xl max-w-md w-full text-center shadow-2xl">
      {status === 'loading' && (
        <>
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-bold text-white mb-2">Verifying your email...</h2>
          <p className="text-zinc-400 text-sm">Please wait while we confirm your verification link.</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Email Verified!</h2>
          <p className="text-zinc-400 mb-8">Your account is now fully active. You can log in and start using ResumeProof.</p>
          <Link href="/login" className="inline-block w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg transition">
            Continue to Login
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
            ✗
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Verification Failed</h2>
          <p className="text-zinc-400 mb-8">This verification link is invalid or has expired. Please log in to request a new link, or try registering again.</p>
          <Link href="/login" className="inline-block w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 rounded-lg transition">
            Back to Login
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
      <Suspense fallback={
        <div className="bg-zinc-900/50 border border-zinc-800 p-10 rounded-2xl max-w-md w-full text-center shadow-2xl">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-bold text-white mb-2">Loading...</h2>
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
    </main>
  );
}
