import { NextRequest, NextResponse } from "next/server";

// In-memory store scoped inside this file (not exported)
interface Cluster {
    cluster_name: string;
    instance_type: string;
    region: string;
    user_id: string;
    gpu: boolean;
    cpu: boolean;
    launched_at: string;
    status: string;
  }
  const localClusterStore: Cluster[] = [];


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

    const missingFields = [];
    if (!cluster_name) missingFields.push("cluster_name");
    if (!instance_type) missingFields.push("instance_type");
    if (!region) missingFields.push("region");
    if (!user_id) missingFields.push("user_id");
    if (gpu === undefined) missingFields.push("gpu");
    if (cpu === undefined) missingFields.push("cpu");

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: "Missing required fields", missing: missingFields },
        { status: 400 }
      );
    }

    // Simulate storing the cluster
    const cluster = {
      cluster_name,
      instance_type,
      region,
      user_id,
      cpu,
      gpu,
      status: "pending",
      launched_at: new Date().toISOString(),
    };

    localClusterStore.push(cluster);

    return NextResponse.json({
      message: "Cluster deployment initiated successfully.",
      data: cluster,
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
