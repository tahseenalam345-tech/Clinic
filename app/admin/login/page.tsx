'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ShieldAlert, Lock, Mail, ArrowRight } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // 1. Attempt Sign In
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError('Invalid credentials.');
      setIsLoading(false);
      return;
    }

    if (data.user) {
      // 2. Strict Admin Verification
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profile?.role === 'admin') {
        // Success! Route to Command Center
        router.push('/dashboard/admin');
      } else {
        // Kick them out immediately
        await supabase.auth.signOut();
        setError('UNAUTHORIZED: You do not have administrator privileges.');
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Dark/Red Security Theming */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-900/20 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[100px] -z-10" />

      <div className="w-full max-w-md p-8 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 mb-6">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Restricted Area</h1>
          <p className="text-red-400/80 font-medium mt-2 text-sm uppercase tracking-widest">Authorized Personnel Only</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-6 text-sm font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Admin Email</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#111113] border border-zinc-800 text-white pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-medium"
                placeholder="system@nexus.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Master Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#111113] border border-zinc-800 text-white pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-medium"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black rounded-xl py-4 mt-4 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? 'Authenticating...' : (
              <>Initiate Override <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}