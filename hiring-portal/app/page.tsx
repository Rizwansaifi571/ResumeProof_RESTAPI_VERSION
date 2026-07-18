import { HomeHero } from "@/components/home/HomeHero";
import { HomeHighlights } from "@/components/home/HomeHighlights";

export default function HomePage() {
  return (
    <div className="animate-fade-in">
      <main className="min-h-screen bg-[#F8F9FC] text-slate-900">
        <HomeHero />
        <HomeHighlights />
      </main>
    </div>
  );
}
