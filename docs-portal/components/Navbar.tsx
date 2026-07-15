'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clearTokens } from '@/lib/auth';

export const Navbar: React.FC = () => {
  const router = useRouter();

  const handleLogout = () => {
    clearTokens();
    router.push('/login');
  };

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="text-xl font-bold flex items-center space-x-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-indigo-600">Resume</span>
            <span className="text-slate-900">Proof</span>
          </Link>
        </div>
        <div className="flex items-center space-x-6">
          <a href="/#api" className="text-sm text-slate-500 hover:text-slate-900 font-medium transition">API Docs</a>
          <button 
            onClick={handleLogout}
            className="text-sm bg-slate-50 hover:bg-slate-100 text-slate-700 px-4 py-1.5 rounded-lg transition border border-slate-200 font-medium"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
};
