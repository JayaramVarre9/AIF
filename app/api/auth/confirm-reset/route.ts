import { confirmForgotPassword } from "@/lib/authService";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { username, code, newPassword } = await req.json();
  try {
    const result = await confirmForgotPassword(username, code, newPassword);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
