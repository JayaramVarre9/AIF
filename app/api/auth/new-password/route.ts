import { completeNewPasswordChallenge } from "@/lib/authService";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { username, newPassword, session } = await req.json();

  try {
    const result = await completeNewPasswordChallenge(username, newPassword, session);
    return NextResponse.json(result);
  } catch (error) {
    const errorMessage = (error as Error).message;

    // Handle specific Cognito error
    if (errorMessage.includes("new password should be given with key NEW_PASSWORD")) {
      return NextResponse.json(
        {
          error: "This user hasn't completed initial setup. Please use the temporary password provided during sign-up.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
