import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getTweet } from 'react-tweet/api';
import CustomTweet from "@/components/CustomTweet";
import SubmissionModal from "@/components/SubmissionModal";
import Link from "next/link";
import { CreditIcon } from "@/components/CreditIcon";

export default async function LinkFeed() {
  const session = await auth();
  const isLoggedIn = !!session;
  const userId = session?.user?.id;

  const rawPosts = await prisma.post.findMany({
    take: 20,
    where: {
      AND: [
        {
          NOT: { authorId: userId || "" }
        },
        {
          submissions: {
            none: {
              userId: userId || "anonymous" 
            }
          }
        }
      ]
    },
    include: {
      author: { select: { name: true } },
      _count: { select: { submissions: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  // PRE-FETCH DATA: This ensures the 'tweet' prop is available
  const posts = await Promise.all(
    rawPosts.map(async (post) => {
      const tweetId = post.url.split('/').pop()?.split('?')[0] || "";
      let tweetData = null;
      try {
        tweetData = await getTweet(tweetId);
      } catch (e) {
        console.error(e);
      }
      return { ...post, tweetData };
    })
  );

  return (
    <div className="max-w-3xl mt-13 mb-15 mx-auto">
      <div className="p-4 flex flex-col gap-2">
        <div className="flex gap-6 border-b border-white/10 p-1 mb-4">
          <div className="relative pb-2">
            <p className="font-bold text-white" id="feed-tab-all">All Tasks</p>
            <span className="absolute bottom-[-4px] left-0 h-[2px] w-full bg-gradient-to-r from-[#07692d] to-[#00B33C]" />
          </div>
          <div className="pb-2">
            <p className="text-white/50 hover:text-white transition cursor-pointer">High Credits</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto grid gap-4 w-full">
          {posts.length === 0 ? (
            <div className="text-center py-20 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl">
              <div className="mb-4 flex justify-center">
                <div className="p-3 bg-lime-500/10 rounded-full">
                  <CreditIcon className="w-6 h-6" />
                </div>
              </div>
              <p className="text-white font-medium">All caught up!</p>
              <p className="text-xs text-gray-500 mt-1">Check back later for new earning opportunities.</p>
            </div>
          ) : (
            posts.map((post) => {
              const hasSubmitted = false; 

              return (
                <div key={post.id} className="bg-white/10 border border-white/10 overflow-hidden shadow-lg rounded-md">
                  <div className="p-2">
                    <div className="rounded-sm overflow-hidden mb-4 max-h-[200px] relative tweet-hide-media">
                      {/* FIX: Passing the tweet object directly */}
                      <CustomTweet tweet={post.tweetData} reward={post.reward}/>  
                    </div>

                    <div className="pt-3 border-t border-white/10 flex justify-between items-center px-1 pb-1">
                      <Link 
                        href={isLoggedIn ? post.url : "/login"} 
                        target={isLoggedIn ? "_blank" : "_self"}
                        className="engage-button text-sm px-4 py-1.5 bg-gradient-to-r from-[#07692d] to-[#00B33C] rounded-md font-bold text-white hover:opacity-90 transition"
                      >
                        Engage
                      </Link>

                      {isLoggedIn ? (
                        <SubmissionModal 
                          postId={post.id} 
                          hasSubmitted={hasSubmitted} 
                          reward={post.reward} 
                          classname="verify-button"
                        />
                      ) : (
                        <Link 
                          href="/login"
                          className="text-sm px-4 py-1.5 bg-white/10 rounded-md text-white font-bold hover:bg-white/20 transition"
                        >
                          Verify Task
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}