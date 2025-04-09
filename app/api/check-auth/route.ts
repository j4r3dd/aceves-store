import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get('admin-auth')?.value === 'true';

  if (isAdmin) {
    return NextResponse.json({ authorized: true });
  }

  return NextResponse.json({ authorized: false }, { status: 401 });
}
