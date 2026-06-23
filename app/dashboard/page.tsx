import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export default async function DashboardRouter() {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // If role is missing/null, default them to 'patient'
  const userRole = profile?.role || 'patient';

  if (userRole === 'admin') {
    redirect('/dashboard/admin');
  } else if (userRole === 'doctor') {
    redirect('/dashboard/doctor');
  } else {
    redirect('/dashboard/patient'); 
  }
}