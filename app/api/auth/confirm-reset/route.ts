import { confirmForgotPassword } from "@/lib/authService";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { username, code, newPassword } = await req.json();

  try {
    const result = await confirmForgotPassword(username, code, newPassword);
    return NextResponse.json(result);
  } catch (error) {
    const errorMessage = (error as Error).message;

    // Custom handling for users who never completed temp password setup
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

    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
