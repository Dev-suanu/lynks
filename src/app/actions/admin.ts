// "use server";
// import { prisma } from "@/lib/prisma";
// import { auth } from "@/auth";

// export async function getAdminStats() {
//   const session = await auth();
//   // Ensure only you (the admin) can access this
//   if (session?.user?.email !== "your-admin-email@gmail.com") {
//     throw new Error("Unauthorized");
//   }

//   const [totalUsers, totalSubmissions, pendingSubmissions, totalPosts] = await Promise.all([
//     prisma.user.count(),
//     prisma.submission.count(),
//     prisma.submission.count({ where: { status: "PENDING" } }),
//     prisma.post.count(),
//   ]);

//   // Get user growth for the last 7 days
//   const sevenDaysAgo = new Date();
//   sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

//   const newUsersLastWeek = await prisma.user.count({
//     where: { createdAt: { gte: sevenDaysAgo } }
//   });

//   return {
//     totalUsers,
//     totalSubmissions,
//     pendingSubmissions,
//     totalPosts,
//     newUsersLastWeek,
//   };
// }