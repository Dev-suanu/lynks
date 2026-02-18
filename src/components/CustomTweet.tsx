"use client";
import { CreditIcon } from "./CreditIcon";
// This is a regular function, NOT async
export default function ClientTweet({ tweet, reward }: { tweet: any; reward: number }) {
  if (!tweet) {
    return (
      <div className="p-4 border border-red-500/20 bg-red-500/5 text-red-400 rounded-lg text-xs">
        Tweet not found or private.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-1 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <img 
            src={tweet.user.profile_image_url_https} 
            alt={tweet.user.name} 
            className="w-8 h-8 rounded-full border border-white/10"
          />
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold text-white">{tweet.user.name}</span>
            <span className="text-[10px] text-gray-500">@{tweet.user.screen_name}</span>
          </div>
        </div>
        <span className="text-[11px] flex-end font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-md flex items-center gap-0.5">
          <CreditIcon/> +{reward}
        </span>
      </div>
      <p className="text-sm text-white leading-relaxed line-clamp-3">
        {tweet.text}
      </p>
    </div>
  );
}