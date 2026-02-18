"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Updates the user's X (Twitter) username
 */
export async function updateUsername(newName: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "You must be logged in to update your username." };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: newName.trim() },
    });

    revalidatePath("/profile");
    revalidatePath("/feed");
    revalidatePath("/"); // Update Navbar globally

    return { success: true };
  } catch (error) {
    console.error("Action Error:", error);
    return { error: "This username might already be taken." };
  }
}

/**
 * Fetches the most up-to-date credit balance directly from the DB
 */
export async function getUserCredits() {
  const session = await auth();
  if (!session?.user?.id) return 0;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true }
    });
    return user?.credits ?? 0;
  } catch (error) {
    console.error("Fetch Credits Error:", error);
    return 0;
  }
}

/**
 * Fetches unread notification count (Pending submissions on user's tasks)
 */
export async function getUnreadCount() {
  const session = await auth();
  if (!session?.user?.id) return 0;

  try {
    const count = await prisma.submission.count({
      where: {
        post: { authorId: session.user.id },
        status: "PENDING", 
      }
    });
    return count;
  } catch (error) {
    console.error("Fetch Notifications Error:", error);
    return 0;
  }
}