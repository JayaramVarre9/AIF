import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, DeleteItemCommand } from '@aws-sdk/client-dynamodb';
import { fromEnv } from '@aws-sdk/credential-provider-env';

const client = new DynamoDBClient({
  region: 'us-east-1',
  credentials: fromEnv(),
});

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const clusterName = url.searchParams.get('cluster_name');

  if (!clusterName) {
    return NextResponse.json({ error: 'Missing cluster_name' }, { status: 400 });
  }

  try {
    const command = new DeleteItemCommand({
      TableName: 'ClusterInstanceMapping',
      Key: { cluster_name: { S: clusterName } },
    });

    await client.send(command);
    return NextResponse.json({ message: `Mapping for ${clusterName} deleted` });
  } catch (err) {
    console.error('DynamoDB DeleteItem error:', err);
    return NextResponse.json({ error: 'Failed to delete mapping' }, { status: 500 });
  }
}
