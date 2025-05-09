"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { signIn, completeNewPasswordChallenge, forgotPassword, confirmForgotPassword } from "@/lib/authService";
import { setCookie } from "nookies";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isNewPasswordRequired, setIsNewPasswordRequired] = useState(false);
  const [session, setSession] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Forgot password flow
  const [forgotStep, setForgotStep] = useState<"none" | "email" | "code">("none");
  const [resetCode, setResetCode] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");

  useEffect(() => {
    const token = document.cookie.includes("accessToken");
    if (token) router.push("/dashboard");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await signIn(username, password);

      if (response.challenge === "NEW_PASSWORD_REQUIRED") {
        setIsNewPasswordRequired(true);
        setSession(response.session ?? null);
      } else if (response.AccessToken) {
        setCookie(null, "accessToken", response.AccessToken, {
          path: "/",
          secure: true,
          sameSite: "strict",
        });

        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  const handleNewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    try {
      const result = await completeNewPasswordChallenge(username, newPassword, session);
      if (result.AccessToken) {
        setCookie(null, "accessToken", result.AccessToken, {
          path: "/",
          secure: true,
          sameSite: "strict",
        });
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Password reset failed");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await forgotPassword(username);
      setForgotStep("code");
    } catch (err: any) {
      setError(err.message || "Failed to send reset code");
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await confirmForgotPassword(username, resetCode, resetNewPassword);
      alert("Password reset successful. Please login.");
      setForgotStep("none");
    } catch (err: any) {
      setError(err.message || "Reset failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#233A77] via-[#1E2E5A] to-[#C51E26] px-4">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
      <div className="text-center mb-6">
  <img src="/attainxname.svg" alt="AttainX Logo" className="w-28 mx-auto mb-2" />
  <h2 className="text-2xl font-bold text-[#233A77]">AI - Flex</h2>
</div>

        <h2 className="text-xl font-bold text-center text-[#233A77] mb-4">
          {isNewPasswordRequired ? "Set New Password" : forgotStep === "code" ? "Reset Password" : "Sign In"}
        </h2>
        {error && <p className="text-red-600 text-sm mb-3 text-center">{error}</p>}

        {/* Forgot Password - Confirm Code */}
        {forgotStep === "code" ? (
          <form onSubmit={handleConfirmReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#233A77]">Verification Code</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded p-2"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#233A77]">New Password</label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded p-2"
                value={resetNewPassword}
                onChange={(e) => setResetNewPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="w-full bg-[#233A77] text-white font-semibold py-2 rounded">
              Reset Password
            </button>
            <p
              onClick={() => setForgotStep("none")}
              className="text-xs text-blue-600 text-center pt-2 cursor-pointer"
            >
              Back to login
            </p>
          </form>
        ) : (
          <form
            onSubmit={
              isNewPasswordRequired
                ? handleNewPasswordSubmit
                : forgotStep === "email"
                ? handleForgotPassword
                : handleSubmit
            }
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-[#233A77]">Email</label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded p-2"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isNewPasswordRequired}
              />
            </div>

            {forgotStep !== "email" && (
              <div>
                <label className="block text-sm font-medium text-[#233A77]">
                  {isNewPasswordRequired ? "New Password" : "Password"}
                </label>
                <input
                  type="password"
                  className="w-full border border-gray-300 rounded p-2"
                  value={isNewPasswordRequired ? newPassword : password}
                  onChange={(e) =>
                    isNewPasswordRequired ? setNewPassword(e.target.value) : setPassword(e.target.value)
                  }
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#C51E26] hover:bg-[#A3151B] text-white font-semibold py-2 rounded"
            >
              {isNewPasswordRequired
                ? "Set New Password"
                : forgotStep === "email"
                ? "Send Reset Code"
                : "Log In"}
            </button>

            {forgotStep === "none" && (
              <p
                onClick={() => setForgotStep("email")}
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
