import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cluster_name, username, role, created_by } = body;

    const missing = [];
    if (!cluster_name) missing.push("cluster_name");
    if (!username) missing.push("username");
    if (!role) missing.push("role");
    if (!created_by) missing.push("created_by");

    if (missing.length > 0) {
      return NextResponse.json(
        { error: "Missing required fields", missing },
        { status: 400 }
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 800)); // mock latency

    return NextResponse.json({
      message: "User successfully added to cluster.",
      data: {
        cluster_name,
        username,
        role,
        created_by,
        created_at: new Date().toISOString(),
        status: "provisioning",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to create user",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
