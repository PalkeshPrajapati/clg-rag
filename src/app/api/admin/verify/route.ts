import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (password === adminPassword) {
      return NextResponse.json({ success: true, message: 'Admin access granted' });
    } else {
      return NextResponse.json({ success: false, error: 'Incorrect admin password' }, { status: 401 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: 'Server error verifying password' }, { status: 500 });
  }
}
