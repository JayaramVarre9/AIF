import { completeNewPasswordChallenge } from "@/lib/authService";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { username, newPassword, session } = await req.json();

  try {
    const result = await completeNewPasswordChallenge(username, newPassword, session);
    return NextResponse.json(result);
  } catch (error) {
    const errorMessage = (error as Error).message;

    // 🔒 Password policy violation
    if (
      errorMessage.includes("Password did not conform with policy") ||
      errorMessage.toLowerCase().includes("not long enough") ||
      errorMessage.toLowerCase().includes("must have")
    ) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.",
        },
        { status: 400 }
      );
    }

    // 👤 Uninitialized user setup
    if (errorMessage.includes("new password should be given with key NEW_PASSWORD")) {
      return NextResponse.json(
        {
          error:
            "This user hasn't completed initial setup. Please use the temporary password provided during sign-up.",
        },
        { status: 400 }
      );
    }

    // ⚠️ Fallback generic error
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
