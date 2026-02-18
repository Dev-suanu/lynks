import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminDisputeCard from "@/components/AdminDisputeCard";

export default async function AdminPage() {
  const session = await auth();

  // SECURITY: Kick out anyone who isn't an Admin
  if ((session?.user as any).role !== "ADMIN") {
    redirect("/");
  }

  const disputes = await prisma.submission.findMany({
    where: { status: "DISPUTED" },
    include: {
      user: true,
      post: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Dispute Management Queue</h1>
      <div className="space-y-4">
        {disputes.length > 0 ? (
          disputes.map((sub) => (
            <AdminDisputeCard key={sub.id} submission={sub} />
          ))
        ) : (
          <p className="text-gray-500">No active disputes to resolve.</p>
        )}
      </div>
    </div>
  );
}