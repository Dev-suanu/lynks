import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  // Security: Check Vercel Cron Secret to prevent unauthorized calls
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

    // Find and Update all pending submissions older than 12h
    const result = await prisma.submission.updateMany({
      where: {
        status: "PENDING",
        createdAt: {
          lte: twelveHoursAgo,
        },
      },
      data: {
        status: "APPROVED",
      },
    });

    return NextResponse.json({ 
      success: true, 
      count: result.count,
      message: `Auto-approved ${result.count} submissions.` 
    });
  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}