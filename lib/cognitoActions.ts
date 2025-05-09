'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function handleSignOut() {
  const cookieStore = await cookies(); // ✅ Await this!

  // ✅ Delete tokens
  cookieStore.delete('accessToken');
  cookieStore.delete('idToken');
  cookieStore.delete('refreshToken');
  cookieStore.delete('department');
  cookieStore.delete('name');

  // ✅ Redirect to login
  redirect('/login');
}
