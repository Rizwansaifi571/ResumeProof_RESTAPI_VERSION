import React from 'react';
import Link from 'next/link';

// Helper for syntax highlighting
const Syntax = ({ type, children }: { type: 'string' | 'number' | 'key' | 'boolean', children: React.ReactNode }) => {
  const colors = {
    string: 'text-pub-success',
    number: 'text-pub-warning',
    key: 'text-pub-accent',
    boolean: 'text-pub-error'
  };
  return <span className={colors[type]}>{children}</span>;
};

export function Hero() {
  return (
    <section className="max-w-7xl mx-auto px-6 pt-24 pb-16 flex flex-col items-center text-center">
      <h1 className="text-5xl md:text-7xl font-pub-display font-bold text-pub-text-main tracking-tight max-w-4xl mb-6">
        Hire with truth, not <span className="pub-gradient-text">trust</span>
      </h1>
      
      <p className="text-lg md:text-xl text-pub-text-muted max-w-2xl mb-10 leading-relaxed font-pub-prose">
        Send us a candidate&apos;s resume PDF and GitHub profile url. In under 90 seconds, we extract their claims, cross-reference them against actual commit history, and deliver a deterministically scored webhook.
      </p>
      
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
        <Link href="/register" className="bg-pub-accent hover:bg-indigo-400 text-white px-8 py-3 rounded-lg font-medium transition pub-glow">
          Get an API Key
        </Link>
        <Link href="/docs" className="border border-zinc-700 hover:border-zinc-500 text-pub-text-main bg-pub-surface px-8 py-3 rounded-lg font-medium transition">
          Read the Docs
        </Link>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12 text-sm text-pub-text-muted mb-24">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-pub-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>&lt; 90s Verification Time</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-pub-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>HMAC-SHA256 Webhook Signing</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-pub-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Accepts up to 10MB PDFs</span>
        </div>
      </div>

      {/* Terminal Window */}
      <div className="w-full max-w-5xl bg-[#0d1117] border border-zinc-800 rounded-xl overflow-hidden shadow-2xl text-left flex flex-col md:flex-row">
        
        {/* Request Panel */}
        <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col min-w-0">
          <div className="flex items-center gap-2 px-4 py-3 bg-[#161b22] border-b border-zinc-800">
            <div className="w-3 h-3 rounded-full bg-zinc-600"></div>
            <div className="w-3 h-3 rounded-full bg-zinc-600"></div>
            <div className="w-3 h-3 rounded-full bg-zinc-600"></div>
            <span className="ml-2 text-xs text-pub-text-muted font-pub-mono">POST /v1/verify</span>
          </div>
          <div className="p-6 overflow-x-auto font-pub-mono text-sm leading-loose">
            <pre className="text-zinc-300">
{`curl -X POST https://api.resumeproof.online/v1/verify \\
  -H "x-api-key: `}<Syntax type="string">rp_live_LPiiu91...</Syntax>{`" \\
  -F "githubUrl=`}<Syntax type="string">https://github.com/torvalds</Syntax>{`" \\
  -F "resume=`}<Syntax type="string">@/path/to/resume.pdf</Syntax>{`"`}
            </pre>
          </div>
        </div>

        {/* Response Panel */}
        <div className="w-full md:w-1/2 flex flex-col bg-[#0d1117] min-w-0">
          <div className="flex items-center px-4 py-3 bg-[#161b22] border-b border-zinc-800">
            <span className="text-xs text-pub-text-muted font-pub-mono">Response: <span className="text-pub-warning">202 Accepted</span></span>
          </div>
          <div className="p-6 overflow-x-auto font-pub-mono text-sm">
            <pre className="text-zinc-300">
{`{
  `}
<Syntax type="key">&quot;transactionId&quot;</Syntax>{`: `}<Syntax type="string">&quot;cm6v5a1bx000008j4c2m8f3z9&quot;</Syntax>{`,
  `}
<Syntax type="key">&quot;trackingId&quot;</Syntax>{`: `}<Syntax type="string">&quot;req_f8b3c1a9e4d2&quot;</Syntax>{`,
  `}
<Syntax type="key">&quot;status&quot;</Syntax>{`: `}<Syntax type="string">&quot;queued&quot;</Syntax>{`,
  `}
<Syntax type="key">&quot;message&quot;</Syntax>{`: `}<Syntax type="string">&quot;Verification job successfully enqueued. Webhook will be delivered upon completion.&quot;</Syntax>{`
}`}
            </pre>
          </div>
        </div>

      </div>
    </section>
  );
}
