"use server"
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";


// export async function markNotificationsAsReadAction(type?: "NEW_SUBMISSION" | "STATUS_UPDATE") {
//   const session = await auth();
//   if (!session?.user?.id) return;

//   await prisma.notification.updateMany({
//     where: {
//       userId: session.user.id,
//       read: false,
//       // If type is provided, clear only that tab. If not, clear all.
//       ...(type ? { type } : {})
//     },
//     data: { read: true }
//   });

//   revalidatePath("/activity");
// }

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

export async function getActivityCounts() {
  const session = await auth();
  if (!session) return { received: 0, sent: 0 };

  const [received, sent] = await Promise.all([
    prisma.notification.count({ 
      where: { userId: session.user.id, read: false, type: "NEW_SUBMISSION" } 
    }),
    prisma.notification.count({ 
      where: { userId: session.user.id, read: false, type: "STATUS_UPDATE" } 
    })
  ]);

  return { received, sent };
}