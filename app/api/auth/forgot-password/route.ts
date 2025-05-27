import { forgotPassword } from "@/lib/authService";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { username } = await req.json();
  try {
    await forgotPassword(username);
    return NextResponse.json({
      message: "A verification code has been sent to your email address.",
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
