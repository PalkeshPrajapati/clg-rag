import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch documents error:', error.message);
      return NextResponse.json({ documents: [] });
    }

    return NextResponse.json({ documents: data || [] });
  } catch (err: any) {
    console.error('Error fetching documents list:', err);
    return NextResponse.json({ documents: [] });
  }
}
