import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
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
    const command = new UpdateItemCommand({
      TableName: 'ClusterInstanceMapping',
      Key: {
        cluster_name: { S: clusterName },
      },
      UpdateExpression: 'SET #s = :inactive',
      ExpressionAttributeNames: {
        '#s': 'status',
      },
      ExpressionAttributeValues: {
        ':inactive': { S: 'inactive' },
      },
    });

    await client.send(command);
    return NextResponse.json({ message: `Status of ${clusterName} updated to inactive` });
  } catch (err) {
    console.error('DynamoDB UpdateItem error:', err);
    return NextResponse.json({ error: 'Failed to update mapping status' }, { status: 500 });
  }
}
