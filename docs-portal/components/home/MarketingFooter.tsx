import React from 'react';

export function MarketingFooter() {
  return (
    <footer className="border-t border-zinc-800/60 py-12 mt-24">
      <div className="max-w-7xl mx-auto px-6 text-center text-pub-text-muted text-sm">
        <p>&copy; {new Date().getFullYear()} ResumeProof API. All rights reserved.</p>
        <p className="mt-2">Built for developers who demand truth in hiring.</p>
      </div>
    </footer>
  );
}
