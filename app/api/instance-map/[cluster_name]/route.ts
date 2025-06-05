// app/api/instance-map/[cluster_name]/route.ts
import { DynamoDBClient, GetItemCommand, DeleteItemCommand} from "@aws-sdk/client-dynamodb";
import { NextRequest, NextResponse } from "next/server";
import { fromEnv } from "@aws-sdk/credential-provider-env";

const client = new DynamoDBClient({
  region: "us-east-1",
  credentials: fromEnv(),
});

export async function GET(
  req: NextRequest,
  context: { params: { cluster_name: string } }
) {
  const cluster_name = context.params.cluster_name;

  if (!cluster_name) {
    return NextResponse.json({ error: "Missing cluster_name" }, { status: 400 });
  }

  const command = new GetItemCommand({
    TableName: "ClusterInstanceMapping",
    Key: {
      cluster_name: { S: cluster_name },
    },
  });

  try {
    const data = await client.send(command);
    const instanceId = data.Item?.instance_id?.S;

    if (!instanceId) {
      return NextResponse.json({ error: "Instance ID not found" }, { status: 404 });
    }

    return NextResponse.json({ instance_id: instanceId });
  } catch (err) {
    console.error("DynamoDB GetItem error:", err);
    return NextResponse.json({ error: "Failed to fetch mapping" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: { cluster_name: string } }
) {
  const cluster_name = context.params.cluster_name;

  if (!cluster_name) {
    return NextResponse.json({ error: "Missing cluster_name" }, { status: 400 });
  }

    const command = new DeleteItemCommand({
    TableName: "ClusterInstanceMapping",
    Key: {
      cluster_name: { S: cluster_name },
    },
  });

  try {
    await client.send(command);
    return NextResponse.json({ message: `Mapping for ${cluster_name} deleted` });
  } catch (err) {
    console.error("DynamoDB DeleteItem error:", err);
    return NextResponse.json({ error: "Failed to delete mapping" }, { status: 500 });
  }
}
