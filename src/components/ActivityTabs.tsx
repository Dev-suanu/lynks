"use client";

import { useState } from "react";
import { 
  BadgeCheck, 
  Clock, 
  ImageIcon, 
  X, 
  Loader2, 
  ChevronLeft, 
  ExternalLink, 
  Trash2 
} from "lucide-react";
import { updateSubmissionStatusAction } from "@/app/actions/submission";
import { deletePostAction } from "@/app/actions/post";
import { CreditIcon } from "@/components/CreditIcon"; // Import the new icon

interface Props {
  mySubmissions: any[];
  myCreatedPosts: any[];
  receivedSubmissions: any[];
}

export default function ActivityTabs({ mySubmissions, myCreatedPosts, receivedSubmissions }: Props) {
  const [activeTab, setActiveTab] = useState("submitted");
  const [viewingPostId, setViewingPostId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const selectedPostSubmissions = receivedSubmissions.filter(s => s.postId === viewingPostId);
  const selectedPost = myCreatedPosts.find(p => p.id === viewingPostId);

  const handleDelete = async (postId: string) => {
    const confirmDelete = confirm(
      "Are you sure? This will delete the task. Any PENDING submissions will be automatically APPROVED and paid out to the users."
    );
    
    if (!confirmDelete) return;

    setIsDeleting(postId);
    try {
      await deletePostAction(postId);
    } catch (err) {
      alert("Failed to delete task. Please try again.");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div>
      {/* Screenshot Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col gap-4">
            <button className="absolute -top-10 right-0 text-white hover:text-gray-300 flex items-center gap-2 text-sm">
              <X size={20} /> Close
            </button>
            <img 
              src={previewImage} 
              alt="Proof Screenshot" 
              className="w-full h-full object-contain rounded-lg shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()} 
            />
            <div className="flex justify-center">
               <a 
                href={previewImage} 
                target="_blank" 
                className="text-xs bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full flex items-center gap-2 transition"
                onClick={(e) => e.stopPropagation()}
               >
                 <ExternalLink size={14} /> Open Original
               </a>
            </div>
          </div>
        </div>
      )}

      {viewingPostId && (
        <button 
          onClick={() => setViewingPostId(null)}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition group"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to My Tasks
        </button>
      )}

      {!viewingPostId && (
        <div className="flex gap-8 border-b border-white/10 mb-6">
          <button 
            onClick={() => setActiveTab("submitted")}
            className={`relative pb-3 text-sm font-medium transition-colors ${activeTab === 'submitted' ? 'text-white' : 'text-gray-500'}`}
          >
            Tasks Done
            {activeTab === 'submitted' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#07692d] to-[#00B33C]" />}
          </button>
          <button 
            onClick={() => setActiveTab("my-tasks")}
            className={`relative pb-3 text-sm font-medium transition-colors ${activeTab === 'my-tasks' ? 'text-white' : 'text-gray-500'}`}
          >
            My Tasks
            {activeTab === 'my-tasks' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#07692d] to-[#00B33C]" />}
          </button>
        </div>
      )}

      <div className="space-y-4">
        {viewingPostId ? (
          <>
            <div className="mb-4">
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Reviewing Submissions for</p>
              <p className="text-sm text-white truncate font-medium">{selectedPost?.url}</p>
            </div>
            {selectedPostSubmissions.length > 0 ? (
              selectedPostSubmissions.map((sub) => (
                <ActivityCard key={sub.id} sub={sub} type="received" onPreview={setPreviewImage} />
              ))
            ) : <EmptyState message="No pending submissions remaining." />}
          </>
        ) : (
          activeTab === "submitted" ? (
            mySubmissions.length > 0 ? (
              mySubmissions.map((sub) => <ActivityCard key={sub.id} sub={sub} type="sent" onPreview={setPreviewImage} />)
            ) : <EmptyState message="You haven't submitted any tasks yet." />
          ) : (
            myCreatedPosts.map((post) => (
              <div key={post.id} className="bg-white/10 border border-white/10 overflow-hidden shadow-lg rounded-xl">
                <div className="p-2">
                  <div className="rounded-xl overflow-hidden mb-6 max-h-[200px] relative tweet-hide-media">
                    <TweetContent tweetData={post.tweetData} reward={post.reward} />
                  </div>

                  <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                    <div className="flex flex-col">
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Review Queue</p>
                      <p className="text-sm font-mono text-lime-500">
                        {post._count?.submissions || 0} Waiting
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        disabled={isDeleting === post.id}
                        onClick={() => handleDelete(post.id)}
                        className="p-2 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition rounded-lg border border-white/5 disabled:opacity-50"
                      >
                        {isDeleting === post.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>

                      <button 
                        onClick={() => setViewingPostId(post.id)}
                        className="text-sm px-4 py-1.5 bg-white/10 hover:bg-white/20 flex items-center gap-2 transition rounded-sm text-white border border-white/10"
                      >
                        Review
                        {post._count.submissions > 0 && (
                          <span className="flex h-2 w-2 rounded-full bg-lime-500 animate-pulse" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}

function TweetContent({ tweetData, reward }: { tweetData: any, reward: number }) {
  if (!tweetData) return <div className="p-4 text-xs text-gray-500 italic bg-white/5 rounded-xl">Tweet content unavailable</div>;
  
  return (
    <div className="flex flex-col gap-3 p-1 rounded-xl transition-shadow">
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <img 
            src={tweetData.user.profile_image_url_https} 
            alt={tweetData.user.name} 
            className="w-8 h-8 rounded-full border border-white/10"
          />
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold text-white">{tweetData.user.name}</span>
            <span className="text-[10px] text-gray-500">@{tweetData.user.screen_name}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-lime-500/10 px-2 py-0.5 rounded-md border border-lime-500/20">
          <CreditIcon className="w-3 h-3" />
          <span className="text-[11px] font-black text-lime-500">+{reward}</span>
        </div>
      </div>
      <p className="text-sm text-white leading-relaxed line-clamp-3">
        {tweetData.text}
      </p>
    </div>
  );
}

function ActivityCard({ sub, type, onPreview }: { sub: any, type: 'sent' | 'received', onPreview: (url: string) => void }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus: "APPROVED" | "REJECTED") => {
    let reason = "";
    if (newStatus === "REJECTED") {
      const input = prompt("Enter reason for rejection:");
      if (input === null) return;
      reason = input || "No reason provided.";
    }
    setIsUpdating(true);
    try { await updateSubmissionStatusAction(sub.id, newStatus, reason); } 
    catch (err) { alert("Something went wrong."); } 
    finally { setIsUpdating(false); }
  };

  return (
    <div className="bg-white/10 border border-white/10 overflow-hidden shadow-lg rounded-xl">
      <div className="p-2">
        <div className="rounded-xl overflow-hidden mb-4 max-h-[200px] relative tweet-hide-media">
            <TweetContent tweetData={sub.tweetData} reward={sub.post.reward} />
        </div>

        <div className="pt-3 border-t border-white/10 flex items-center justify-between px-1 pb-1">
          <div className="flex flex-col gap-1">
            {type === 'received' && (
               <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">From: {sub.user.name}</p>
            )}
            <div className="flex items-center gap-2">
              {sub.status === "PENDING" && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-md text-[10px] font-bold text-orange-400">
                  <Clock size={12} /> PENDING
                </span>
              )}
              {sub.status === "APPROVED" && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-md text-[10px] font-bold text-green-500">
                  <BadgeCheck size={12} /> APPROVED
                </span>
              )}
              {sub.status === "REJECTED" && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-md text-[10px] font-bold text-red-500">
                  <X size={12} /> REJECTED
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => onPreview(sub.proofUrl)}
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition font-medium"
            >
              <ImageIcon size={14} /> View Proof
            </button>

            {type === 'received' && sub.status === "PENDING" && (
              <div className="flex items-center gap-2 border-l border-white/10 pl-3">
                <button disabled={isUpdating} onClick={() => handleStatusUpdate("REJECTED")} className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition"><X size={16} /></button>
                <button disabled={isUpdating} onClick={() => handleStatusUpdate("APPROVED")} className="p-1.5 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition">
                  {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <BadgeCheck size={16} />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  );
}