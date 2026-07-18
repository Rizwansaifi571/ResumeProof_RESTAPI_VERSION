"use client";

import { useState, useRef } from "react";
import Link from "next/link";

const ROLES = [
  "Software Engineer",
  "Backend Engineer",
  "Frontend Engineer",
  "Full Stack Engineer",
  "Data Engineer",
];

type FormState = "idle" | "loading" | "success" | "error";

export default function ApplyPage() {
  const [state, setState] = useState<FormState>("idle");
  const [trackingId, setTrackingId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/apply", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error ?? "Submission failed");
        setState("error");
        return;
      }
      setTrackingId(json.trackingId);
      setState("success");
    } catch {
      setErrorMsg("Network error — please try again.");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <main className="min-h-screen bg-[#F8F9FC] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
          <div className="flex justify-center mb-4">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Submitted!</h2>
          <p className="text-slate-500 mb-6 leading-relaxed">
            We&apos;ll review your profile and get back to you. Your verification is in progress.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 mb-6 text-left">
            <p className="text-xs text-slate-500 mb-1 uppercase tracking-widest font-medium">Tracking ID</p>
            <p className="text-indigo-600 font-mono text-sm break-all font-medium">{trackingId}</p>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              href={`/status/${trackingId}`}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors text-center"
            >
              Check Status →
            </Link>
            <Link href="/" className="text-slate-500 hover:text-slate-700 text-sm transition-colors mt-2 text-center">
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="animate-fade-in">
      <main className="min-h-screen bg-[#F8F9FC] py-10 px-4 sm:px-6">
        <div className="max-w-screen-lg mx-auto lg:grid lg:grid-cols-5 gap-6 items-start">
          {/* Left Sticky Panel */}
          <div className="lg:col-span-2 sticky top-24 mb-10 lg:mb-0">
            <Link href="/" className="text-slate-500 hover:text-slate-700 text-sm transition-colors flex items-center gap-1 mb-6">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><polyline points="15 18 9 12 15 6" /></svg>
              Back
            </Link>
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="inline-block px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full text-xs font-semibold mb-4">
              AI-Powered Verification
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Apply with confidence</h1>
            <p className="text-slate-500 text-sm mb-6">
              Your application is verified automatically — no manual review delays.
            </p>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 mt-0.5 shrink-0">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-slate-700 text-sm">Submit your resume & GitHub</span>
              </div>
              <div className="flex items-start gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 mt-0.5 shrink-0">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-slate-700 text-sm">ResumeProof verifies your profile</span>
              </div>
              <div className="flex items-start gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 mt-0.5 shrink-0">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-slate-700 text-sm">Get a decision within minutes</span>
              </div>
            </div>

            <hr className="border-slate-100 mb-5" />

            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Your data is encrypted and never shared.</span>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-slate-800">Your Application</h2>
              <p className="text-slate-500 text-sm mt-1">Fill in the details below — all starred fields are required.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name <span className="text-indigo-500">*</span></label>
                  <input name="name" required placeholder="Jane Smith" className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 placeholder-slate-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email <span className="text-indigo-500">*</span></label>
                  <input name="email" type="email" required placeholder="jane@example.com" className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 placeholder-slate-400" />
                </div>
              </div>

              {/* Phone + Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
                  <input name="phone" type="tel" placeholder="+91 98765 43210" className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 placeholder-slate-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Role Applying For <span className="text-indigo-500">*</span></label>
                  <select name="role" required defaultValue="" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 has-[option:checked[value='']]:text-slate-400 text-slate-900">
                    <option value="" disabled className="text-slate-400">Select role</option>
                    {ROLES.map((r) => <option key={r} value={r} className="text-slate-900">{r}</option>)}
                  </select>
                </div>
              </div>

              {/* GitHub + LinkedIn */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">GitHub Username <span className="text-indigo-500">*</span></label>
                  <div className="flex bg-white border border-slate-200 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-1 overflow-hidden">
                    <span className="flex items-center justify-center bg-slate-50 border-r border-slate-200 px-3 text-slate-400 text-sm">@</span>
                    <input name="githubUsername" required placeholder="janedoe" className="flex-1 w-full text-slate-900 px-3 py-2.5 text-sm focus:outline-none placeholder-slate-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">LinkedIn URL</label>
                  <input name="linkedinUrl" type="url" placeholder="linkedin.com/in/jane" className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 placeholder-slate-400" />
                </div>
              </div>

              {/* Resume upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Resume (PDF, max 5MB) <span className="text-indigo-500">*</span></label>
                <div
                  className="w-full bg-slate-50 border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/30 rounded-lg p-8 text-center cursor-pointer transition-colors"
                  onClick={() => fileRef.current?.click()}
                >
                  {fileName ? (
                    <div className="flex items-center justify-center gap-2 text-indigo-600 font-medium text-sm">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      {fileName}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 mb-2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <p className="text-slate-600 text-sm font-medium">Click to upload PDF</p>
                    </div>
                  )}
                  <input
                    ref={fileRef}
                    name="resume"
                    type="file"
                    accept=".pdf,application/pdf"
                    required
                    className="hidden"
                    onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
                  />
                </div>
              </div>

              {/* Cover Note */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Cover Note (optional)</label>
                <textarea name="coverNote" rows={3} placeholder="Tell us why you're a great fit..." className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 placeholder-slate-400 resize-none" />
              </div>

              {state === "error" && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={state === "loading"}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors duration-150 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
              >
                {state === "loading" ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying your application...
                  </>
                ) : (
                  "Submit Application →"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
      </main>
    </div>
  );
}
