'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

type NavItem = { label: string; href: string }
type Feature = { icon: string; title: string; desc: string; badge?: string }
type Step = { num: string; title: string; desc: string; detail: string }
type PricingTier = { name: string; price: string; unit: string; desc: string; features: string[]; cta: string; highlight: boolean }
type Stat = { value: string; label: string }

const NAV_ITEMS: NavItem[] = [
  { label: 'Docs', href: '#docs' },
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'API Reference', href: '#api' },
]

const STATS: Stat[] = [
  { value: '99.97%', label: 'API uptime SLA' },
  { value: '<180ms', label: 'median response' },
  { value: '2.4M+', label: 'resumes verified' },
  { value: '94%', label: 'fraud reduction' },
]

const FEATURES: Feature[] = [
  {
    icon: '⬡',
    title: 'GitHub Cross-Check',
    desc: 'Validates claimed skills against actual repository activity, commits, languages, and contribution history. No guesses, real signals.',
    badge: 'Core',
  },
  {
    icon: '◈',
    title: 'Project Verification',
    desc: "Cross-references stated projects with GitHub repos. Confirms existence, recency, authorship, and commit cadence. Flags fabrications with evidence.",
  },
  {
    icon: '◇',
    title: 'Skill Alignment',
    desc: 'Compares claimed tech stack to actual language usage patterns and dependency files across all public and authorized private repos.',
  },
  {
    icon: '◉',
    title: 'Confidence Score',
    desc: 'Returns a 0-100 deterministic score built from weighted signals, not black-box AI. Every point is traceable to a specific data source.',
    badge: 'Deterministic',
  },
  {
    icon: '◎',
    title: 'Webhooks Delivery',
    desc: 'Async verification results delivered to your endpoint with HMAC-signed payloads. Retry logic, delivery receipts, and failure alerts included.',
  },
  {
    icon: '⬙',
    title: 'Flag System',
    desc: 'Structured flags (SKILL_MISMATCH, PROJECT_NOT_FOUND, DATE_INCONSISTENCY, etc.) let your platform surface precise signals rather than vague warnings.',
  },
]

const STEPS: Step[] = [
  {
    num: '01',
    title: 'Upload PDF + GitHub handle',
    desc: 'Send a resume PDF and the candidate\'s GitHub username in a single API call.',
    detail: 'POST /v1/verify - multipart or JSON with a PDF URL. Optional: org token for private repo access.',
  },
  {
    num: '02',
    title: 'We cross-check all signals',
    desc: 'Our pipeline parses the resume, maps claims to GitHub data, and scores each dimension independently.',
    detail: 'Checks: repos, commits, stars, forks, languages, dates, collaborators, dependency files, README content.',
  },
  {
    num: '03',
    title: 'Receive structured results',
    desc: 'Webhook fires with a signed payload containing the score, per-claim breakdown, and all flags.',
    detail: 'Payload includes confidence_score, flags[], claim_results[], and a shareable audit_url.',
  },
]

const PRICING: PricingTier[] = [
  {
    name: 'Starter',
    price: '$0',
    unit: '/ mo',
    desc: 'For indie tools and early exploration.',
    features: ['100 verifications/mo', 'Core GitHub signals', 'REST API access', 'Webhook delivery', 'Community support'],
    cta: 'Start free',
    highlight: false,
  },
  {
    name: 'Growth',
    price: '$149',
    unit: '/ mo',
    desc: 'For growing hiring platforms.',
    features: ['5,000 verifications/mo', 'All signal types', 'Private repo support', 'HMAC-signed webhooks', 'Audit trail export', 'Email support'],
    cta: 'Get API key',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    unit: '',
    desc: 'For large ATS and recruiting platforms.',
    features: ['Unlimited verifications', 'On-prem deployment', 'SLA guarantee', 'SSO & RBAC', 'Dedicated engineer', 'SLA: 99.97% uptime'],
    cta: 'Contact sales',
    highlight: false,
  },
]


const CODE_REQUEST = `curl -X POST https://api.resumeproof.dev/v1/verify \\
  -H "Authorization: Bearer rp_live_••••••••••••" \\
  -H "Content-Type: application/json" \\
  -d '{
    "resume_url": "https://cdn.acme.com/resumes/alex-chen.pdf",
    "github_handle": "alexchen",
    "webhook_url": "https://hiring.acme.com/webhooks/verify"
  }'`

