import { NextRequest, NextResponse } from "next/server";

// Shared in-memory store (you can import this from a separate file for production)
let clustersStore: any[] = [];

export async function POST(req: NextRequest) {
  const body = await req.json();
  const newClusters = body.clusters || [];
  clustersStore.push(...newClusters);
  return NextResponse.json({ message: "Clusters stored successfully." });
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: "Fetched running clusters.",
    clusters: clustersStore,
  });
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const nameToDelete = url.searchParams.get("name");

  if (!nameToDelete) {
    return NextResponse.json({ error: "Missing cluster name." }, { status: 400 });
  }

  const originalLength = clustersStore.length;
  clustersStore = clustersStore.filter(cluster => cluster.cluster_name !== nameToDelete);

  const deleted = clustersStore.length !== originalLength;

  return NextResponse.json({ 
    message: deleted ? "Cluster deleted successfully." : "Cluster not found.",
    deleted 
  });
}

export { clustersStore };
