import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { fromEnv } from '@aws-sdk/credential-provider-env';

const client = new DynamoDBClient({
  region: 'us-east-1',
  credentials: fromEnv(),
});

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const clusterName = url.searchParams.get('cluster_name');

  if (!clusterName) {
    return NextResponse.json({ error: 'Missing cluster_name' }, { status: 400 });
  }

  try {
    const command = new GetItemCommand({
      TableName: 'ClusterInstanceMapping',
      Key: { cluster_name: { S: clusterName } },
    });

    const data = await client.send(command);
    const instanceId = data.Item?.instance_id?.S;

    if (!instanceId) {
      return NextResponse.json({ error: 'Instance ID not found' }, { status: 404 });
    }

    return NextResponse.json({ instance_id: instanceId });
  } catch (err) {
    console.error('DynamoDB GetItem error:', err);
    return NextResponse.json({ error: 'Failed to fetch mapping' }, { status: 500 });
  }
}
