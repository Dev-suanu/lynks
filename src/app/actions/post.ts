"use server"

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { getTweet } from 'react-tweet/api';
import { redirect } from "next/navigation";

/**
 * Fetches posts with a shuffle logic to ensure fairness.
 * noStore() ensures the shuffle runs fresh on every request.
 */
export async function fetchFeedPosts(skip: number = 0, take: number = 6) {
  noStore(); // Forces dynamic rendering & bypasses Next.js Data Cache
  
  const session = await auth();
  const userId = session?.user?.id;

  const rawPosts = await prisma.post.findMany({
    skip,
    take,
    where: {
      AND: [
        { NOT: { authorId: userId || "" } },
        { submissions: { none: { userId: userId || "anonymous" } } }
      ]
    },
    include: {
      author: { select: { name: true } },
      _count: { select: { submissions: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Fisher-Yates Shuffle Algorithm to randomize the current batch
  const shuffledPosts = [...rawPosts];
  for (let i = shuffledPosts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledPosts[i], shuffledPosts[j]] = [shuffledPosts[j], shuffledPosts[i]];
  }

  const posts = await Promise.all(
    shuffledPosts.map(async (post) => {
      const tweetId = post.url.split('/').pop()?.split('?')[0] || "";
      let tweetData = null;
      try {
        tweetData = await getTweet(tweetId);
      } catch (e) {}
      return { ...post, tweetData };
    })
  );

  return posts;
}

export async function createPublicLynk(prevState: any, formData: FormData) {
  let success = false;
  const session = await auth();
  
  if (!session?.user?.id) return { error: "You must be logged in" };
  
  const isAdmin = (session.user as any).role === "ADMIN";

  const POSTING_COST = 25; 
  const STANDARD_REWARD = 5;

  const url = formData.get("url") as string;
  const reward = isAdmin 
    ? parseInt(formData.get("reward") as string) || STANDARD_REWARD 
    : STANDARD_REWARD;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user?.name) {
    return { error: "Please set up your username in the profile tab" }; 
  }

  if (!isAdmin) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const postCountToday = await prisma.post.count({
      where: {
        authorId: user.id,
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
    });

    if (postCountToday >= 5) {
      return { error: "Daily limit reached! (5 tasks per day max)" };
    }
  }

  if (!user || user.credits < POSTING_COST) {
    return { error: `Insufficient credits! It costs ${POSTING_COST} credits to create a task.` };
  }

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { credits: { decrement: POSTING_COST } }
      }),
      prisma.post.create({
        data: {
          url,
          reward: reward, 
          authorId: user.id
        }
      })
    ]);

    revalidatePath("/feed");
    revalidatePath("/");
    success = true;

  } catch (e) {
    console.error("Database Error:", e);
    return { error: "Failed to create task in database." };
  }

  if (success) {
    redirect("/feed");
  }
}

export async function deletePostAction(postId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { 
        submissions: { 
          where: { status: "PENDING" } 
        } 
      }
    });

    if (!post) throw new Error("Post not found");
    if (post.authorId !== session.user.id) {
      throw new Error("Unauthorized");
    }

    await prisma.$transaction(async (tx) => {
      const pendingSubmissions = post.submissions;

      for (const sub of pendingSubmissions) {
        await tx.user.update({
          where: { id: sub.userId },
          data: { credits: { increment: post.reward } }
        });

        await tx.submission.update({
          where: { id: sub.id },
          data: { status: "APPROVED" }
        });
      }

      await tx.post.delete({
        where: { id: postId }
      });
    });

    revalidatePath("/activity");
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    console.error("Delete & Auto-Approve Error:", e);
    throw new Error("Failed to process deletion.");
  }
}