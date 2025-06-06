// app/api/instance-map/save/route.ts
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { NextRequest, NextResponse } from "next/server";
import { fromEnv } from "@aws-sdk/credential-provider-env";

const client = new DynamoDBClient({
  region: "us-east-1",
  credentials: fromEnv(), 
});

export async function POST(req: NextRequest) {
  const { cluster_name, instance_id, region } = await req.json();

  if (!cluster_name || !instance_id) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

 const ttl = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

const command = new PutItemCommand({
  TableName: "ClusterInstanceMapping",
  Item: {
    cluster_name: { S: cluster_name },
    instance_id: { S: instance_id },
    region: { S: region || "us-east-1" },
    creation_date: { S: new Date().toISOString() },
    status: { S: "active" },
    ttl: { N: ttl.toString() } // 👈 Add this
  },
});


  try {
    await client.send(command);
    return NextResponse.json({ message: "Mapping saved" });
  } catch (err) {
    console.error("DynamoDB PutItem error:", err);
    return NextResponse.json({ error: "Failed to save mapping" }, { status: 500 });
  }
}
