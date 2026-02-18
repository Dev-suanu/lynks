import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // Security: Check for a Cron Secret so random people can't trigger this
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const twelveHoursAgo = new Date(Date.now() - 1 * 60 * 60 * 1000);

    // 1. Find all expired pending submissions
    const expiredSubmissions = await prisma.submission.findMany({
      where: {
        status: "PENDING",
        createdAt: { lt: twelveHoursAgo },
      },
      include: { post: true },
    });

    if (expiredSubmissions.length === 0) {
      return NextResponse.json({ message: "No submissions to approve." });
    }

    // 2. Process them in a loop (or transaction)
    const updates = expiredSubmissions.map((sub) => {
      return prisma.$transaction([
        prisma.submission.update({
          where: { id: sub.id },
          data: { status: "APPROVED" },
        }),
        prisma.user.update({
          where: { id: sub.userId },
          data: { credits: { increment: sub.post.reward } },
        }),
      ]);
    });

    await Promise.all(updates);

    return NextResponse.json({ 
      success: true, 
      approvedCount: expiredSubmissions.length 
    });
  } catch (error) {
    console.error("CRON_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}