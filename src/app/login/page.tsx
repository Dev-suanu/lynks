"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false, // We handle redirect manually to catch errors
    });

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/feed"); // Send user to home/feed
      router.refresh(); // Ensure session state updates
    }
  };

  return (
     <div className="flex flex-col items-center justify-center min-h-screen p-8 relative h-screen w-full bg-[#050505]">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#121212_1px,transparent_1px),linear-gradient(to_bottom,#121212_1px,transparent_1px)] bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]">
  </div>
      <div className="relative z-10 border border-[#1A241A] rounded-lg gap-2 p-4 flex flex-col items-center justify-center bg-[#101610]">
        <div className="w-[80px] h-[80px]">
          <img src="/lynks-logo1.png" alt="" className="rounded-full w-full h-full"/> 
        </div>

        <div className="text-center mb-3">
          <p className="font-bold text-2xl">Welcome back</p>
          <p className="text-[#808080] font-semibold text-sm">Enter your details to access your account</p>
        </div>

        <form onSubmit={handleSubmit} className="shadow-sm flex flex-col gap-2 w-90">
          <label className="text-sm text-[#808080]">Email Address:</label>
          <input name="email" placeholder="name@example.com" className="border border-[#353434] p-2 rounded bg-[#0c0c0c]" required />

          <label className="text-sm text-[#808080]">Password:</label>
          <input name="password" type="password" placeholder="Your password" className="border border-[#353434] p-2 rounded bg-[#0c0c0c]" required />

          <button type="submit" className="text-white cursor-pointer mt-4 bg-gradient-to-r from-[#07692d] to-[#00B33C] p-2 rounded-lg font-bold flex items-center justify-center gap-2 hover:brightness-110 hover:shadow-[0_0_20px_rgba(0,179,60,0.3)] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed">Login</button>

            {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
            <div className="text-center mt-4">
              <p className="text-sm text-[#808080]">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/register")}
                  className="text-green-500 font-bold cursor-pointer hover:text-green-400 transition underline-offset-4 hover:underline"
                >
                  Register
                </button>
              </p>
            </div>
        <p className="text-center text-sm text-[#808080]">By signing up, you agree to our Terms of Service and Privacy Policy</p>

        </form>


      </div>      
    </div>
  );
}