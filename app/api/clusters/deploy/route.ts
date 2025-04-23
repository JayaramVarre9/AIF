import { NextRequest, NextResponse } from "next/server";

// Shared in-memory store
let clusterStore: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      cluster_name,
      instance_type,
      region,
      user_id,
      cpu,
      gpu,
    } = body;

    // Track missing fields
    const missingFields = [];
    if (!cluster_name) missingFields.push("cluster_name");
    if (!instance_type) missingFields.push("instance_type");
    if (!region) missingFields.push("region");
    if (!user_id) missingFields.push("user_id");
    if (gpu === undefined) missingFields.push("gpu");
    if (cpu === undefined) missingFields.push("cpu");

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          missing: missingFields,
        },
        { status: 400 }
      );
    }

    const newCluster = {
      cluster_name,
      instance_type,
      region,
      user_id,
      gpu,
      cpu,
      status: "pending",
      launched_at: new Date().toISOString(),
    };

    clusterStore.push(newCluster);

    return NextResponse.json({
      message: "Cluster deployment initiated successfully.",
      data: newCluster,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to deploy cluster",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export { clusterStore };
