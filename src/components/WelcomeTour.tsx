"use client";

import { useEffect } from "react";
import { useUserTour } from "@/hooks/useUserTour";
import { useSession } from "next-auth/react";

export default function WelcomeTour() {
  const { data: session } = useSession();
  const { startTour } = useUserTour();

  useEffect(() => {
    // Only run if we have a logged-in user
    if (typeof window !== "undefined" && session?.user?.id) {
      
      // Create a unique key for THIS user (e.g., "hasSeenTour_user123")
      const userTourKey = `hasSeenTour_${session.user.id}`;
      const hasSeenTour = localStorage.getItem(userTourKey);

      if (!hasSeenTour) {
        const timer = setTimeout(() => {
          startTour();
          localStorage.setItem(userTourKey, "true");
        }, 1500);
        
        return () => clearTimeout(timer);
      }
    }
  }, [startTour, session?.user?.id]);

  return null; 
}