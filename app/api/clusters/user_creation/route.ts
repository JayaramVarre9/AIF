import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cluster_name, instance_id, username, email, password } = body;

    // Basic input validation
    if (!cluster_name || !instance_id || !username || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Placeholder for backend API endpoint (to be filled once available)
    //const BACKEND_API_ENDPOINT = ''; // <-- Add actual endpoint here when ready

    // Optional: log for debugging during integration
    console.log('User creation payload:', body);

    
    /*
    const response = await fetch(BACKEND_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cluster_name,
        instance_id,
        username,
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Failed to add user' }, { status: response.status });
    }

    return NextResponse.json(data);
    */

    // Temporary success response until endpoint is live
    return NextResponse.json({ message: 'Stub: user creation successful' });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
