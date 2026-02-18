"use server"
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getUnreadCount() {
  const session = await auth();
  if (!session?.user?.id) return 0;

  // Count submissions on the user's posts that are 'PENDING' 
  // or created after the user last viewed the activity page
  const count = await prisma.submission.count({
    where: {
      post: { authorId: session.user.id },
      status: "PENDING", // Assuming new submissions start as pending
    }
  });

  return count;
}