"use client";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { LayoutList, Trophy, UserCircle, History, Loader2 } from 'lucide-react';
import AdminGuard from "@/components/AdminGuard";
import { usePathname } from "next/navigation";
import { getUnreadCount } from "../app/actions/notification";
import { getUserCredits } from "@/app/actions/user";
import Badge from "./Badge";
import { CreditIcon } from "./CreditIcon";

export default function Navbar() {
  // 1. ALL HOOKS MUST BE AT THE TOP
  const { data: session, update, status } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const [credits, setCredits] = useState<number | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const syncData = async () => {
      try {
        const [latestCredits, latestNotifications] = await Promise.all([
          getUserCredits(),
          getUnreadCount()
        ]);
        setCredits(latestCredits);
        setUnreadCount(latestNotifications);
      } catch (e) {
        console.error("Sync error:", e);
      }
    };

    syncData();
    const interval = setInterval(syncData, 20000);
    return () => clearInterval(interval);
  }, []);

  // 2. CONDITIONAL RETURNS AFTER HOOKS
  const hideNavbarRoutes = ["/login", "/register"];
  if (hideNavbarRoutes.includes(pathname)) return null;

  // 3. LOGIC & HELPERS
  const isActive = (path: string) => pathname === path;
  
  const linkStyles = (path: string) => `
    flex justify-start items-center gap-2 py-2 px-4 rounded-lg transition-all duration-200
    ${isActive(path) ? "bg-white/10" : "hover:bg-white/5"}
  `;

  const getIconProps = (path: string) => {
    const isActive = pathname === path;
    return {
      size: 23,
      color: isActive ? "#00B33C" : "grey", 
      className: "transition-all duration-200"
    };
  };

  const CreditBadge = () => (
    <div className="bg-white/10 flex gap-2 py-1 px-4 justify-center items-center rounded-full border border-white/5">
      {status === "loading" ? (
        <Loader2 size={14} className="animate-spin text-gray-400" />
      ) : (
        <>
          <CreditIcon className="w-3.5 h-3.5" />
          <span className="text-sm font-medium">
            {credits !== null ? `${credits} Credits` : "---"}
          </span>
        </>
      )}
    </div>
  );

  return (
    <>
      {/* 1. TOP NAV (Mobile) */}
      <nav className="sm:hidden fixed top-0 w-full h-14 border-b border-white/10 flex items-center bg-[#050505] justify-between px-4 z-50">
        <div className="w-10 h-10">
          <img src="/lynks-logo2.png" alt="Logo" className="w-full h-full object-contain"/>
        </div>

        {session ? (
            <div className="flex items-center gap-3">
              <CreditBadge />
              <AdminGuard>
                 <Link href="/admin/disputes" className="text-[10px] text-purple-400 border border-purple-400/30 px-2 py-1 rounded-md">🛡️</Link>
              </AdminGuard>
            </div>
        ) : (
          <Link href="/login" className="text-sm font-medium text-blue-600">Login</Link>
        )}
      </nav>

      {/* 2. TOP NAV (Desktop) */}
      <nav className="hidden sm:flex fixed top-0 left-0 right-0 h-14 border-b border-white/10 bg-[#050505] items-center justify-between px-8 z-40">
        <div className="w-10 h-10">
          <img src="/lynks-logo2.png" alt="Logo" className="w-full h-full object-contain"/>
        </div>
        
        {session ? (
          <div className="flex items-center gap-4">
              <CreditBadge />
              <Link href="/create" className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold py-1.5 px-4 rounded-lg transition">
                Post Task
              </Link>
              <AdminGuard>
               <Link href="/admin/disputes" className="text-purple-400 text-xs font-bold border border-purple-400/30 px-3 py-1.5 rounded-lg hover:bg-purple-400/10 transition">
                 🛡️ Admin
               </Link>
             </AdminGuard>
          </div>
        ) : (
          <Link href="/login" className="text-sm font-medium text-blue-600">Login</Link>
        )}
      </nav>

      {/* 3. SIDE NAV (Tablet/Desktop) */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-20 lg:w-64 flex-col p-6 z-0 mt-20">
        <div className="flex flex-col gap-2">
          <Link href="/feed" className={linkStyles("/feed")}>
            <LayoutList 
              size={18} 
              color={isActive("/feed") ? "white" : "gray"} 
              fill={isActive("/feed") ? "white" : "none"}
            />
            <p className={`text-sm ${isActive("/feed") ? "text-white font-medium" : "text-white/50"}`}>
              Feed
            </p>
          </Link>

          <Link href="/leaderboard" className={linkStyles("/leaderboard")}>
            <Trophy 
              size={18} 
              color={isActive("/leaderboard") ? "white" : "gray"} 
            />
            <p className={`text-sm ${isActive("/leaderboard") ? "text-white font-medium" : "text-white/50"}`}>
              Leaderboard
            </p>
          </Link>

          <Link href="/activity" id="desktop-nav-activity" className={linkStyles("/activity")}>
            <Badge count={unreadCount}>
              <History 
                size={18} 
                color={isActive("/activity") ? "white" : "gray"} 
              />
            </Badge>
            <p className={`text-sm ${isActive("/activity") ? "text-white font-medium" : "text-white/50"}`}>
              Activity
            </p>
          </Link>

          <Link href="/profile" className={linkStyles("/profile")}>
            <UserCircle 
              size={18} 
              color={isActive("/profile") ? "white" : "gray"} 
            />
            <p className={`text-sm ${isActive("/profile") ? "text-white font-medium" : "text-white/50"}`}>
              Profile
            </p>
          </Link>
        </div>
      </aside>

      {/* 4. BOTTOM NAV (Mobile) */}
      <nav className="lg:hidden p-2 fixed bottom-0 w-full h-16 border-t mt-10 border-white/10 bg-[#050505] flex items-center justify-between pb-2 z-50 px-5">
        <Link href="/feed" className="flex flex-col justify-center items-center gap-1">
          <LayoutList {...getIconProps("/feed")} />
        </Link>

        <Link href="/leaderboard" className="flex flex-col justify-center items-center gap-1">
          <Trophy {...getIconProps("/leaderboard")} />
        </Link> 

        <Link href="/create" className="bg-linear-30 from-[#07692d] to-[#00B33C] w-12 h-12 rounded-full flex items-center justify-center">
          <p className="font-bold text-2xl">+</p>
        </Link>

        <Link href="/activity" id="mobile-nav-activity" className="flex flex-col justify-center items-center gap-1">
          <Badge count={unreadCount}>
            <History {...getIconProps("/activity")} />
          </Badge>
        </Link>

        <Link href='/profile' className="flex flex-col justify-center items-center gap-1">
          <UserCircle {...getIconProps("/profile")} />
        </Link>
      </nav>
    </>
  );
}