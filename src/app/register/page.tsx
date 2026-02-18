"use client";
import { registerUser, sendOtpAction } from "../actions/register-action";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";

export default function Register() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // OTP Logic States
  const [step, setStep] = useState<"form" | "otp">("form");
  const [tempData, setTempData] = useState<FormData | null>(null);

  // STAGE 1: Send OTP
  async function handleInitialSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);

    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

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
  }

  // STAGE 2: Verify & Register
  async function handleVerifyAndRegister(otpFormData: FormData) {
    setIsLoading(true);
    setError(null);

    const otp = otpFormData.get("otp") as string;
    const finalData = new FormData();
    
    // Merge original fields with OTP
    tempData?.forEach((value, key) => finalData.append(key, value));
    finalData.append("otp", otp);

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 relative h-screen w-full bg-[#050505]">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#121212_1px,transparent_1px),linear-gradient(to_bottom,#121212_1px,transparent_1px)] bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      
      <div className="relative z-10 border border-[#1A241A] rounded-lg gap-2 p-4 flex flex-col items-center justify-center bg-[#101610]">
        <div className="w-[80px] h-[80px]">
          <img src="/lynks-logo1.png" alt="" className="rounded-full w-full h-full"/> 
        </div>

        <div className="text-center mb-3">
          <p className="font-bold text-xl">Boost your X Engagement</p>
          <p className="text-[#808080] font-semibold text-sm">The ultimate toolkit for creators</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="w-full mb-2 p-2 rounded bg-red-500/10 border border-red-500/50 flex items-center gap-2">
            <AlertCircle className="text-red-500" size={16} />
            <p className="text-xs text-red-200">{error}</p>
          </div>
        )}

        <form action={step === "form" ? handleInitialSubmit : handleVerifyAndRegister} className="shadow-sm flex flex-col gap-2 w-90">
          
          {step === "form" ? (
            <>
              <label className="text-sm text-[#808080]">Email Address:</label>
              <input name="email" placeholder="name@example.com" className="border border-[#353434] p-2 rounded bg-[#0c0c0c]" required />

              <label className="text-sm text-[#808080]">Password:</label>
              <input name="password" type="password" placeholder="Min. 8 characters" className="border border-[#353434] p-2 rounded bg-[#0c0c0c]" required />

              <label className="text-sm text-[#808080]">Confirm Password:</label>
              <input name="confirmPassword" type="password" placeholder="Password" className="border border-[#353434] p-2 rounded bg-[#0c0c0c]" required />
            </>
          ) : (
            <>
              <p className="text-center text-xs text-green-500 font-bold mb-1">OTP sent to your email!</p>
              <label className="text-sm text-[#808080]">Enter 6-digit Code:</label>
              <input name="otp" maxLength={6} placeholder="000000" className="border border-[#353434] p-2 rounded bg-[#0c0c0c] text-center tracking-[0.5em] text-lg" required />
              <button type="button" onClick={() => setStep("form")} className="text-[10px] text-gray-500 underline text-right">Change Email?</button>
            </>
          )}

          <button 
  type="submit" 
  disabled={isLoading}
  className="text-white cursor-pointer mt-4 bg-gradient-to-r from-[#07692d] to-[#00B33C] p-2 rounded-lg font-bold flex items-center justify-center gap-2 hover:brightness-110 hover:shadow-[0_0_20px_rgba(0,179,60,0.3)] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
>
  {isLoading ? (
      <span>Please wait...</span>
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
                className="text-green-500 font-bold cursor-pointer hover:text-green-400 transition underline-offset-4 hover:underline"
              >
                Login
              </button>
            </p>
          </div>

          <p className="text-center text-sm text-[#808080]">By signing up, you agree to our Terms of Service and Privacy Policy</p>
        </form>
      </div>
    </div>
  );
}