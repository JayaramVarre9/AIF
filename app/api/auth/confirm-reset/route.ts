import { confirmForgotPassword } from "@/lib/authService";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { username, code, newPassword } = await req.json();

  try {
    const result = await confirmForgotPassword(username, code, newPassword);
    return NextResponse.json(result);
  } catch (error) {
    const errorMessage = (error as Error).message;

    // 🔒 Password policy error handling
    if (
      errorMessage.includes("Password does not conform to policy") ||
      errorMessage.toLowerCase().includes("not long enough") ||
      errorMessage.toLowerCase().includes("password must be")
    ) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.",
        },
        { status: 400 }
      );
    }

    // 👤 Custom handling for users who never completed temp password setup
    if (
      errorMessage.includes("Cannot reset password") ||
      errorMessage.includes("Password reset is not allowed for the user") ||
      errorMessage.includes("User is not confirmed")
    ) {
      return NextResponse.json(
        {
          error:
            "This user hasn't completed initial setup. Please use the temporary password provided during sign-up.",
        },
        { status: 400 }
      );
    }

    // ⚠️ Generic fallback
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
