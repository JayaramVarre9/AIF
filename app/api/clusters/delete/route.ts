import { NextRequest, NextResponse } from "next/server";

// This will be reset on each request — for demo only.
// Replace with database or persistent store in production.
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
  let internalStore: Cluster[] = [];

export async function POST(req: NextRequest) {
  const body = await req.json();
  const newClusters = body.clusters || [];
  internalStore.push(...newClusters);
  return NextResponse.json({ message: "Clusters stored successfully." });
}

{/*export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: "Fetched running clusters.",
    clusters: internalStore,
  });
}*/}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const nameToDelete = url.searchParams.get("name");

  if (!nameToDelete) {
    return NextResponse.json({ error: "Missing cluster name." }, { status: 400 });
  }

  const originalLength = internalStore.length;
  internalStore = internalStore.filter(cluster => cluster.cluster_name !== nameToDelete);

  const deleted = internalStore.length !== originalLength;

  return NextResponse.json({
    message: deleted ? "Cluster deleted successfully." : "Cluster not found.",
    deleted,
  });
}
