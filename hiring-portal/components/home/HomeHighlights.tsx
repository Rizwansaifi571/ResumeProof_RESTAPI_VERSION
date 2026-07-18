const highlights = [
  {
    label: "GitHub Verified",
    description: "We cross-check repos, commits, and contribution history automatically.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
        <circle cx="12" cy="12" r="3" />
        <line x1="19" y1="19" x2="14" y2="14" />
      </svg>
    )
  },
  {
    label: "AI Analysis",
    description: "Skill claims are matched against real code using our AI engine.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
        <path d="M12 3v3" />
        <path d="M18.5 5.5l-2 2" />
        <path d="M21 12h-3" />
        <path d="M18.5 18.5l-2-2" />
        <path d="M12 21v-3" />
        <path d="M5.5 18.5l2-2" />
        <path d="M3 12h3" />
        <path d="M5.5 5.5l2 2" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    )
  },
  {
    label: "Instant Results",
    description: "Candidates receive a verification decision within minutes of applying.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    )
  },
];

export function HomeHighlights() {
  return (
    <section className="bg-white py-16 px-4 sm:px-6">
      <div className="mx-auto max-w-screen-lg text-center mb-10">
        <h2 className="text-2xl font-bold text-slate-900">Why TechCorp Verifies</h2>
        <p className="mt-2 text-sm text-slate-700 leading-relaxed">Our advanced platform ensures the highest quality of candidates.</p>
      </div>
      
      <div className="mx-auto grid max-w-screen-lg gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {highlights.map((item) => (
          <div
            key={item.label}
            className="flex flex-col text-left rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-150"
          >
            <div className="mb-4">{item.icon}</div>
            <h3 className="mb-2 text-base font-semibold text-slate-900">{item.label}</h3>
            <p className="text-sm text-slate-700 leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}