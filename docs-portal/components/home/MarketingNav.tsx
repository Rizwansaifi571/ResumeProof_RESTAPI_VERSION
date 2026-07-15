import React from 'react';
import Link from 'next/link';

export function MarketingNav() {
  return (
    <header className="border-b border-zinc-800/60 sticky top-0 bg-pub-bg/80 backdrop-blur-md z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 md:h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-pub-display font-bold text-pub-text-main flex items-center space-x-2">
          <span className="pub-gradient-text">Resume</span>
          <span>Proof</span>
        </Link>
        <div className="flex items-center space-x-6 text-sm">
          <Link href="/docs" className="text-pub-text-muted hover:text-pub-text-main transition">Documentation</Link>
          <Link href="/login" className="text-pub-text-muted hover:text-pub-text-main transition">Sign In</Link>
          <Link href="/register" className="bg-pub-accent hover:bg-indigo-400 text-white px-4 py-2 rounded-lg font-medium transition">
            Get API Key
          </Link>
        </div>
      </div>
    </header>
  );
}
