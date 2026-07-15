import React from 'react';

export function ProblemSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24">
      {/* Part 1: The Problem */}
      <div className="mb-24">
        <div className="text-center md:text-left mb-12">
          <h2 className="text-3xl font-pub-display font-bold text-pub-text-main mb-4">The Problem</h2>
          <p className="text-pub-text-muted text-lg max-w-2xl">Traditional technical hiring relies on trust. When candidates embellish their experience, engineering teams pay the price.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-pub-surface border border-zinc-800 rounded-lg p-6 border-l-4 border-l-pub-error">
            <div className="text-4xl font-bold text-pub-text-main mb-2">45<span className="text-pub-text-muted text-2xl">m</span></div>
            <p className="text-pub-text-muted text-sm font-pub-prose">Average time engineering managers spend manually reviewing a single candidate&apos;s GitHub repositories.</p>
          </div>
          <div className="bg-pub-surface border border-zinc-800 rounded-lg p-6 border-l-4 border-l-pub-error">
            <div className="text-4xl font-bold text-pub-text-main mb-2">68<span className="text-pub-text-muted text-2xl">%</span></div>
            <p className="text-pub-text-muted text-sm font-pub-prose">Rate at which candidates embellish their open-source contributions or claim group projects as solo work.</p>
          </div>
          <div className="bg-pub-surface border border-zinc-800 rounded-lg p-6 border-l-4 border-l-pub-error">
            <div className="text-4xl font-bold text-pub-text-main mb-2">Late<span className="text-pub-text-muted text-2xl">-Stage</span></div>
            <p className="text-pub-text-muted text-sm font-pub-prose">When skills mismatches are usually discovered—during expensive technical interviews rather than screening.</p>
          </div>
        </div>
      </div>

      {/* Part 2: The ResumeProof Way */}
      <div>
        <div className="text-center md:text-left mb-12">
          <h2 className="text-3xl font-pub-display font-bold text-pub-text-main mb-4">The ResumeProof Way</h2>
          <p className="text-pub-text-muted text-lg max-w-2xl">A deterministic, automated pipeline that verifies claims before you ever schedule a screening call.</p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 border-t-2 border-dotted border-zinc-800 -translate-y-1/2 z-0"></div>
          
          <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
            {/* Step 1: Submit */}
            <div className="flex-1 bg-pub-surface border border-zinc-800 p-6 rounded-xl flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-pub-text-main font-bold mb-4">1</div>
              <h3 className="text-pub-text-main font-bold mb-2">Submit</h3>
              <p className="text-xs text-pub-text-muted">Receive candidate resume PDF and GitHub profile URL via REST API.</p>
            </div>

            {/* Step 2: Extract */}
            <div className="flex-1 bg-pub-surface border border-zinc-800 p-6 rounded-xl flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-pub-text-main font-bold mb-4">2</div>
              <h3 className="text-pub-text-main font-bold mb-2">Extract</h3>
              <p className="text-xs text-pub-text-muted">Extract plain text from the PDF and scrape public repositories.</p>
            </div>

            {/* Step 3: Analyze (Accented) */}
            <div className="flex-1 bg-pub-accent/10 border border-pub-accent p-6 rounded-xl flex flex-col items-center text-center relative overflow-hidden group shadow-[0_0_15px_rgba(99,102,241,0.15)]">
              <div className="absolute top-0 right-0 w-16 h-16 bg-pub-accent/20 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <div className="w-10 h-10 rounded-full bg-pub-accent text-white flex items-center justify-center font-bold mb-4">3</div>
              <h3 className="text-pub-text-main font-bold mb-2">Analyze</h3>
              <p className="text-xs text-pub-text-muted">Cross-check resume claims against actual commit history.</p>
            </div>

            {/* Step 4: Score */}
            <div className="flex-1 bg-pub-surface border border-zinc-800 p-6 rounded-xl flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-pub-text-main font-bold mb-4">4</div>
              <h3 className="text-pub-text-main font-bold mb-2">Score</h3>
              <p className="text-xs text-pub-text-muted">Generate a deterministic confidence score (0-100).</p>
            </div>

            {/* Step 5: Deliver */}
            <div className="flex-1 bg-pub-surface border border-zinc-800 p-6 rounded-xl flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-pub-text-main font-bold mb-4">5</div>
              <h3 className="text-pub-text-main font-bold mb-2">Deliver</h3>
              <p className="text-xs text-pub-text-muted">Fire a secure HMAC-SHA256 signed webhook payload.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
