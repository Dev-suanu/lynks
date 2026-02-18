import { auth } from "@/auth";
import { fetchFeedPosts } from "@/app/actions/post";
import InfiniteFeed from "@/components/InfiniteFeed";
import Navbar from "@/components/Navbar";
import { redirect } from "next/navigation";

export default async function FeedPage() {
  const session = await auth();
  if (!session) redirect("/login");

  // Fetch initial posts (including tweet data)
  const initialPosts = await fetchFeedPosts(0, 6);

  return (
    <main className="min-h-screen bg-[#050505]">
      <Navbar />
      <div className="max-w-3xl mt-13 mb-15 mx-auto">
        <div className="p-4 flex flex-col gap-2">
          {/* Your Tab Headers */}
          <div className="flex gap-6 border-b border-white/10 p-1 mb-4">
            <div className="relative pb-2">
              <p className="font-bold text-white">All Tasks</p>
              <span className="absolute bottom-[-4px] left-0 h-[2px] w-full bg-gradient-to-r from-[#07692d] to-[#00B33C]" />
            </div>
            <div className="pb-2">
              <p className="text-white/50 hover:text-white transition cursor-pointer">High Credits</p>
            </div>
          </div>

          <InfiniteFeed initialPosts={initialPosts} userId={session.user.id} />
        </div>
      </div>
    </main>
  );
}