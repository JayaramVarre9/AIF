import { completeNewPasswordChallenge } from "@/lib/authService";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { username, newPassword, session } = await req.json();
  try {
    const result = await completeNewPasswordChallenge(username, newPassword, session);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}