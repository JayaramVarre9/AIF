// app/api/(Auth)/login/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    // Simple mock check
    if (username === "admin" && password === "admin123") {
      const response = NextResponse.json({ message: "Login successful" });

      // Set a mock cookie token (in production, use secure JWT)
      response.cookies.set("token", "mock-token-value", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 1 day
        path: "/",
      });

      return response;
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  } catch (error) {
    return NextResponse.json(
      { error: "Login failed", details: (error as Error).message },
      { status: 500 }
    );
  }
}
