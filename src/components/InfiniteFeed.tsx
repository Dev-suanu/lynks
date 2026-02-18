"use client";

import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { fetchFeedPosts } from "@/app/actions/post";
import { Loader2 } from "lucide-react";
import CustomTweet from "@/components/CustomTweet";
import SubmissionModal from "@/components/SubmissionModal";
import Link from "next/link";

export default function InfiniteFeed({ initialPosts, userId }: { initialPosts: any[], userId: string }) {
  const [posts, setPosts] = useState(initialPosts);
  const [skip, setSkip] = useState(initialPosts.length);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

    const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px', // Loads when user is 100px from the bottom
    triggerOnce: false,  // We want it to trigger every time we hit the bottom
    });
    
  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      loadMorePosts();
    }
  }, [inView, hasMore, isLoading]);

  const loadMorePosts = async () => {
    setIsLoading(true);
    const take = 6;
    const newPosts = await fetchFeedPosts(skip, take);

    if (newPosts.length < take) setHasMore(false);
    if (newPosts.length > 0) {
      setPosts((prev) => [...prev, ...newPosts]);
      setSkip((prev) => prev + newPosts.length);
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto grid gap-4 w-full">
      {posts.map((post) => (
        <div key={post.id} className="bg-white/10 border border-white/10 overflow-hidden shadow-lg rounded-xl">
          <div className="p-2">
            <div className="rounded-xl overflow-hidden mb-4 max-h-[200px] relative tweet-hide-media">
              <CustomTweet tweet={post.tweetData} reward={post.reward}/>  
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-between items-center px-1 pb-1">
              <Link 
                href={post.url} 
                target="_blank"
                className="text-sm px-4 py-1.5 bg-gradient-to-r from-[#07692d] to-[#00B33C] rounded-md font-bold text-white hover:opacity-90 transition"
              >
                Engage
              </Link>

              <SubmissionModal 
                postId={post.id} 
                hasSubmitted={false} 
                reward={post.reward} 
              />
            </div>
          </div>
        </div>
      ))}

      {/* Sentinel */}
      <div ref={ref} className="py-10 flex justify-center">
        {hasMore ? (
          <Loader2 className="animate-spin text-green-500 opacity-50" size={32} />
        ) : (
          <p className="text-gray-600 text-xs uppercase font-bold">No more tasks available</p>
        )}
      </div>
    </div>
  );
}