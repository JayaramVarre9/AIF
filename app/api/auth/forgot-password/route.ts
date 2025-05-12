import { forgotPassword } from "@/lib/authService";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { username } = await req.json();
  try {
    const result = await forgotPassword(username);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}