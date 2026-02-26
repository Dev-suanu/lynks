import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ActivityTabs from "@/components/ActivityTabs";
import { getTweet } from 'react-tweet/api';

export default async function ActivityPage() {
  const session = await auth();
  if (!session?.user) return <div className="p-10 text-center">Please sign in</div>;

  // 1. Tasks you completed (Submissions you SENT) - Keep all history here
  const rawSubmissions = await prisma.submission.findMany({
    where: { userId: session.user.id },
    include: { post: true },
    orderBy: { createdAt: "desc" },
  });

  const mySubmissions = await Promise.all(
    rawSubmissions.map(async (sub) => {
      const tweetId = sub.post.url.split('/').pop()?.split('?')[0] || "";
      let tweetData = null;
      try {
        tweetData = await getTweet(tweetId);
      } catch (e) {
        console.error("Tweet fetch error:", e);
      }
      return { ...sub, tweetData };
    })
  );

  // 2. Submissions you RECEIVED - FILTERED FOR PENDING ONLY
  const rawReceived = await prisma.submission.findMany({
    where: { 
      post: { authorId: session.user.id },
      status: "PENDING" // <--- CRITICAL: Only fetch pending proofs
    },
    include: { 
      post: true, 
      user: { select: { name: true } } 
    },
    orderBy: { createdAt: "desc" },
  });

  const receivedSubmissions = await Promise.all(
    rawReceived.map(async (sub) => {
      const tweetId = sub.post.url.split('/').pop()?.split('?')[0] || "";
      let tweetData = null;
      try {
        tweetData = await getTweet(tweetId);
      } catch (e) {
        console.error("Tweet fetch error:", e);
      }
      return { ...sub, tweetData };
    })
  );

  // 3. YOUR CREATED POSTS - COUNT FILTERED FOR PENDING
 // 3. YOUR CREATED POSTS - FETCHING BOTH PENDING AND TOTAL
const rawPosts = await prisma.post.findMany({
  where: { authorId: session.user.id },
  include: {
    _count: { 
      select: { 
        // Use a separate key for pending if your Prisma version supports it, 
        // OR simply fetch the total and handle the pending count via the receivedSubmissions prop.
        submissions: true 
      } 
    },
    // To get the specific Pending count directly from Prisma:
    submissions: {
      where: { status: "PENDING" },
      select: { id: true }
    }
  },
  orderBy: { createdAt: "desc" }
});

  const myCreatedPosts = await Promise.all(
    rawPosts.map(async (post) => {
      const tweetId = post.url.split('/').pop()?.split('?')[0] || "";
      let tweetData = null;
      try {
        tweetData = await getTweet(tweetId);
      } catch (e) {
        console.error("Tweet fetch error:", e);
      }
      return { ...post, tweetData };
    })
  );

  return (
    <div className="max-w-2xl mx-auto p-4 min-h-screen bg-[#0a0a0a] text-white">
      <h1 className="text-xl font-black mb-6 mt-13 uppercase tracking-tight">Activity</h1>
      
      <ActivityTabs 
        mySubmissions={mySubmissions} 
        receivedSubmissions={receivedSubmissions} 
        myCreatedPosts={myCreatedPosts} 
      />
    </div>
  );
}