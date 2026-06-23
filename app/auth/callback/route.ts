import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const cookieStore = await cookies();
    
    // 1. Grab the requested role from the cookie we planted!
    const requestedRole = cookieStore.get('google_signup_role')?.value;

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
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      
      let finalRole = profile?.role || 'patient';

      // 2. If they wanted to be a doctor, use our SECURE database function to upgrade them!
      if (requestedRole === 'doctor' && finalRole !== 'admin') {
        const { error } = await supabase.rpc('set_user_as_doctor');
        if (!error) {
          finalRole = 'doctor';
        }
      }

      // Clean up the temporary cookie
      cookieStore.delete('google_signup_role');

      // 3. Route securely based on their finalized role
      if (finalRole === 'admin') return NextResponse.redirect(new URL('/dashboard/admin', origin));
      if (finalRole === 'doctor') return NextResponse.redirect(new URL('/dashboard/doctor', origin));
      
      return NextResponse.redirect(new URL('/dashboard/patient', origin));
    }
  }

  return NextResponse.redirect(new URL('/login', origin));
}