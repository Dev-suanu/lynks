"use client";

import { useState, useEffect } from "react";
import { 
  BadgeCheck, 
  Clock, 
  ImageIcon, 
  X, 
  Loader2, 
  ChevronLeft, 
  ExternalLink, 
  Trash2,
  MessageSquare,
  Users
} from "lucide-react";
import { updateSubmissionStatusAction } from "@/app/actions/submission";
import { deletePostAction } from "@/app/actions/post";
import { CreditIcon } from "@/components/CreditIcon";
// import { markNotificationsAsReadAction } from "@/app/actions/notification";
import Badge from "@/components/Badge";

interface Props {
  mySubmissions: any[];
  myCreatedPosts: any[];
  receivedSubmissions: any[];
  unreadSentCount?: number;
  unreadReceivedCount?: number;
}

export default function ActivityTabs({ 
  mySubmissions, 
  myCreatedPosts, 
  receivedSubmissions,
  unreadSentCount = 0,
  unreadReceivedCount = 0 
}: Props) {
  const [activeTab, setActiveTab] = useState("submitted");
  const [viewingPostId, setViewingPostId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Badge count for "My Tasks" tab
  const totalPendingToReview = receivedSubmissions.filter(s => s.status === "PENDING").length;

  const selectedPostSubmissions = receivedSubmissions.filter(s => s.postId === viewingPostId);
  const selectedPost = myCreatedPosts.find(p => p.id === viewingPostId);

  useEffect(() => {
    if (activeTab === "submitted") {
      markNotificationsAsReadAction("STATUS_UPDATE");
    }
  }, []);

  const handleTabChange = async (tab: string) => {
    setActiveTab(tab);
    try {
      if (tab === "submitted") {
        await markNotificationsAsReadAction("STATUS_UPDATE");
      } 
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  };

  const handleDelete = async (postId: string) => {
    const confirmDelete = confirm(
      "Are you sure? This will delete the task. Any PENDING submissions will be automatically APPROVED."
    );
    if (!confirmDelete) return;

    setIsDeleting(postId);
    try {
      await deletePostAction(postId);
    } catch (err) {
      alert("Failed to delete task.");
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
            onClick={() => handleTabChange("submitted")}
            className={`relative pb-3 text-sm font-medium transition-colors flex items-center ${activeTab === 'submitted' ? 'text-white' : 'text-gray-500'}`}
          >
            <Badge count={unreadSentCount}>
              <span className="pr-4">Tasks Done</span>
            </Badge>
            {activeTab === 'submitted' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#07692d] to-[#00B33C]" />}
          </button>
          <button 
            onClick={() => handleTabChange("my-tasks")}
            className={`relative pb-3 text-sm font-medium transition-colors flex items-center ${activeTab === 'my-tasks' ? 'text-white' : 'text-gray-500'}`}
          >
            <Badge count={totalPendingToReview}>
              <span className="pr-4">My Tasks</span>
            </Badge>
            {activeTab === 'my-tasks' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#07692d] to-[#00B33C]" />}
          </button>
        </div>
      )}

      <div className="space-y-4 mb-15">
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
            myCreatedPosts.map((post) => {
              // Calculate "Waiting" count from the receivedSubmissions prop
              const postPendingCount = receivedSubmissions.filter(s => s.postId === post.id && s.status === "PENDING").length;
              
              return (
                <div key={post.id} className="bg-white/10 border border-white/10 overflow-hidden shadow-lg rounded-xl p-2">
                  <div className="rounded-xl overflow-hidden mb-6 max-h-[200px] relative tweet-hide-media">
                    <TweetContent tweetData={post.tweetData} reward={post.reward} />
                  </div>
                  <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Review Queue</p>
                        <p className="text-sm font-mono text-lime-500">{postPendingCount} Waiting</p>
                      </div>
                      <div className="flex flex-col border-l border-white/5 pl-4">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter flex items-center gap-1">
                          <Users size={10} /> Total Fill
                        </p>
                        <p className="text-sm font-mono text-white/70">
                          {post._count?.submissions || 0} / {post.maxSubmissions || 50}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button disabled={isDeleting === post.id} onClick={() => handleDelete(post.id)} className="p-2 text-red-500/60 hover:text-red-500 transition rounded-lg border border-white/5">
                        {isDeleting === post.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      </button>
                      <button onClick={() => setViewingPostId(post.id)} className="text-sm px-4 py-1.5 bg-white/10 hover:bg-white/20 flex items-center gap-2 transition rounded-sm text-white border border-white/10">
                        Review {postPendingCount > 0 && <span className="flex h-2 w-2 rounded-full bg-lime-500 animate-pulse" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )
        )}
      </div>
    </div>
  );
}

function TweetContent({ tweetData, reward }: { tweetData: any, reward: number }) {
  if (!tweetData) return <div className="p-4 text-xs text-gray-500 italic bg-white/5 rounded-xl">Tweet content unavailable</div>;
  return (
    <div className="flex flex-col gap-3 p-1 rounded-xl">
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <img src={tweetData.user.profile_image_url_https} alt={tweetData.user.name} className="w-8 h-8 rounded-full border border-white/10" />
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
      <p className="text-sm text-white leading-relaxed line-clamp-3">{tweetData.text}</p>
    </div>
  );
}

function ActivityCard({ sub, type, onPreview }: { sub: any, type: 'sent' | 'received', onPreview: (url: string) => void }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [disputeMessage, setDisputeMessage] = useState("");

  const handleStatusUpdate = async (newStatus: "APPROVED" | "REJECTED") => {
    if (newStatus === "REJECTED" && !showRejectModal && !rejectReason) {
      setShowRejectModal(true);
      return;
    }
    setIsUpdating(true);
    try { 
      await updateSubmissionStatusAction(sub.id, newStatus, rejectReason); 
      setShowRejectModal(false);
      setRejectReason("");
    } catch (err) { alert("Something went wrong."); } 
    finally { setIsUpdating(false); }
  };

  const handleDisputeSubmit = async () => {
    if (!disputeMessage.trim()) return;
    setIsUpdating(true);
    try {
      const formattedDispute = `DISPUTE: ${disputeMessage}`;
      await updateSubmissionStatusAction(sub.id, "DISPUTED", formattedDispute);
      setShowDisputeModal(false);
      setDisputeMessage("");
      alert("Dispute sent!");
    } catch (err) { alert("Failed to send dispute."); } 
    finally { setIsUpdating(false); }
  };

  const isDispute = sub.rejectionReason?.startsWith("DISPUTE:");
  const displayReason = sub.rejectionReason?.replace("DISPUTE:", "").trim();

  return (
    <div className="bg-white/5 border border-white/10 overflow-hidden shadow-lg rounded-xl relative">
      {showRejectModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-red-500/5 flex justify-between items-center">
              <div className="flex items-center gap-2 text-red-500">
                <X size={18} strokeWidth={3} />
                <span className="text-sm font-black uppercase tracking-widest">Reject Submission</span>
              </div>
              <button onClick={() => setShowRejectModal(false)} className="p-1 hover:bg-white/10 rounded-full transition">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <textarea 
                autoFocus
                className="w-full h-40 bg-white/[0.03] border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-red-500/50 resize-none"
                placeholder="Explain why this was rejected..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <div className="p-4 bg-white/[0.02] border-t border-white/5 flex gap-3">
              <button onClick={() => setShowRejectModal(false)} className="flex-1 py-3 text-[10px] font-bold text-gray-500 uppercase">Cancel</button>
              <button 
                disabled={isUpdating || !rejectReason.trim()}
                onClick={() => handleStatusUpdate("REJECTED")}
                className="flex-[2] py-3 bg-red-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest"
              >
                {isUpdating ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDisputeModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-blue-500/5 flex justify-between items-center">
              <div className="flex items-center gap-2 text-blue-400">
                <MessageSquare size={18} />
                <span className="text-sm font-black uppercase tracking-widest">Dispute Rejection</span>
              </div>
              <button onClick={() => setShowDisputeModal(false)} className="p-1 hover:bg-white/10 rounded-full transition">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <textarea 
                autoFocus
                className="w-full h-40 bg-white/[0.03] border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-blue-500/50 resize-none"
                placeholder="Why is this incorrect?"
                value={disputeMessage}
                onChange={(e) => setDisputeMessage(e.target.value)}
              />
            </div>
            <div className="p-4 bg-white/[0.02] border-t border-white/5 flex gap-3">
              <button onClick={() => setShowDisputeModal(false)} className="flex-1 py-3 text-[10px] font-bold text-gray-400 uppercase">Cancel</button>
              <button 
                disabled={isUpdating || !disputeMessage.trim()}
                onClick={handleDisputeSubmit}
                className="flex-[2] py-3 bg-blue-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest"
              >
                {isUpdating ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Send to Admin"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 flex flex-col gap-4">
        {type === 'received' ? (
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <div className="h-6 w-6 rounded-full bg-lime-500/20 flex items-center justify-center border border-lime-500/30">
              <span className="text-[10px] text-lime-500 font-bold uppercase">{sub.user.name[0]}</span>
            </div>
            <p className="text-sm font-bold text-white uppercase truncate">{sub.user.name}</p>
          </div>
        ) : (
          <TweetContent tweetData={sub.tweetData} reward={sub.post.reward} />
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {sub.status === "PENDING" && <span className="flex items-center gap-1 px-2 py-1 bg-orange-500/10 border border-orange-500/20 rounded-md text-[10px] font-bold text-orange-400 uppercase"><Clock size={12} /> PENDING</span>}
            {sub.status === "APPROVED" && <span className="flex items-center gap-1 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-md text-[10px] font-bold text-green-500 uppercase"><BadgeCheck size={12} /> APPROVED</span>}
            {sub.status === "REJECTED" && <span className="flex items-center gap-1 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded-md text-[10px] font-bold text-red-500 uppercase"><X size={12} /> REJECTED</span>}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => onPreview(sub.proofUrl)} className="text-[11px] text-blue-400 font-bold uppercase flex items-center gap-1">
              <ImageIcon size={14} /> Proof
            </button>

            {type === 'received' && sub.status === "PENDING" && (
              <div className="flex items-center gap-2 border-l border-white/10 pl-3">
                <button disabled={isUpdating} onClick={() => handleStatusUpdate("REJECTED")} className="p-1.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition"><X size={16} /></button>
                <button disabled={isUpdating} onClick={() => handleStatusUpdate("APPROVED")} className="p-1.5 rounded-lg bg-lime-500 text-black hover:bg-lime-400 transition">
                   {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <BadgeCheck size={16} />}
                </button>
              </div>
            )}

            {type === 'sent' && sub.status === "REJECTED" && !isDispute && (
              <button 
                onClick={() => setShowDisputeModal(true)}
                className="px-3 py-1 bg-white/10 border border-white/10 rounded-md text-[10px] font-bold text-white uppercase hover:bg-white/20 transition"
              >
                Dispute
              </button>
            )}
          </div>
        </div>

        {sub.status === "REJECTED" && sub.rejectionReason && (
          <div className={`rounded-xl p-4 mt-1 border animate-in slide-in-from-top-2 duration-300 ${isDispute ? 'bg-blue-500/10 border-blue-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
            <div className={`flex items-center gap-2 mb-2 ${isDispute ? 'text-blue-400' : 'text-red-500'}`}>
              {isDispute ? <MessageSquare size={14} /> : <X size={14} strokeWidth={3} />}
              <p className="text-[10px] font-black uppercase tracking-widest">
                {type === 'received' ? (isDispute ? "User's Dispute" : "Your Previous Feedback") : (isDispute ? "Dispute Submitted" : "Admin Feedback")}
              </p>
            </div>
            <p className={`text-sm leading-relaxed italic pl-3 border-l-2 ${isDispute ? 'text-blue-100/90 border-blue-500/30' : 'text-red-100/90 border-red-500/30'}`}>
              "{displayReason}"
            </p>
          </div>
        )}
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