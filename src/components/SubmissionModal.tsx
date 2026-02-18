"use client";

import { useState } from "react";
import { X, InfoIcon, BadgeCheck, UserCircle, ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";
import SubmissionForm from "./SubmissionForm";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Added router

interface Props {
  postId: string;
  hasSubmitted: boolean;
  reward: number;
  classname: string;
}

export default function SubmissionModal({ postId, hasSubmitted, reward, classname}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const hasUsername = !!session?.user?.name;

  // New handler to intercept clicks
  const handleTriggerClick = () => {
    if (!session) {
      router.push("/login");
      return;
    }
    setIsOpen(true);
  };

  return (
    <>
      {/* 1. The Trigger Button */}
      <button
        onClick={handleTriggerClick} // Use the new handler
        disabled={hasSubmitted}
        className={`${classname} py-1 px-2 rounded-sm transition-all ${
          hasSubmitted 
          ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
          : "text-sm border border-lime-600 px-2 py-1 rounded-sm text-white hover:opacity-90 shadow-lg shadow-green-900/20"
        }`}
      >
        {hasSubmitted ? "✓ Proof Submitted" : "Verify Task"}
      </button>

      {/* 2. The Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121212] border border-white/10 w-full max-w-md rounded-2xl overflow-hidden relative shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            <button 
              onClick={() => setIsOpen(false)}
              className="sticky top-4 left-[90%] z-50 right-4 text-white/50 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="p-6">
                <p className="text-xl font-bold mb-1">Task Instructions</p>
                <p className="text-sm text-white/50">Follow these steps carefully to receive your reward.</p>

                <ol className="list-decimal p-1 flex flex-col gap-2 mt-2">
                    <li>Open the linked X post</li>
                    <li>Like and Post a meaningful comment containing <span className="text-green-500">at least 4 words </span>related to the post content.</li>
                    <li>Verification will fail if the commenting username does not match your linked account.</li>
                    <li>Take a screenshot of your comment, with your username visible, and post it here.</li>
                    <li>Submissions that do not adhere to the rules above may be rejected by the task creator.</li>
                </ol>
            
                 <div className="mt-8">
                    <p className="font-semibold mb-2">Upload Screenshot</p>
                    
                    {/* REMOVED THE DUPLICATE FORM FROM HERE */}

                    {hasUsername ? (
                      <SubmissionForm postId={postId} />
                    ) : (
                      <div className="bg-orange-500/10 border border-orange-500/30 p-5 rounded-2xl flex flex-col items-center text-center gap-3">
                        <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                          <UserCircle className="text-orange-500" size={24} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">Username Required</p>
                          <p className="text-xs text-gray-400 mt-1">You must link your X username to your profile before submitting proof.</p>
                        </div>
                        <Link 
                          href="/profile"
                          className="flex items-center gap-2 text-xs font-bold bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition"
                        >
                          Go to Profile <ArrowRight size={14} />
                        </Link>
                      </div>
                    )}
                 </div>
            </div>

            <div className="p-4 flex flex-col gap-3">
                <div className="flex flex-col gap-2 border border-white/10 rounded-xl p-4 bg-[#121212]">
                    <div className="flex gap-2 items-center">
                        <InfoIcon className="text-orange-400" size={17}/>
                        <p className="uppercase text-orange-400 text-sm">review time</p>
                    </div>
                    <p className="text-sm text-white/50">
                        Validation usually takes 0 - 12 hours. Your credits will be credited automatically upon approval.
                    </p>
                </div>

                <div className="flex flex-col gap-2 border border-white/10 rounded-xl p-4 bg-[#022e0241]">
                    <div className="flex gap-2 items-center">
                     <BadgeCheck className="fill-green-500 text-[#121212]"/>
                        <p className="uppercase text-green-500 text-sm">automatic approval</p>
                    </div>
                    <p className="text-sm text-white/50">
                        If the poster does not review your submission within 12 hours, it will be automatically approved and credits will be awarded.
                    </p>
                </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}