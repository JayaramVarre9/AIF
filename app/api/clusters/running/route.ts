// app/api/clusters/running/route.ts

export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server'
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
  let clusters: Cluster[] = [];
// In-memory store (used by deploy, delete, running APIs)


// Handle GET (fetch all)
export async function GET() {
  return NextResponse.json({
    message: 'Successfully fetched running clusters.',
    clusters,
  })
}

// Handle POST (add cluster from Postman or deploy)
export async function POST(req: NextRequest) {
  const body = await req.json()

  if (!body.cluster_name) {
    return NextResponse.json({ error: 'Missing cluster_name' }, { status: 400 })
  }

  // Avoid duplicates based on cluster_name
  clusters = clusters.filter((c) => c.cluster_name !== body.cluster_name)
  clusters.push(body)

  return NextResponse.json({ message: 'Cluster added successfully.', cluster: body })
}

// Handle DELETE (remove cluster by name)
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const nameToDelete = searchParams.get('name')

  if (!nameToDelete) {
    return NextResponse.json({ message: 'Cluster name is required' }, { status: 400 })
  }

  const initialLength = clusters.length
  clusters = clusters.filter((c) => c.cluster_name !== nameToDelete)

  if (clusters.length < initialLength) {
    return NextResponse.json({ message: `Cluster ${nameToDelete} deleted.` })
  } else {
    return NextResponse.json({ message: `Cluster ${nameToDelete} not found.` }, { status: 404 })
  }
}
