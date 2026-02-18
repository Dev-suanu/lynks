"use client";

import { useState } from "react";
import { resolveDisputeAction } from "@/app/actions/dispute";
import { Check, X, ExternalLink, AlertTriangle } from "lucide-react";

export default function AdminDisputeCard({ submission }: { submission: any }) {
  const [loading, setLoading] = useState(false);

  const handleDecision = async (decision: "APPROVED" | "REJECTED") => {
    setLoading(true);
    await resolveDisputeAction(submission.id, decision);
    setLoading(false);
  };

  return (
    <div className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden mb-6">
      {/* Header */}
      <div className="p-4 bg-white/5 flex justify-between items-center">
        <div>
          <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Dispute Case</p>
          <h3 className="text-sm font-medium">User: {submission.user.email}</h3>
        </div>
        <span className="text-xs text-gray-500">Reward: {submission.post.reward} Credits</span>
      </div>

      {/* Proof Section - Focused on the Screenshot */}
      <div className="p-4">
        <div className="relative group rounded-xl overflow-hidden border border-white/5 bg-black">
          <img 
            src={submission.proofUrl} 
            alt="User Submission Proof" 
            className="w-full h-auto max-h-[500px] object-contain"
          />
          <a 
            href={submission.proofUrl} 
            target="_blank" 
            className="absolute top-2 right-2 p-2 bg-black/60 rounded-full hover:bg-black transition"
          >
            <ExternalLink size={16} />
          </a>
        </div>

        {/* Rejection Context */}
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={14} className="text-red-400" />
            <p className="text-[10px] font-bold text-red-400 uppercase">Original Rejection Reason:</p>
          </div>
          <p className="text-sm text-gray-300">"{submission.rejectionReason || "No reason provided"}"</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            disabled={loading}
            onClick={() => handleDecision("APPROVED")}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition"
          >
            <Check size={18} /> Overturn & Pay User
          </button>
          <button
            disabled={loading}
            onClick={() => handleDecision("REJECTED")}
            className="flex-1 bg-white/5 hover:bg-white/10 disabled:opacity-50 border border-white/10 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition"
          >
            <X size={18} /> Uphold Rejection
          </button>
        </div>
      </div>
    </div>
  );
}