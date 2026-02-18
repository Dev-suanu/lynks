"use client";

import { useSession } from "next-auth/react";
import { ReactNode } from "react";

interface AdminGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function AdminGuard({ children, fallback = null }: AdminGuardProps) {
  const { data: session, status } = useSession();

  // While loading, show nothing (or a spinner)
  if (status === "loading") return null;

  // Check if the user is an admin
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  if (!isAdmin) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}