import { NextRequest, NextResponse } from 'next/server';
import { SignatureV4 } from '@aws-sdk/signature-v4';
import { HttpRequest } from '@aws-sdk/protocol-http';
import { Sha256 } from '@aws-crypto/sha256-js';
import { defaultProvider } from '@aws-sdk/credential-provider-node';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cluster_name, instance_id, username, region, email, temp_password } = body;

    if (!cluster_name || !instance_id || !username || !email || !temp_password || !region) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const signer = new SignatureV4({
      credentials: defaultProvider(),
      region: 'us-east-1',
      service: 'execute-api',
      sha256: Sha256,
    });

    const hostname = 'buds86mpe8.execute-api.us-east-1.amazonaws.com';
    const path = '/default/AIFlexAddUserFunciton';

    const requestBody = JSON.stringify({
      username,
      email,
      cluster_name,
      instance_id,
      region,
      temp_password,
    });

    const unsignedRequest = new HttpRequest({
      method: 'POST',
      protocol: 'https:',
      hostname,
      path,
      headers: {
        host: hostname,
        'content-type': 'application/json',
        // 'x-api-key': process.env.AWS_API_KEY, // if your backend uses API keys
      },
      body: requestBody,
    });

    const signedRequest = await signer.sign(unsignedRequest);

    const awsResponse = await fetch(`https://${hostname}${path}`, {
      method: signedRequest.method,
      headers: signedRequest.headers,
      body: signedRequest.body, // signed body must be preserved
    });

    const text = await awsResponse.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON response from backend', raw: text }, { status: 502 });
    }

    if (!awsResponse.ok) {
      return NextResponse.json({ error: data.error || 'AWS Lambda failed', details: data }, { status: awsResponse.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
