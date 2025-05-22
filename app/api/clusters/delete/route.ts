import { NextResponse } from "next/server";
import { SignatureV4 } from "@aws-sdk/signature-v4";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { Sha256 } from "@aws-crypto/sha256-js";
import { defaultProvider } from "@aws-sdk/credential-provider-node";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { instance_id } = await req.json();

    if (!instance_id) {
      return NextResponse.json({ error: "Missing instance_id" }, { status: 400 });
    }

    const signer = new SignatureV4({
      credentials: defaultProvider(),
      region: "us-east-1",
      service: "execute-api",
      sha256: Sha256,
    });

    const endpoint = "buds86mpe8.execute-api.us-east-1.amazonaws.com";
    const path = "/default/AIFlexDeleteCluster";

    const unsignedRequest = new HttpRequest({
      method: "POST",
      protocol: "https:",
      hostname: endpoint,
      path,
      headers: {
        host: endpoint,
        "content-type": "application/json",
      },
      body: JSON.stringify({ instance_id }),
    });

    const signedRequest = await signer.sign(unsignedRequest);

    const awsResponse = await fetch(`https://${signedRequest.hostname}${signedRequest.path}`, {
      method: signedRequest.method,
      headers: signedRequest.headers,
      body: signedRequest.body,
    });

    const result = await awsResponse.json().catch(() => ({}));

    if (!awsResponse.ok) {
      return NextResponse.json(
        { error: result.error || "Cluster deletion failed" },
        { status: awsResponse.status }
      );
    }

    return NextResponse.json({ message: "Cluster deleted successfully", result });
  } catch (err) {
    console.error("Error deleting cluster:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
