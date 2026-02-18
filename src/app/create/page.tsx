"use client";

import { useActionState, useRef } from "react";
import { useSession } from "next-auth/react";
import { createPublicLynk } from "../actions/post";
import Link from "next/link";
import { 
  UserCircle, 
  Lock, 
  Loader2, 
  ClipboardPaste, 
  Link as LinkIcon, 
  Sparkles, 
  Info, 
  CreditCard 
} from "lucide-react";

export default function CreatePostPage() {
  const { data: session, status } = useSession();
  const [state, formAction, isPending] = useActionState(createPublicLynk, null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  // Economy constants to match Server Action
  const POSTING_COST = 25;
  const STANDARD_REWARD = 5;

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (urlInputRef.current) {
        urlInputRef.current.value = text;
      }
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  };

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  if (status === "loading") return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Loader2 className="animate-spin text-lime-500" size={40} />
    </div>
  );

  const hasUsername = !!session?.user?.name;

  if (!hasUsername) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] border border-white/5 rounded-sm text-center shadow-2xl">
        <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-orange-500/20">
          <Lock className="text-orange-500" size={32} />
        </div>
        <h2 className="text-2xl font-black text-white mb-3 tracking-tight">Username Required</h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-8 px-4">
          To maintain community standards, you must set your X username before posting tasks.
        </p>
        <Link 
          href="/profile" 
          className="w-full inline-flex items-center justify-center gap-2 bg-white text-black py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-95"
        >
          <UserCircle size={20} /> Complete Profile
        </Link>
      </div>
    );
  }

  const isLimitError = state?.error?.includes("Daily limit reached");

  return (
    <div className="max-w-md mx-auto mt-30 mb-20 px-4">
      <div className="bg-[#121212] border border-white/10 rounded-sm p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-lime-600/10 blur-[50px]" />
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
           
            <h2 className="text-2xl font-black text-white tracking-tight uppercase">Create Task</h2>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Daily Slots</span>
            <span className="text-xs font-bold text-lime-500">Max 5 Tasks</span>
          </div>
        </div>
        
        <form action={formAction} className="flex flex-col gap-6 relative z-10">
          {/* URL Input */}
          <div className="flex flex-col gap-2.5">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Task URL (X Link)</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-lime-500 transition-colors">
                <LinkIcon size={18} />
              </div>
              <input 
                ref={urlInputRef}
                name="url" 
                type="url" 
                placeholder="https://x.com/status/..." 
                className="w-full bg-black/50 border border-white/10 pl-11 pr-14 py-3 rounded-lg text-white focus:border-lime-500 focus:ring-1 focus:ring-lime-500 outline-none transition-all placeholder:text-gray-700" 
                required 
              />
              <button 
                type="button"
                onClick={handlePaste}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                title="Paste from clipboard"
              >
                <ClipboardPaste size={20} />
              </button>
            </div>
          </div>

          {/* New Transaction Summary Block */}
          <div className="flex flex-col gap-2.5">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1 text-lime-500">Fee Details</label>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400 font-medium">Platform Posting Fee</span>
                <div className="flex items-center gap-1.5 text-white">
                  <span className="text-sm font-black">{POSTING_COST}</span>
                  <span className="text-[10px] font-bold text-lime-500">CREDITS</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                <span className="text-xs text-gray-400 font-medium italic">Standard User Reward</span>
                <div className="flex items-center gap-1 text-gray-500">
                  <span className="text-xs font-bold">{STANDARD_REWARD}</span>
                  <span className="text-[8px] font-bold">CREDITS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Custom Reward Input */}
          {isAdmin && (
            <div className="flex flex-col gap-2.5">
              <label className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] ml-1">Admin Reward Overide</label>
              <input 
                name="reward" 
                type="number" 
                placeholder="Set reward amount..." 
                className="bg-purple-500/5 border border-purple-500/20 p-4 rounded-xl text-white focus:border-purple-500 outline-none transition-all placeholder:text-purple-900" 
                required 
              />
            </div>
          )}

          {/* Standard User Hidden Reward */}
          {!isAdmin && <input type="hidden" name="reward" value={STANDARD_REWARD} />}
          
          {/* Feedback Messages */}
          {state?.error && (
            <div className={`p-4 rounded-lg animate-in fade-in slide-in-from-top-2 border ${
              isLimitError ? "bg-orange-500/10 border-orange-500/20" : "bg-red-500/10 border-red-500/20"
            }`}>
              <div className="flex items-start gap-3">
                {isLimitError && <Info size={16} className="text-orange-500 mt-0.5" />}
                <p className={`${isLimitError ? "text-orange-500" : "text-red-500"} text-xs font-bold leading-tight`}>
                  {state.error}
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={isPending || (isLimitError as boolean)}
            className="group relative text-sm px-4 py-4 bg-gradient-to-r from-[#07692d] to-[#00B33C] rounded-md font-black text-white hover:opacity-90 transition disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed overflow-hidden shadow-xl shadow-lime-800/20 uppercase tracking-widest"
          >
            <div className="relative z-10 flex items-center justify-center gap-2">
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Deducting {POSTING_COST} Credits...</span>
                </>
              ) : (
                <span>{isLimitError ? "Limit Reached" : "Pay 25 & Create Task"}</span>
              )}
            </div>
          </button>

          <p className="text-[9px] text-gray-600 text-center font-bold uppercase tracking-tighter">
            Posting cost is non-refundable. Abuse results in a ban.
          </p>
        </form>
      </div>
    </div>
  );
}