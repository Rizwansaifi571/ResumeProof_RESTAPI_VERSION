import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TechCorp Hiring Portal",
  description: "Demo hiring platform powered by ResumeProof verification",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#F8F9FC] text-slate-900 antialiased min-h-screen`}>
        <nav className="bg-white border-b border-[#E2E8F0] h-[56px] flex items-center">
          <div className="w-full max-w-[1200px] mx-auto px-[24px] flex justify-between items-center">
            <div className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="bg-indigo-600 rounded-sm">
                <path d="M6 6H14M10 6V14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-semibold text-slate-900">TechCorp</span>
            </div>
            <div className="flex items-center gap-4 text-sm font-medium">
              <Link href="/apply" className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md hover:bg-slate-50 transition-colors duration-150">Apply Now</Link>
              <Link href="/admin" className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md hover:bg-slate-50 transition-colors duration-150">Check Status</Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
