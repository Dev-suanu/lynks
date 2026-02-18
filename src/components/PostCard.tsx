// src/components/PostCard.tsx
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export default function PostCard({ post }: { post: any }) {
  return (
    <div className="bg-white/5 border border-white/10 p-5 rounded-lg hover:border-white/20 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Target Link</span>
          <a 
            href={post.url} 
            target="_blank" 
            className="text-blue-400 text-sm flex items-center gap-1 hover:underline truncate max-w-[200px]"
          >
            {post.url} <ExternalLink size={12} />
          </a>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block">Reward</span>
          <span className="text-lime-500 font-mono font-bold">🪙 {post.reward} Credits</span>
        </div>
      </div>

      {/* If you have TweetContent or other preview logic, put it here */}
      <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
         <p className="text-gray-300 text-sm leading-relaxed">
           Complete the task to earn your reward.
         </p>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <span className="text-xs text-gray-500">
          {post._count?.submissions || 0} participants
        </span>
        <Link 
          href={`/post/${post.id}`}
          className="bg-white text-black text-xs font-bold px-4 py-2 rounded-full hover:bg-gray-200 transition"
        >
          View Task
        </Link>
      </div>
    </div>
  );
}