"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { setCookie } from "nookies";
import { parseCookies, destroyCookie } from "nookies";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isNewPasswordRequired, setIsNewPasswordRequired] = useState(false);
  const [session, setSession] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [forgotStep, setForgotStep] = useState<"none" | "email" | "code">("none");
  const [resetCode, setResetCode] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const token = document.cookie.includes("accessToken");
    if (token) router.push("/");
  }, [router]);

  useEffect(() => {
  const cookies = parseCookies();
  if (!cookies.accessToken) return;

  let logoutTimer: NodeJS.Timeout;

  const resetTimer = () => {
    if (logoutTimer) clearTimeout(logoutTimer);
    logoutTimer = setTimeout(() => {
      destroyCookie(null, "accessToken");
      router.push("/login");
    }, 60 * 60 * 1000); // 60 minutes
  };

  // List of activity events
  const activityEvents = ["mousemove", "mousedown", "click", "scroll", "keydown", "touchstart"];

  activityEvents.forEach((event) => window.addEventListener(event, resetTimer));
  resetTimer(); // Start timer on load

  return () => {
    if (logoutTimer) clearTimeout(logoutTimer);
    activityEvents.forEach((event) => window.removeEventListener(event, resetTimer));
  };
}, [router]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.challenge === "NEW_PASSWORD_REQUIRED") {
        setIsNewPasswordRequired(true);
        setSession(data.session ?? null);
      } else if (data.AccessToken) {
        setCookie(null, "accessToken", data.AccessToken, {
          path: "/",
          secure: true,
          sameSite: "strict",
          maxAge: 60 * 60, // 60 minutes in seconds
        });


        router.push("/");
        router.refresh();
      }
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Unknown error");
    }
  };

  const checkUserExists = async (username: string) => {
    const res = await fetch("/api/auth/check-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
  
    const data = await res.json();
    return res.ok && data.exists;
  };

  const handleNewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    
    try {
      const res = await fetch("/api/auth/new-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, newPassword, session }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCookie(null, "accessToken", data.AccessToken, {
        path: "/",
        secure: true,
        sameSite: "strict",
      });
      router.push("/");
      router.refresh();
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Unknown error");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const exists = await checkUserExists(username);
  if (!exists) {
    setError("User not found. Please sign up or check your email.");
  }
  if (exists){
    setSuccessMessage("A verification code has been sent to your email.");
  }
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccessMessage("A verification code has been sent to your email.");
      setError("");
      setForgotStep("code");
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Unknown error");
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const exists = await checkUserExists(username);
  if (!exists) {
    setError("User not found. Please sign up or check your email.");
    return;
  }
    try {
      const res = await fetch("/api/auth/confirm-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, code: resetCode, newPassword: resetNewPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert("Password reset successful. Please login.");
      setForgotStep("none");
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Unknown error");
    }
  };

  const handleBack = () => {
  setForgotStep("none");
  setResetCode("");
  setResetNewPassword("");
  setError("");
  setSuccessMessage("");
  setPassword("");
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#233A77] via-[#1E2E5A] to-[#C51E26] px-4">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md relative">
        {(forgotStep !== "none" || isNewPasswordRequired) && (
          <button
            onClick={handleBack}
            className="absolute top-4 left-4 text-[#233A77] hover:text-[#1E2E5A] font-semibold cursor-pointer"
          >
            ← Back
          </button>
        )}

        <div className="text-center mb-6">
          <Image src="/attainxname.svg" alt="AttainX Logo" width={112} height={32} className="mx-auto mb-2" />
          <h2 className="text-2xl font-bold text-[#233A77]">AI - Flex</h2>
        </div>

        <h2 className="text-xl font-bold text-center text-[#233A77] mb-4">
          {isNewPasswordRequired ? "Set New Password" : forgotStep === "code" ? "Reset Password" : "Sign In"}
        </h2>
        {error && <p className="text-red-600 text-sm mb-3 text-center">{error}</p>}
        {successMessage && <p className="text-green-600 text-sm mb-3 text-center">{successMessage}</p>}


        {forgotStep === "code" ? (
          <form onSubmit={handleConfirmReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#233A77]">Verification Code</label>
              <input type="text" className="w-full border border-gray-300 rounded p-2" value={resetCode} onChange={(e) => setResetCode(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#233A77]">New Password</label>
              <input type="password" className="w-full border border-gray-300 rounded p-2" value={resetNewPassword} onChange={(e) => setResetNewPassword(e.target.value)} required />
            </div>
            <button type="submit" className="w-full bg-[#233A77] text-white font-semibold py-2 rounded">Reset Password</button>
          </form>
        ) : (
          <form
            onSubmit={
              isNewPasswordRequired ? handleNewPasswordSubmit : forgotStep === "email" ? handleForgotPassword : handleSubmit
            }
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-[#233A77]">Email</label>
              <input type="email" className="w-full border border-gray-300 rounded p-2" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={isNewPasswordRequired} />
            </div>

            {forgotStep !== "email" && (
              <div>
                <label className="block text-sm font-medium text-[#233A77]">{isNewPasswordRequired ? "New Password" : "Password"}</label>
                <input type="password" className="w-full border border-gray-300 rounded p-2" value={isNewPasswordRequired ? newPassword : password} onChange={(e) => isNewPasswordRequired ? setNewPassword(e.target.value) : setPassword(e.target.value)} required />
              </div>
            )}

            <button type="submit" className="w-full bg-[#C51E26] hover:bg-[#A3151B] text-white font-semibold py-2 rounded">
              {isNewPasswordRequired ? "Set New Password" : forgotStep === "email" ? "Send Reset Code" : "Log In"}
            </button>

            {forgotStep === "none" && (
              <p
                onClick={() => {
                  setForgotStep("email");
                  setPassword("");
                  setError("");
                  setResetCode("");
                  setResetNewPassword("");
                }}
                className="text-xs text-blue-700 text-center pt-2 cursor-pointer"
              >
                Forgot Password?
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
