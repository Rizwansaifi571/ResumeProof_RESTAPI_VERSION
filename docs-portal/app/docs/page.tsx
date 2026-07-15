import Link from 'next/link';
import { docsIntro, flagMessages } from '@/lib/siteCopy';

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-pub-bg text-pub-text-main">
      <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-20 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-pub-text-muted">API Reference</p>
            <h1 className="mt-4 max-w-3xl font-pub-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Build verification into the hiring flow.
            </h1>
            <div className="mt-6 space-y-4 text-lg leading-8 text-pub-text-muted">
              {docsIntro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard" className="inline-flex items-center justify-center rounded-xl bg-pub-accent px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-400">
                Open dashboard
              </Link>
              <Link href="/register" className="inline-flex items-center justify-center rounded-xl border border-zinc-800 bg-pub-surface px-5 py-3 text-sm font-medium text-pub-text-main transition hover:border-zinc-600">
                Create API key
              </Link>
            </div>
          </div>

          <aside className="rounded-3xl border border-zinc-800 bg-pub-surface/80 p-6 shadow-2xl shadow-black/20">
            <div className="text-sm font-medium uppercase tracking-[0.25em] text-pub-text-muted">Quick start</div>
            <div className="mt-5 space-y-4 text-sm leading-7 text-pub-text-muted">
              <p>1. Create an API key in the dashboard.</p>
              <p>2. POST a PDF plus GitHub username to /v1/verify.</p>
              <p>3. Receive the confidence score and webhook payload when the job completes.</p>
            </div>
            <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 font-pub-mono text-xs leading-6 text-zinc-300">
              <p className="text-pub-text-muted">Returned payload includes</p>
              <p>confidenceScore, status, verifiedProjects, commitAuthorship, matchedSkills, missingSkills, flags[], aiAnalysis</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="rounded-3xl border border-zinc-800 bg-pub-surface/50 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-pub-text-muted">Flags</p>
              <h2 className="mt-3 font-pub-display text-2xl font-semibold">Human-readable reasons for each flag</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-pub-text-muted">
              These messages are written to explain what the system observed, not to accuse the candidate.
            </p>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {flagMessages.map((flag) => (
              <div key={flag.code} className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                <div className="text-xs font-medium tracking-[0.2em] text-pub-accent">{flag.code}</div>
                <p className="mt-3 text-sm leading-6 text-pub-text-muted">{flag.message}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}