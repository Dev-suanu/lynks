"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

// 1. Submit Proof Action
export async function submitProofAction(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be logged in to earn." };

  const postId = formData.get("postId") as string;
  const proofUrl = formData.get("proofUrl") as string; 

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        _count: {
          select: { submissions: true }
        }
      }
    }) as any;

    if (!post) return { error: "Post not found." };

    const maxAllowed = post.maxSubmissions || 50; 
    if (post._count.submissions >= maxAllowed) {
      return { error: "This task has reached its maximum number of submissions." };
    }

    const existing = await prisma.submission.findFirst({
      where: { 
        userId: session.user.id,
        postId: postId 
      }
    });

    if (existing) return { error: "You've already submitted proof for this link." };

    await prisma.submission.create({
      data: {
        proofUrl,
        userId: session.user.id,
        postId: postId,
        status: "PENDING"
      }
    });

    revalidatePath("/");
    revalidatePath("/activity");
    return { success: true };
  } catch (e) {
    console.error("Submission error:", e);
    return { error: "Failed to submit. Please try again." };
  }
}

// 2. Update Status (Approve/Reject)
export async function updateSubmissionStatusAction(
  submissionId: string,
  newStatus: "APPROVED" | "REJECTED",
  reason?: string 
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { post: true }
  });

  if (!submission || submission.post.authorId !== session.user.id) {
    throw new Error("You do not have permission to review this submission");
  }

  if (submission.status !== "PENDING") return;

  try {
    if (newStatus === "APPROVED") {
      // 1. Execute DB Transaction (Pay user + update status)
      await prisma.$transaction([
        prisma.submission.update({
          where: { id: submissionId },
          data: { status: "APPROVED", rejectionReason: null }
        }),
        prisma.user.update({
          where: { id: submission.userId },
          data: { credits: { increment: submission.post.reward } }
        })
      ]);

      // 2. CLEANUP: Delete screenshot from UploadThing storage
      // Extracts the key from the end of the URL (e.g., utfs.io/f/FILE_KEY)
      const fileKey = submission.proofUrl.split("/").pop();
      if (fileKey) {
        try {
          await utapi.deleteFiles(fileKey);
          // Optional: update the URL string in DB to show it was cleared
          await prisma.submission.update({
            where: { id: submissionId },
            data: { proofUrl: "CLEARED_ON_APPROVAL" }
          });
        } catch (err) {
          console.error("UT Cleanup failed (non-critical):", err);
        }
      }
    } else {
      // 3. REJECTED: Update status only, KEEP the screenshot for disputes
      await prisma.submission.update({
        where: { id: submissionId },
        data: { 
          status: "REJECTED", 
          rejectionReason: reason || "No reason provided." 
        }
      });
    }

    revalidatePath(`/task/${submission.postId}`); 
    revalidatePath("/activity");
    revalidatePath("/"); 
    
    return { success: true };
  } catch (error) {
    console.error("Status update error:", error);
    throw new Error("Failed to process status update.");
  }
}

// 3. Dispute Action
export async function disputeSubmissionAction(submissionId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId }
  });

  if (!submission || submission.userId !== session.user.id) {
    throw new Error("You can only dispute your own submissions.");
  }

  if (submission.status !== "REJECTED") {
    throw new Error("You can only dispute rejected tasks.");
  }

  await prisma.submission.update({
    where: { id: submissionId },
    data: { 
      status: "DISPUTED",
      isDisputed: true 
    }
  });

  revalidatePath("/activity");
}