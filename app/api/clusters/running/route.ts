import { NextResponse } from "next/server";
import { SignatureV4 } from "@aws-sdk/signature-v4";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { Sha256 } from "@aws-crypto/sha256-js";
import { defaultProvider } from "@aws-sdk/credential-provider-node"; // uses env vars
//import { parseUrl } from "@aws-sdk/url-parser";


export const dynamic = "force-dynamic";
interface AwsClusterItem {
    name: string;
    status: string;
    region?: string;
    createdAt: string;
    version: string;
    endpoint: string;
    CPU?: string;  // You can further improve this if you know the type
    GPU?: string;
    cognito_users: string[];
  }
export async function GET() {
  try {
    //const region = "us-east-1";
    //const endpoint = "https://buds86mpe8.execute-api.us-east-1.amazonaws.com/default/AIFlexListEKS";

    //const credentials = await defaultProvider()(); // Get credentials from env variables

    const signer = new SignatureV4({
        credentials: defaultProvider(),
        region: "us-east-1",
        service: "execute-api",  // 🔥 Important
        sha256: Sha256,
      });
      
      const unsignedRequest = new HttpRequest({
        method: "GET",
        protocol: "https:",
        hostname: "buds86mpe8.execute-api.us-east-1.amazonaws.com",
        path: "/default/AIFlexListEKS",
        headers: {
          host: "buds86mpe8.execute-api.us-east-1.amazonaws.com",
          "x-api-key": process.env.AWS_API_KEY!, // If your API needs an API Key
        },
      });
      
      const signedRequest = await signer.sign(unsignedRequest);
      
      const awsResponse = await fetch(`https://${signedRequest.hostname}${signedRequest.path}`, {
        method: signedRequest.method,
        headers: signedRequest.headers,
      });
      
      const data = await awsResponse.json();
      

    const clusters = (data?.List_of_clusters_clusters || []).map((item: AwsClusterItem) => ({
        cluster_name: item.name,
        status: item.status?.toLowerCase(),
        region: item.region,
        launched_at: item.createdAt,
        version: item.version,
        endpoint: item.endpoint,
        cpu: item.CPU,
        gpu: item.GPU,
        users: item.cognito_users,
      }));

    return NextResponse.json({ message: "Fetched clusters", clusters });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Server error", details: (error as Error).message },
      { status: 500 }
    );
  }
}


/*import { NextRequest, NextResponse } from 'next/server';
import { EKSClient, ListClustersCommand, DescribeClusterCommand } from '@aws-sdk/client-eks';
import { fromEnv } from '@aws-sdk/credential-providers';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  try {
    const client = new EKSClient({
      region: process.env.AWS_REGION,
      credentials: fromEnv(),
    });

    // Get list of cluster names
    const listResponse = await client.send(new ListClustersCommand({}));
    const clusterNames = listResponse.clusters || [];

    const clusters = [];

    // Fetch detailed info for each cluster
    for (const name of clusterNames) {
      const descResponse = await client.send(
        new DescribeClusterCommand({ name })
      );

      const cluster = descResponse.cluster;
      if (cluster) {
        clusters.push({
          cluster_name: cluster.name || '',
          status: cluster.status?.toLowerCase() || 'unknown',
          launched_at: cluster.createdAt?.toISOString() || '',
          endpoint: cluster.endpoint || '',
          version: cluster.version || '',
        });
      }
    }

    return NextResponse.json({ message: 'Fetched AWS clusters', clusters });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch clusters', details: (error as Error).message },
      { status: 500 }
    );
  
}
}*/
