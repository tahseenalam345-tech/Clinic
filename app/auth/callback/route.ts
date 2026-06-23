import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const requestedRole = requestUrl.searchParams.get('role'); // Catch the role from Google login
  const origin = requestUrl.origin;

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
          set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }); },
          remove(name: string, options: CookieOptions) { cookieStore.set({ name, value: '', ...options }); },
        },
      }
    );

    // Securely exchange the Google code for a session
    await supabase.auth.exchangeCodeForSession(code);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Fetch their newly created profile (from the SQL Trigger)
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      
      let finalRole = profile?.role || 'patient';

      // If they clicked "Doctor" on the UI before signing in with Google,
      // and they aren't already an admin, update their profile to Doctor!
      if (requestedRole === 'doctor' && finalRole !== 'admin') {
        await supabase.from('profiles').update({ role: 'doctor' }).eq('id', user.id);
        finalRole = 'doctor';
      }

      // Route securely based on their finalized role
      if (finalRole === 'admin') return NextResponse.redirect(new URL('/dashboard/admin', origin));
      if (finalRole === 'doctor') return NextResponse.redirect(new URL('/dashboard/doctor', origin));
      
      return NextResponse.redirect(new URL('/dashboard/patient', origin));
    }
  }

  return NextResponse.redirect(new URL('/login', origin));
}