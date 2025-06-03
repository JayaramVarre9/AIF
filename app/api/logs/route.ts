// File: app/api/logs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { SignatureV4 } from '@aws-sdk/signature-v4';
import { HttpRequest } from '@aws-sdk/protocol-http';
import { Sha256 } from '@aws-crypto/sha256-js';
import { defaultProvider } from '@aws-sdk/credential-provider-node';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const logStreamName = searchParams.get('log_stream_name');
    const logStreamType = searchParams.get('log_type')

    if (logStreamName === null || logStreamType === null) {
  return NextResponse.json(
    { error: 'Missing Cluster Name or Log Type' },
    { status: 400 }
  );
}

    const signer = new SignatureV4({
      credentials: defaultProvider(),
      region: 'us-east-1',
      service: 'execute-api',
      sha256: Sha256,
    });

    const encodedPath = `/default/AIFlex_Fetch_Logs?log_stream_name=${encodeURIComponent(logStreamName)}&log_type=${encodeURIComponent(logStreamType)}`;

    const unsignedRequest = new HttpRequest({
      method: 'GET',
      protocol: 'https:',
      hostname: 'buds86mpe8.execute-api.us-east-1.amazonaws.com',
      path: encodedPath,
      headers: {
        host: 'buds86mpe8.execute-api.us-east-1.amazonaws.com',
      },
    });

    const signedRequest = await signer.sign(unsignedRequest);

    const awsResponse = await fetch(`https://${signedRequest.hostname}${signedRequest.path}`, {
      method: signedRequest.method,
      headers: signedRequest.headers,
    });

    if (!awsResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch logs from backend' },
        { status: awsResponse.status }
      );
    }

    const data = await awsResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Log fetch error:', error);
    return NextResponse.json(
      { error: 'Server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}
