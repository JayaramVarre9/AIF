// app/api/(Auth)/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out successfully" });

  // Clear cookie
  response.cookies.set("token", "", {
    maxAge: 0,
    path: "/",
  });

  return response;
}
