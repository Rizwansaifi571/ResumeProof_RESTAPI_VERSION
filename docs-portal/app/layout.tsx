import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk, Fira_Code } from "next/font/google";
import "./globals.css";
import "./public-surfaces.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const firaCode = Fira_Code({ subsets: ["latin"], variable: "--font-fira-code" });

export const metadata: Metadata = {
  title: "ResumeProof Docs Portal",
  description: "API Documentation and Webhooks for ResumeProof",
};

//deployment
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} ${firaCode.variable} font-sans bg-zinc-950 text-zinc-300 antialiased`}>
        {children}
      </body>
    </html>
  );
}
