"use client";

import { Candidate } from "@/lib/types";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

// SVG Icons
const IconLock = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconRefresh = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

const IconExternal = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block ml-1">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const IconInbox = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 mx-auto mb-4">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

const IconArrowRight = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block ml-1">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const IconSpinner = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500 animate-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-slate-100 text-slate-600 border-slate-200",
    verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
    flagged: "bg-amber-50 text-amber-700 border-amber-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
    error: "bg-red-50 text-red-600 border-red-200",
  };
  const labels: Record<string, string> = {
    pending: "Pending",
    verified: "Verified",
    flagged: "Flagged",
    rejected: "Rejected",
    error: "Error",
  };
  return (
    <span className={`inline-block text-xs font-medium border rounded-full px-3 py-1 ${map[status] || map.pending}`}>
      {labels[status] || "Pending"}
    </span>
  );
}

function AdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authed, setAuthed] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [authError, setAuthError] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const urlKey = searchParams.get("key");
    if (urlKey) {
      setKeyInput(urlKey);
      setAuthed(true);
    }
  }, [searchParams]);

  const fetchCandidates = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/candidates?key=" + keyInput);
      if (!res.ok) { setAuthed(false); return; }
      const data = await res.json();
      setCandidates(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [keyInput]);

  useEffect(() => {
    if (!authed) return;
    fetchCandidates();
    const iv = setInterval(fetchCandidates, 30000);
    return () => clearInterval(iv);
  }, [authed, fetchCandidates]);

  function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/admin?key=${keyInput}`);
    setAuthed(true);
    setAuthError(false);
  }

  if (!authed) {
    return (
      <div className="animate-fade-in">
        <main className="min-h-screen bg-[#F8F9FC] px-4 flex items-center justify-center">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 max-w-sm w-full text-center hover:shadow-md transition-shadow duration-150">
            <div className="flex justify-center mb-4">
              <IconLock />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
            <p className="text-sm text-slate-500 mb-6">Enter your admin key to view candidates.</p>
            <form onSubmit={handleAuth} className="space-y-4">
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="Admin key"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
              />
              {authError && <p className="text-sm text-red-500 text-left">Invalid key</p>}
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
              >
                Access Dashboard
              </button>
              <Link
                href="/"
                className="mt-4 block text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-150"
              >
                Go Home
              </Link>
            </form>
          </div>
        </main>
      </div>
    );
  }

  const total = candidates.length;
  const verified = candidates.filter((c) => c.verificationStatus === "verified").length;
  const pending = candidates.filter((c) => c.verificationStatus === "pending").length;
  const flaggedOrRejected = candidates.filter((c) => c.verificationStatus === "flagged" || c.verificationStatus === "rejected").length;

  return (
    <div className="animate-fade-in">
      <main className="min-h-screen bg-[#F8F9FC]">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Candidates</h1>
            <p className="text-slate-500 text-sm mt-1">Review and manage all applications</p>
          </div>
          <button
            onClick={fetchCandidates}
            disabled={loading}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm px-5 py-2.5 rounded-lg border border-slate-200 transition-colors duration-150 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
          >
            <IconRefresh />
            Refresh
          </button>
        </header>

      {/* Stats Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap">
        <div className="flex-1 min-w-[150px] border-r border-slate-200 pr-6">
          <div className="text-2xl font-bold text-slate-900">{total}</div>
          <div className="text-slate-500 text-xs mt-1">Total</div>
        </div>
        <div className="flex-1 min-w-[150px] border-r border-slate-200 px-6">
          <div className="text-2xl font-bold text-slate-900">{verified}</div>
          <div className="text-slate-500 text-xs mt-1">Verified</div>
        </div>
        <div className="flex-1 min-w-[150px] border-r border-slate-200 px-6">
          <div className="text-2xl font-bold text-slate-900">{pending}</div>
          <div className="text-slate-500 text-xs mt-1">Pending</div>
        </div>
        <div className="flex-1 min-w-[150px] pl-6">
          <div className="text-2xl font-bold text-slate-900">{flaggedOrRejected}</div>
          <div className="text-slate-500 text-xs mt-1">Flagged / Rejected</div>
        </div>
      </div>

      {/* Table Section */}
      <div className="p-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-150">
          {loading && candidates.length === 0 ? (
            <div className="flex justify-center py-20">
              <IconSpinner />
            </div>
          ) : candidates.length === 0 ? (
            <div className="text-center py-20">
              <IconInbox />
              <h3 className="text-slate-900 font-semibold mb-1">No candidates yet</h3>
              <p className="text-slate-400 text-sm">Applications will appear here once submitted.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Name & Email</th>
                    <th className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Role</th>
                    <th className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">GitHub</th>
                    <th className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Status</th>
                    <th className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Confidence</th>
                    <th className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Applied</th>
                    <th className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {candidates.map((c) => {
                    const result = c.verificationResult;
                    const confidence = result?.confidenceScore;
                    return (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="text-sm font-medium text-slate-900">{c.name}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{c.email || "No email"}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap">
                            {c.role}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <a
                            href={`https://github.com/${c.githubUsername}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-600 text-sm hover:text-slate-900 flex items-center whitespace-nowrap"
                          >
                            @{c.githubUsername}
                            <IconExternal />
                          </a>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={c.verificationStatus} />
                        </td>
                        <td className="px-5 py-4">
                          {confidence !== undefined ? (
                            <span className={`text-sm font-semibold ${confidence >= 75 ? "text-emerald-600" : confidence >= 50 ? "text-amber-600" : "text-red-600"}`}>
                              {confidence}/100
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-sm text-slate-500 whitespace-nowrap">
                            {new Date(c.appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <Link href={`/status/${c.trackingId}`} className="text-indigo-600 text-sm font-medium hover:text-indigo-800 transition-colors duration-150 flex items-center whitespace-nowrap">
                            View
                            <IconArrowRight />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      </main>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center">
        <IconSpinner />
      </div>
    }>
      <AdminContent />
    </Suspense>
  );
}
