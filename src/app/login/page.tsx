"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, // We handle redirect manually to catch errors
      });

      if (result?.error) {
        setError("Invalid email or password");
        setIsLoading(false); // Only stop loading if there's an error
      } else {
        router.push("/feed"); // Send user to home/feed
        router.refresh(); // Ensure session state updates
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 relative h-screen w-full bg-[#050505]">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#121212_1px,transparent_1px),linear-gradient(to_bottom,#121212_1px,transparent_1px)] bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      
      <div className="relative z-10 border border-[#1A241A] rounded-lg gap-2 p-4 flex flex-col items-center justify-center bg-[#101610]">
        <div className="w-[80px] h-[80px]">
          <img src="/lynks-logo1.png" alt="Logo" className="rounded-full w-full h-full"/> 
        </div>

        <div className="text-center mb-3">
          <p className="font-bold text-2xl text-white">Welcome back</p>
          <p className="text-[#808080] font-semibold text-sm">Enter your details to access your account</p>
        </div>

        {/* Improved Error Alert */}
        {error && (
          <div className="w-full mb-2 p-2 rounded bg-red-500/10 border border-red-500/50 flex items-center gap-2 animate-in fade-in zoom-in duration-200">
            <AlertCircle className="text-red-500 shrink-0" size={16} />
            <p className="text-xs text-red-200">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="shadow-sm flex flex-col gap-2 w-90">
          <label className="text-sm text-[#808080]">Email Address:</label>
          <input 
            name="email" 
            type="email"
            placeholder="name@example.com" 
            className="border border-[#353434] p-2 rounded bg-[#0c0c0c] text-white disabled:opacity-50 transition-opacity" 
            required 
            disabled={isLoading}
          />

          <label className="text-sm text-[#808080]">Password:</label>
          <input 
            name="password" 
            type="password" 
            placeholder="Your password" 
            className="border border-[#353434] p-2 rounded bg-[#0c0c0c] text-white disabled:opacity-50 transition-opacity" 
            required 
            disabled={isLoading}
          />

          <button 
            type="submit" 
            disabled={isLoading}
            className="text-white cursor-pointer mt-4 bg-gradient-to-r from-[#07692d] to-[#00B33C] p-2 rounded-lg font-bold flex items-center justify-center gap-2 hover:brightness-110 hover:shadow-[0_0_20px_rgba(0,179,60,0.3)] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Logging in...</span>
              </>
            ) : (
              "Login"
            )}
          </button>

          <div className="text-center mt-4">
            <p className="text-sm text-[#808080]">
              Don't have an account?{" "}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => router.push("/register")}
                className="text-green-500 font-bold cursor-pointer hover:text-green-400 transition underline-offset-4 hover:underline disabled:opacity-50"
              >
                Register
              </button>
            </p>
          </div>
          <p className="text-center text-[10px] text-[#808080] mt-2">
            By signing up, you agree to our <br/>
            <span className="underline">Terms of Service</span> and <span className="underline">Privacy Policy</span>
          </p>
        </form>
      </div>      
    </div>
  );
}