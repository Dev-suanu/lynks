"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { updateUsername } from "../actions/user";
import { 
  User, 
  Mail, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  Twitter, 
  ShieldCheck 
} from "lucide-react";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSave = async () => {
    setIsUpdating(true);
    setMessage({ type: "", text: "" });

    try {
      const result = await updateUsername(name);
      if (result.success) {
        await update({ ...session, user: { ...session?.user, name } });
        setMessage({ type: "success", text: "Profile updated successfully!" });
      } else {
        setMessage({ type: "error", text: result.error || "Update failed" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 pb-20 mt-20">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-gray-400 mt-1">Manage your identity and task preferences.</p>
        </div>

        {/* Profile Card */}
        <div className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 space-y-6">
            
            {/* User Details (Read Only) */}
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
              <div className="h-14 w-14 bg-lime-500/20 rounded-full flex items-center justify-center border border-lime-500/30">
                <User className="text-lime-500" size={28} />
              </div>
              <div>
                <p className="text-sm text-gray-400 flex items-center gap-1">
                  <Mail size={12} /> {session?.user?.email}
                </p>
                <p className="text-lg font-semibold uppercase tracking-wider">
                  {session?.user?.name || "Anonymous User"}
                </p>
              </div>
            </div>

            {/* Username Update Field */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Twitter size={16} className="text-sky-400" />
                Linked X (Twitter) Username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">@</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="username"
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-8 pr-4 focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500 transition-all outline-none"
                />
              </div>
              <p className="text-[11px] text-gray-500">
                Ensure this matches your X handle exactly so your screenshots can be verified.
              </p>
            </div>

            {/* Feedback Message */}
            {message.text && (
              <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
                message.type === "success" ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
              }`}>
                {message.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {message.text}
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={isUpdating}
              className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Security / Logout Section */}
        <div className="bg-[#121212] border border-red-900/20 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold flex items-center gap-2">
                <ShieldCheck size={18} className="text-gray-400" />
                Session Security
              </h3>
              <p className="text-sm text-gray-500">Logout from your current browser session.</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-all font-medium text-sm"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}