"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function resolveDisputeAction(
  submissionId: string, 
  decision: "APPROVED" | "REJECTED"
) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") throw new Error("Unauthorized");

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { post: true, user: true }
  });

  if (!submission) throw new Error("Submission not found");

  if (decision === "APPROVED") {
    // 1. Give credits to the worker
    await prisma.user.update({
      where: { id: submission.userId },
      data: { credits: { increment: submission.post.reward } }
    });

    // 2. Mark submission as Verified
    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: "VERIFIED", isDisputed: false }
    });
  } else {
    // 3. Keep it rejected but clear the dispute flag
    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: "REJECTED", isDisputed: false }
    });
  }

  revalidatePath("/admin/disputes");
}