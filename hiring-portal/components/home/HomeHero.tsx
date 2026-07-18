import Link from "next/link";

const features = [
  {
    label: "GitHub Verified",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500">
        <line x1="6" y1="3" x2="6" y2="15" />
        <circle cx="18" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <path d="M18 9a9 9 0 0 1-9 9" />
      </svg>
    )
  },
  {
    label: "HMAC-signed Webhooks",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    )
  },
  {
    label: "Mobile-friendly",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    )
  }
];

export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-white py-16 px-4 sm:px-6">
      {/* Background pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-60">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dot-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#E2E8F0" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-pattern)" />
        </svg>
      </div>

      <div className="relative mx-auto flex max-w-screen-lg flex-col items-center gap-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-indigo-700">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
          Powered by ResumeProof
        </div>

        <div className="mx-auto max-w-3xl space-y-5">
          <h1 className="text-3xl sm:text-5xl font-black leading-tight">
            <span className="text-slate-900">TechCorp</span>
            <br />
            <span className="text-indigo-600">Hiring Portal</span>
          </h1>

          <p className="mx-auto max-w-xl text-sm sm:text-base text-slate-700 leading-relaxed">
            AI-powered resume verification built into every application. We
            verify GitHub activity, skill authenticity, and project claims
            automatically.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/apply"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
          >
            Apply for a Role →
          </Link>
          <Link
            href="/admin"
            className="bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm px-5 py-2.5 rounded-lg border border-slate-200 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
          >
            Admin Dashboard
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {features.map((feature) => (
            <span
              key={feature.label}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-600"
            >
              {feature.icon}
              {feature.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}