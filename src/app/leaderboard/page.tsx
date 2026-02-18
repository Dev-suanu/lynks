import Link from "next/link";
import { Trophy, ArrowLeft, Stars } from "lucide-react";
import { CreditIcon } from "@/components/CreditIcon";

export default function LeaderboardPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 mt-20">
      {/* Background Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-lime-500/10 blur-[120px] pointer-events-none" />

      <div className="relative flex flex-col items-center text-center max-w-md">
        {/* Animated Icon Header */}
        <div className="relative mb-8">
          <div className="p-5 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm relative z-10">
            <Trophy size={48} className="text-lime-400 animate-pulse" />
          </div>
          {/* Decorative Sparkles */}
          <Stars className="absolute -top-4 -right-4 text-lime-500/50 animate-bounce" size={24} />
        </div>

        {/* Text Content */}
        <h1 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase">
          Leaderboard
        </h1>
        
        <div className="flex items-center gap-2 bg-lime-500/10 px-4 py-1.5 rounded-full border border-lime-500/20 mb-6">
          <span className="text-xs font-bold text-lime-500 uppercase tracking-widest">Coming Soon</span>
        </div>

      

        {/* Action Button */}
        <Link 
          href="/" 
          className="flex items-center gap-2 text-sm font-bold bg-white text-black px-6 py-3 rounded-full hover:bg-lime-400 transition-all active:scale-95 shadow-lg shadow-lime-500/5"
        >
          <ArrowLeft size={16} />
          Back to Tasks
        </Link>
      </div>

      {/* Footer Teaser */}
      <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-sm">
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
          <p className="text-[10px] text-gray-500 uppercase font-black">Monthly Prizes</p>
          <p className="text-xs text-white mt-1">Reward Pools</p>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
          <p className="text-[10px] text-gray-500 uppercase font-black">Elite Status</p>
          <p className="text-xs text-white mt-1">Special Badges</p>
        </div>
      </div>
    </div>
  );
}