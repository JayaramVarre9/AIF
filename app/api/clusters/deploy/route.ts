// app/api/clusters/deploy/route.ts

import { NextRequest, NextResponse } from "next/server";
import { SignatureV4 } from "@aws-sdk/signature-v4";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { Sha256 } from "@aws-crypto/sha256-js";
import { defaultProvider } from "@aws-sdk/credential-provider-node"; // Pulls AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    const signer = new SignatureV4({
      credentials: defaultProvider(), // Automatically uses environment AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
      region: "us-east-1",
      service: "execute-api",
      sha256: Sha256,
    });

    const endpoint = "buds86mpe8.execute-api.us-east-1.amazonaws.com";
    const path = "/default/AIFlexDeployCluster";

    const unsignedRequest = new HttpRequest({
      method: "POST",
      protocol: "https:",
      hostname: endpoint,
      path,
      headers: {
        host: endpoint,
        "content-type": "application/json",
        "x-api-key": process.env.AWS_API_KEY2!, // 🔥 Correct API KEY injected
      },
      body: JSON.stringify(payload),
    });

    const signedRequest = await signer.sign(unsignedRequest);

    const awsResponse = await fetch(`https://${signedRequest.hostname}${signedRequest.path}`, {
      method: signedRequest.method,
      headers: signedRequest.headers,
      body: signedRequest.body,
    });

    if (!awsResponse.ok) {
      const errorText = await awsResponse.text();
      console.error("AWS Deploy Error:", errorText);
      return NextResponse.json(
        { error: "AWS Deploy failed", details: errorText },
        { status: awsResponse.status }
      );
    }

    const data = await awsResponse.json();

    return NextResponse.json({ message: "Cluster deployed successfully", data });
  } catch (error) {
    console.error("Deployment Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: (error as Error).message },
      { status: 500 }
    );
  }
}
