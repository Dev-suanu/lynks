"use client";

import { registerUser, sendOtpAction } from "../actions/register-action";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { Loader2, AlertCircle } from "lucide-react";

export default function Register() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [step, setStep] = useState<"form" | "otp">("form");
  const [tempData, setTempData] = useState<FormData | null>(null);

  // Unified submit handler
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); // Stop page reload
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    if (step === "form") {
      // STAGE 1: Send OTP
      const password = formData.get("password") as string;
      const confirmPassword = formData.get("confirmPassword") as string;

      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setIsLoading(false);
        return;
      }

      try {
        const result = await sendOtpAction(formData.get("email") as string);
        if (result.success) {
          setTempData(formData);
          setStep("otp");
        } else {
          setError(result.error ?? "Failed to send OTP");
        }
      } catch (err) {
        setError("An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    } else {
      // STAGE 2: Verify & Register
      const otp = formData.get("otp") as string;
      const finalData = new FormData();
      
      // Merge original fields with OTP
      tempData?.forEach((value, key) => finalData.append(key, value));
      finalData.set("otp", otp);

      try {
        const result = await registerUser(finalData);
        if (result.success) {
          router.push("/login");
        } else {
          setError(result.error ?? "Invalid or expired OTP");
        }
      } catch (err) {
        setError("Registration failed.");
      } finally {
        setIsLoading(false);
      }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 relative h-screen w-full bg-[#050505]">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#121212_1px,transparent_1px),linear-gradient(to_bottom,#121212_1px,transparent_1px)] bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      
      <div className="relative z-10 border border-[#1A241A] rounded-lg gap-2 p-4 flex flex-col items-center justify-center bg-[#101610]">
        <div className="w-[80px] h-[80px]">
          <img src="/lynks-logo1.png" alt="Logo" className="rounded-full w-full h-full"/> 
        </div>

        <div className="text-center mb-3">
          <p className="font-bold text-xl">Boost your X Engagement</p>
          <p className="text-[#808080] font-semibold text-sm">The ultimate toolkit for creators</p>
        </div>

        {error && (
          <div className="w-full mb-2 p-2 rounded bg-red-500/10 border border-red-500/50 flex items-center gap-2">
            <AlertCircle className="text-red-500 shrink-0" size={16} />
            <p className="text-xs text-red-200">{error}</p>
          </div>
        )}

        {/* Change 'action' to 'onSubmit' */}
        <form onSubmit={handleSubmit} className="shadow-sm flex flex-col gap-2 w-90">
          
          {step === "form" ? (
            <>
              <label className="text-sm text-[#808080]">Email Address:</label>
              <input 
                name="email" 
                type="email"
                placeholder="name@example.com" 
                className="border border-[#353434] p-2 rounded bg-[#0c0c0c] text-white disabled:opacity-50" 
                required 
                disabled={isLoading}
              />

              <label className="text-sm text-[#808080]">Password:</label>
              <input 
                name="password" 
                type="password" 
                placeholder="Min. 8 characters" 
                className="border border-[#353434] p-2 rounded bg-[#0c0c0c] text-white disabled:opacity-50" 
                required 
                disabled={isLoading}
              />

              <label className="text-sm text-[#808080]">Confirm Password:</label>
              <input 
                name="confirmPassword" 
                type="password" 
                placeholder="Password" 
                className="border border-[#353434] p-2 rounded bg-[#0c0c0c] text-white disabled:opacity-50" 
                required 
                disabled={isLoading}
              />
            </>
          ) : (
            <>
              <p className="text-center text-xs text-green-500 font-bold mb-1">OTP sent to your email!</p>
              <label className="text-sm text-[#808080]">Enter 6-digit Code:</label>
              <input 
                name="otp" 
                maxLength={6} 
                placeholder="000000" 
                className="border text-white border-[#353434] p-2 rounded bg-[#0c0c0c] text-center tracking-[0.5em] text-lg disabled:opacity-50" 
                required 
                disabled={isLoading}
              />
              <button 
                type="button" 
                onClick={() => setStep("form")} 
                className="text-[10px] text-gray-500 underline text-right"
              >
                Change Email?
              </button>
            </>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="text-white cursor-pointer mt-4 bg-gradient-to-r from-[#07692d] to-[#00B33C] p-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Processing...</span>
              </>
            ) : (
              <span>{step === "form" ? "Send Verification Code" : "Create Account"}</span>
            )}
          </button>

          <div className="text-center mt-4">
            <p className="text-sm text-[#808080]">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="text-green-500 font-bold cursor-pointer transition underline-offset-4 hover:underline"
              >
                Login
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}