const CODE_RESPONSE = `{
  "id": "vrfy_01HXKM8N4P9QRS",
  "status": "completed",
  "confidence_score": 87,
  "flags": [
    {
      "type": "SKILL_MISMATCH",
      "claim": "Expert in Rust",
      "evidence": "0 Rust repos, last commit 3y ago",
      "severity": "high"
    }
  ],
  "claim_results": [
    {
      "claim": "Led backend at Stripe (2021–2023)",
      "verified": true,
      "signal": "github.com/stripe — 847 commits"
    },
    {
      "claim": "Built real-time ML pipeline",
      "verified": true,
      "signal": "repo: alexchen/ml-pipeline, 2022"
    }
  ],
  "audit_url": "https://audit.resumeproof.dev/vrfy_01HXKM8N4P9QRS",
  "processing_ms": 143
}`

function Badge({ children, variant = 'brand' }: { children: React.ReactNode; variant?: 'brand' | 'green' | 'amber' | 'slate' }) {
  const colors = {
    brand: 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200',
    green: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    amber: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    slate: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${colors[variant]}`} style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
      {children}
    </span>
  )
}

function GradientText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={className}
      style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
    >
      {children}
    </span>
  )
}


function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm' : 'bg-transparent'}`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 11L5 2L9 9L11 5L12 11" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-semibold text-slate-900 text-sm tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>ResumeProof</span>
          <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-500" style={{ fontFamily: 'Fira Code, monospace' }}>API</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map(item => (
            <Link key={item.label} href={item.href} className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="text-sm text-slate-500 hover:text-slate-900 transition-colors px-3 py-1.5">Sign in</Link>
          <a
            href="/register"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90 hover:shadow-lg hover:shadow-indigo-200 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Get API Key
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
        </div>

        <button className="md:hidden p-2 text-slate-500" onClick={() => setMobileOpen(o => !o)}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d={mobileOpen ? 'M4 4l12 12M4 16L16 4' : 'M3 5h14M3 10h14M3 15h14'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-6 pb-4 space-y-1">
          {NAV_ITEMS.map(item => (
            <Link key={item.label} href={item.href} className="block py-2.5 text-sm text-slate-600 hover:text-indigo-600" onClick={() => setMobileOpen(false)}>
              {item.label}
            </Link>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            <Link href="/login" className="py-2 text-center text-sm text-slate-500 border border-slate-200 rounded-lg">Sign in</Link>
            <Link href="/register" className="py-2 text-center text-sm font-medium text-white rounded-lg" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>Get API Key</Link>
          </div>
        </div>
      )}
    </nav>
  )
}

function HeroMockup() {
  return (
    <div className="relative">
      <div className="rounded-xl overflow-hidden shadow-2xl shadow-indigo-200/50 ring-1 ring-slate-900/10">
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 min-w-0 bg-white rounded-md px-3 py-1 text-xs text-slate-400 border border-slate-200 flex items-center gap-2" style={{ fontFamily: 'Fira Code, monospace' }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="flex-shrink-0"><path d="M5 1a4 4 0 100 8A4 4 0 005 1zm0 0v8m-4-4h8M1.8 2.8A5.6 5.6 0 005 4a5.6 5.6 0 003.2-1.2M1.8 7.2A5.6 5.6 0 005 6a5.6 5.6 0 003.2 1.2" stroke="#94a3b8" strokeWidth="0.8" strokeLinecap="round" /></svg>
            <span className="truncate">audit.resumeproof.dev/vrfy_01HXKM8N</span>
          </div>
        </div>

        <div className="bg-white p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-400 mb-1" style={{ fontFamily: 'Fira Code, monospace' }}>vrfy_01HXKM8N4P9QRS</p>
              <p className="font-semibold text-slate-900 text-sm" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Alex Chen - Senior Backend Engineer</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>87</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wide">Confidence</div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full w-[87%] transition-all duration-1000" style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
            </div>
          </div>

          <div className="space-y-2">
            {[
              { label: 'Led backend at Stripe (2021–23)', ok: true, note: '847 commits · github.com/stripe' },
              { label: 'Built real-time ML pipeline', ok: true, note: 'repo: alexchen/ml-pipeline · 2022' },
              { label: 'Expert in Rust', ok: false, note: '0 Rust repos · last commit 3y ago' },
              { label: '5yr TypeScript experience', ok: true, note: 'Primary language · 47 repos' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${item.ok ? 'bg-emerald-100' : 'bg-red-100'}`}>
                  {item.ok
                    ? <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1.5 4l2 2L6.5 2" stroke="#10b981" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    : <svg width="8" height="8" viewBox="0 0 8 8"><path d="M2 2l4 4M6 2l-4 4" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 truncate">{item.label}</p>
                  <p className="text-[10px] text-slate-400 truncate" style={{ fontFamily: 'Fira Code, monospace' }}>{item.note}</p>
                </div>
                {!item.ok && <Badge variant="amber">FLAG</Badge>}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-slate-400" style={{ fontFamily: 'Fira Code, monospace' }}>processed in 143ms</span>
            <Badge variant="green">✓ Webhook delivered</Badge>
          </div>
        </div>
      </div>

      <div className="absolute -left-12 top-1/3 hidden lg:block">
        <div className="bg-white rounded-xl shadow-lg shadow-slate-200/60 ring-1 ring-slate-100 p-3 w-44">
          <p className="text-[9px] text-slate-400 uppercase tracking-wider mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>GitHub Signals</p>
          {[
            { label: 'Repos', val: '63' },
            { label: 'Commits (1yr)', val: '1,204' },
            { label: 'Languages', val: 'TS · Go · Python' },
          ].map(s => (
            <div key={s.label} className="flex justify-between py-1 border-b border-slate-50 last:border-0">
              <span className="text-[10px] text-slate-500">{s.label}</span>
              <span className="text-[10px] font-medium text-slate-800" style={{ fontFamily: 'Fira Code, monospace' }}>{s.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at center, rgba(99,102,241,0.06) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      <div className="absolute top-10 left-1/4 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="absolute top-20 right-1/4 w-72 h-72 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', filter: 'blur(40px)' }} />

      <div className="relative max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="min-w-0">
            <div className="mb-6">
              <Badge variant="brand">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                Resume Verification API · v1.0
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.08] tracking-tight text-slate-900 mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Verify resume claims with{' '}
              <GradientText>GitHub-backed proof</GradientText>
              {' '}in one API call.
            </h1>

            <p className="text-lg text-slate-500 leading-relaxed mb-8 max-w-lg">
              ResumeProof cross-checks PDF claims against real repository activity, commits, and skills. Returns a transparent confidence score and structured flags, no black-box AI.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <a
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-xl hover:shadow-indigo-200 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Get API Key - Free
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7h9M8 3.5L11.5 7 8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </a>
              <a
                href="#docs"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-slate-700 bg-white ring-1 ring-slate-200 transition-all hover:ring-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 active:scale-95"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 3h10M2 7h10M2 11h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                View Docs
              </a>
            </div>

            <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-indigo-400" />
                <span className="text-[10px] text-slate-500 uppercase tracking-wide" style={{ fontFamily: 'Fira Code, monospace' }}>Quick start</span>
              </div>
              <pre className="text-xs text-slate-300 leading-5 overflow-x-auto" style={{ fontFamily: 'Fira Code, monospace' }}>
                <span className="text-slate-500">$ </span>
                <span className="text-emerald-400">curl</span>
                {' '}
                <span className="text-amber-300">-X POST</span>
                {' https://api.resumeproof.dev/v1/verify \\\n'}
                {'  '}
                <span className="text-amber-300">-H</span>
                {' '}
                <span className="text-sky-300">&quot;Authorization: Bearer rp_live_•••&quot;</span>
                {' \\\n'}
                {'  '}
                <span className="text-amber-300">-d</span>
                {' '}
                <span className="text-sky-300">&apos;{`{"resume_url": "...", "github_handle": "..."}`}&apos;</span>
              </pre>
            </div>
          </div>

          <div className="relative pl-0 lg:pl-8 min-w-0">
            <HeroMockup />
          </div>
        </div>

        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {STATS.map(stat => (
            <div key={stat.label} className="bg-white px-6 py-5 text-center">
              <div className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{stat.value}</div>
              <div className="text-xs text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProblemSection() {
  return (
    <section className="py-20 bg-slate-950">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="min-w-0">
            <p className="text-xs font-medium text-indigo-400 uppercase tracking-widest mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>The Problem</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Resumes are{' '}
              <span style={{ color: '#f87171' }}>unverifiable by design.</span>
            </h2>
            <p className="text-slate-400 leading-relaxed mb-6">
              58% of candidates misrepresent experience. ATS systems pass on textual keywords, not actual ability. Your team wastes hours interviewing candidates who can&apos;t code their way out of a hello-world.
            </p>
            <ul className="space-y-3">
              {[
                'Claimed &quot;Expert in Rust&quot; - zero Rust commits',
                '&quot;Led team of 10&quot; - solo contributor on all repos',
                '&quot;5 years TypeScript&quot; - first TS file dated 8 months ago',
                'Fabricated company names are undetected by ATS',
              ].map(item => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-400">
                  <svg className="mt-0.5 flex-shrink-0" width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="#f87171" strokeWidth="1.2" /><path d="M4.5 4.5l5 5M9.5 4.5l-5 5" stroke="#f87171" strokeWidth="1.2" strokeLinecap="round" /></svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium text-emerald-400 uppercase tracking-widest mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>The Solution</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Ground truth from{' '}
              <span style={{ color: '#34d399' }}>actual code.</span>
            </h2>
            <p className="text-slate-400 leading-relaxed mb-6">
              ResumeProof maps every claim to deterministic GitHub evidence. Not an AI guess, a traceable signal. Each flag cites the specific commit history, language breakdown, or date mismatch that caused it.
            </p>
            <ul className="space-y-3">
              {[
                'Per-claim verification with source evidence',
                'Deterministic score - no black-box AI',
                'Integrates in < 30 min via REST + webhooks',
                'SOC 2 Type II · GDPR compliant · signed payloads',
              ].map(item => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-300">
                  <svg className="mt-0.5 flex-shrink-0" width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="#34d399" strokeWidth="1.2" /><path d="M4 7l2.5 2.5L10 4.5" stroke="#34d399" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section id="docs" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-xs font-medium text-indigo-500 uppercase tracking-widest mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>How it works</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Three steps from upload to webhook.
          </h2>
        </div>

        <div className="relative">
          <div className="hidden md:block absolute top-8 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />

          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative group">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-50 transition-all duration-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${i === 0 ? '#6366f1, #818cf8' : i === 1 ? '#8b5cf6, #a78bfa' : '#06b6d4, #22d3ee'})` }}
                    >
                      {step.num}
                    </div>
                    <h3 className="font-semibold text-slate-900 text-sm leading-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{step.title}</h3>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed mb-3">{step.desc}</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed p-2 bg-slate-50 rounded-lg" style={{ fontFamily: 'Fira Code, monospace' }}>{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Features() {
  return (
    <section id="features" className="py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-xs font-medium text-indigo-500 uppercase tracking-widest mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Feature grid</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Built for the checks hiring teams actually need.
          </h2>
          <p className="text-slate-500 max-w-lg mx-auto">Every signal is traceable, every flag has evidence, every score is reproducible. No ambiguity, no black boxes.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(feat => (
            <div
              key={feat.title}
              className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-50/50 transition-all duration-200 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg group-hover:scale-110 transition-transform"
                  style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))' }}
                >
                  <span style={{ color: '#6366f1' }}>{feat.icon}</span>
                </div>
                {feat.badge && <Badge variant="brand">{feat.badge}</Badge>}
              </div>
              <h3 className="font-semibold text-slate-900 mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{feat.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

type CodeTab = 'request' | 'response'

function ApiSection() {
  const [tab, setTab] = useState<CodeTab>('request')
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(tab === 'request' ? CODE_REQUEST : CODE_RESPONSE)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section id="api" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div className="min-w-0">
            <p className="text-xs font-medium text-indigo-500 uppercase tracking-widest mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>API Integration</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              One endpoint.<br />Complete verification.
            </h2>
            <p className="text-slate-500 leading-relaxed mb-8">
              POST a PDF URL and GitHub handle. Receive a structured JSON result, synchronously for small payloads or via signed webhook for async batch verification.
            </p>

            <div className="space-y-4">
              {[
                {
                  method: 'POST',
                  path: '/v1/verify',
                  desc: 'Submit a resume for verification',
                  color: 'bg-indigo-100 text-indigo-700',
                },
                {
                  method: 'GET',
                  path: '/v1/verify/:id',
                  desc: 'Retrieve result by verification ID',
                  color: 'bg-emerald-100 text-emerald-700',
                },
                {
                  method: 'GET',
                  path: '/v1/verify/:id/audit',
                  desc: 'Full audit trail with evidence links',
                  color: 'bg-emerald-100 text-emerald-700',
                },
                {
                  method: 'DELETE',
                  path: '/v1/verify/:id',
                  desc: 'GDPR deletion - removes all PII',
                  color: 'bg-red-100 text-red-700',
                },
              ].map(ep => (
                <div key={ep.path} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${ep.color}`} style={{ fontFamily: 'Fira Code, monospace' }}>{ep.method}</span>
                  <span className="text-sm font-medium text-slate-700 flex-1" style={{ fontFamily: 'Fira Code, monospace' }}>{ep.path}</span>
                  <span className="text-xs text-slate-400 hidden sm:block">{ep.desc}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
              <p className="text-xs font-medium text-indigo-700 mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Webhook security</p>
              <p className="text-xs text-indigo-600 leading-relaxed">
                All webhook deliveries are signed with HMAC-SHA256 using your webhook secret. Verify the <span style={{ fontFamily: 'Fira Code, monospace' }}>X-ResumeProof-Signature</span> header on every incoming request.
              </p>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/5 min-w-0">
            <div className="bg-slate-800 flex items-center gap-0 border-b border-slate-700">
              {(['request', 'response'] as CodeTab[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-5 py-3 text-xs font-medium capitalize transition-colors ${tab === t ? 'text-white border-b-2 border-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  {t === 'request' ? '→ Request' : '← Response'}
                </button>
              ))}
              <div className="flex-1" />
              <button
                onClick={copy}
                className="mr-3 px-3 py-1.5 rounded-lg text-[10px] text-slate-400 hover:text-white hover:bg-slate-700 transition-all flex items-center gap-1.5"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {copied
                  ? <><svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 2.5" stroke="#34d399" strokeWidth="1.2" strokeLinecap="round" /></svg> Copied</>
                  : <><svg width="10" height="10" viewBox="0 0 10 10"><rect x="1.5" y="3.5" width="5" height="5.5" rx="1" stroke="currentColor" strokeWidth="0.9" /><path d="M3.5 3.5V2.5a1 1 0 011-1h3a1 1 0 011 1v4.5a1 1 0 01-1 1H7" stroke="currentColor" strokeWidth="0.9" /></svg> Copy</>
                }
              </button>
            </div>

            <div className="bg-slate-900 p-5 overflow-x-auto max-h-[480px] overflow-y-auto">
              <pre className="text-xs leading-6 text-slate-300" style={{ fontFamily: 'Fira Code, monospace' }}>
                {tab === 'request' ? CODE_REQUEST : CODE_RESPONSE}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function SocialProof() {
  const logos = ['Workday', 'Greenhouse', 'Lever', 'HackerRank', 'AngelList', 'Rippling']

  return (
    <section className="py-16 border-y border-slate-100 bg-slate-50/60">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-center text-xs text-slate-400 uppercase tracking-widest mb-8" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Trusted by hiring platforms worldwide
        </p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
          {logos.map(name => (
            <div key={name} className="text-slate-300 font-semibold text-sm tracking-wide select-none" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {name}
            </div>
          ))}
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {[
            {
              quote: "We caught 3 fraudulent resumes in the first week. ResumeProof pays for itself in one bad hire prevented.",
              author: 'Sarah Kim',
              role: 'VP Engineering, HireLoop',
              score: '94%',
              metric: 'fraud reduction',
            },
            {
              quote: "The deterministic scoring is a breath of fresh air. We can explain every flag to candidates, no black-box surprises.",
              author: 'Marcus Obi',
              role: 'CTO, TalentOS',
              score: '<180ms',
              metric: 'avg response time',
            },
            {
              quote: "Integration took 25 minutes. Webhooks are reliable and HMAC verification gives our security team comfort.",
              author: 'Priya Nair',
              role: 'Founding Engineer, Shortlyst',
              score: '2.4M+',
              metric: 'resumes verified',
            },
          ].map(t => (
            <div key={t.author} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
              <blockquote className="text-sm text-slate-600 leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</blockquote>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{t.author}</p>
                  <p className="text-xs text-slate-400">{t.role}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-indigo-600" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{t.score}</div>
                  <div className="text-[10px] text-slate-400">{t.metric}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-xs font-medium text-indigo-500 uppercase tracking-widest mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Pricing</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Simple, usage-based pricing.</h2>
          <p className="text-slate-500">Start free. Scale as you grow. No per-seat nonsense.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PRICING.map(tier => (
            <div
              key={tier.name}
              className={`relative rounded-2xl border p-7 flex flex-col transition-all ${tier.highlight ? 'border-indigo-400 shadow-xl shadow-indigo-100' : 'border-slate-200 hover:border-slate-300 hover:shadow-md'}`}
              style={tier.highlight ? { background: 'linear-gradient(160deg, #fafafe 0%, #f0f4ff 100%)' } : {}}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="brand">Most popular</Badge>
                </div>
              )}
              <div className="mb-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{tier.name}</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold text-slate-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{tier.price}</span>
                  {tier.unit && <span className="text-sm text-slate-400 mb-1">{tier.unit}</span>}
                </div>
                <p className="text-sm text-slate-500 mt-1">{tier.desc}</p>
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {tier.features.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-slate-600">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0"><circle cx="7" cy="7" r="6" fill={tier.highlight ? '#e0eaff' : '#f1f5f9'} /><path d="M4.5 7l2 2L9.5 5" stroke={tier.highlight ? '#6366f1' : '#94a3b8'} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="/register"
                className={`w-full py-3 rounded-xl text-sm font-semibold text-center transition-all hover:opacity-90 active:scale-95 ${tier.highlight ? 'text-white' : 'text-slate-700 bg-slate-100 hover:bg-slate-200'}`}
                style={tier.highlight ? { background: 'linear-gradient(135deg, #6366f1, #4f46e5)', fontFamily: 'Space Grotesk, sans-serif' } : { fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTA() {
  return (
    <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #1e1b4b 0%, #312e81 40%, #1e3a5f 100%)' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)', filter: 'blur(60px)' }} />

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <Badge variant="brand">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Free to start · No credit card
        </Badge>

        <h2 className="mt-6 text-3xl md:text-5xl font-bold text-white leading-tight mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Add verification before the interview.
        </h2>
        <p className="text-indigo-200 text-lg mb-10 max-w-xl mx-auto">
          One API call. Zero blind trust. Start verifying resume claims against the same GitHub signals that never lie.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/register"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm font-semibold bg-white text-indigo-700 transition-all hover:bg-indigo-50 hover:shadow-xl hover:shadow-indigo-900/30 active:scale-95"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Get your free API key
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7h9M8 3.5L11.5 7 8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
          <a
            href="#docs"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm font-semibold text-indigo-200 ring-1 ring-indigo-500/50 transition-all hover:ring-indigo-400 hover:text-white"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Read the docs
          </a>
        </div>

        <p className="mt-8 text-xs text-indigo-400">100 verifications/month free · No credit card · Cancel anytime</p>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M2 11L5 2L9 9L11 5L12 11" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <span className="text-sm font-semibold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>ResumeProof</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">Verify resume claims with GitHub-backed proof in one API call.</p>
          </div>

          {[
            { title: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Status'] },
            { title: 'Developers', links: ['API Reference', 'SDKs', 'Webhooks', 'Examples'] },
            { title: 'Company', links: ['About', 'Blog', 'Privacy', 'Terms'] },
          ].map(col => (
            <div key={col.title}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{col.title}</p>
              <ul className="space-y-2">
                {col.links.map(link => (
                  <li key={link}><Link href="/register" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">{link}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-800">
          <p className="text-xs text-slate-600" style={{ fontFamily: 'Fira Code, monospace' }}>© 2026 ResumeProof, Inc.</p>
          <div className="flex items-center gap-4">
            <Badge variant="slate">SOC 2 Type II</Badge>
            <Badge variant="slate">GDPR</Badge>
            <Badge variant="green">✓ 99.97% uptime</Badge>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100">
      <Nav />
      <main>
        <Hero />
        <ProblemSection />
        <HowItWorks />
        <Features />
        <ApiSection />
        <SocialProof />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
