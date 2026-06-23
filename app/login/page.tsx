'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Mail, Lock, User as UserIcon, Shield, ArrowLeft, Stethoscope, HeartPulse } from 'lucide-react';
import Link from 'next/link';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const supabase = createClient();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Universal Neon Input Style
  const neonInputClass = "w-full pl-12 pr-4 py-3.5 bg-[#111113] border-2 border-zinc-800 rounded-2xl focus:outline-none focus:border-blue-500 focus:shadow-[0_0_20px_rgba(59,130,246,0.6)] focus:ring-4 focus:ring-blue-500/20 hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all duration-300 text-white font-bold text-sm";

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'register') {
        // 1. Sign Up
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name, role: role } }
        });
        if (signUpError) throw signUpError;
        
        // Let the central router handle the actual destination
        router.push('/dashboard');
      } else {
        // 2. Sign In
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;

        // Push to the central server router so it handles the strict role checks
        router.push(returnTo || '/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    // BULLETPROOF FIX: Plant a temporary cookie to remember their choice
    document.cookie = `google_signup_role=${role}; path=/; max-age=300;`;

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback` // Removed the fragile URL parameter
      }
    });

    if (oauthError) {
      setError(oauthError.message || "Google Auth failed. Check Supabase Provider settings.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center z-10 py-12">
        
        {/* Left Side: Branding & Copy */}
        <div className="hidden lg:flex flex-col space-y-6 pr-12">
          <Link href="/" className="w-fit p-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors mb-4">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-700 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.4)]">
            <HeartPulse className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-black text-foreground leading-tight">
            Your Health, <br/>
            <span className="text-primary drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">Decoded.</span>
          </h1>
          <p className="text-lg text-foreground-muted font-medium max-w-md">
            Join the most advanced Electronic Health Record system. Manage appointments, download lab reports, and connect with top specialists instantly.
          </p>
          <div className="flex gap-4 mt-8 pt-8 border-t border-zinc-800">
            <div className="flex flex-col"><span className="text-2xl font-black text-foreground">10k+</span><span className="text-sm text-foreground-muted">Patients</span></div>
            <div className="w-px bg-zinc-800" />
            <div className="flex flex-col"><span className="text-2xl font-black text-foreground">50+</span><span className="text-sm text-foreground-muted">Specialists</span></div>
            <div className="w-px bg-zinc-800" />
            <div className="flex flex-col"><span className="text-2xl font-black text-foreground">256-bit</span><span className="text-sm text-foreground-muted">Encryption</span></div>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="glass-card bg-[#0a0a0c]/95 w-full max-w-md mx-auto rounded-[2rem] border border-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.1)] p-8 sm:p-10 animate-in fade-in slide-in-from-bottom-8">
          
          {/* Mobile Back Button */}
          <Link href="/" className="lg:hidden inline-flex items-center gap-2 text-foreground-muted hover:text-primary font-bold mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          {/* Toggle Login / Register */}
          <div className="flex bg-[#111113] p-1 rounded-full mb-8 border border-zinc-800">
            <button onClick={() => setMode('login')} className={`flex-1 py-2.5 text-sm font-bold rounded-full transition-all ${mode === 'login' ? 'bg-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'text-foreground-muted hover:text-foreground'}`}>
              Sign In
            </button>
            <button onClick={() => setMode('register')} className={`flex-1 py-2.5 text-sm font-bold rounded-full transition-all ${mode === 'register' ? 'bg-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'text-foreground-muted hover:text-foreground'}`}>
              Create Account
            </button>
          </div>

          <h2 className="text-2xl font-black text-foreground mb-6">
            {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
          </h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-sm font-bold mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            
            {/* Registration specific fields */}
            {mode === 'register' && (
              <>
                {/* Role Selector */}
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <button type="button" onClick={() => setRole('patient')} className={`py-3 px-4 rounded-2xl border-2 flex items-center justify-center gap-2 font-bold transition-all ${role === 'patient' ? 'border-primary bg-primary/10 text-primary' : 'border-zinc-800 bg-[#111113] text-foreground-muted'}`}>
                    <UserIcon className="w-4 h-4" /> Patient
                  </button>
                  <button type="button" onClick={() => setRole('doctor')} className={`py-3 px-4 rounded-2xl border-2 flex items-center justify-center gap-2 font-bold transition-all ${role === 'doctor' ? 'border-primary bg-primary/10 text-primary' : 'border-zinc-800 bg-[#111113] text-foreground-muted'}`}>
                    <Stethoscope className="w-4 h-4" /> Doctor
                  </button>
                </div>

                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted z-20" />
                  <input type="text" required placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className={neonInputClass} />
                </div>
              </>
            )}

            {/* Email Field */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted z-20" />
              <input type="email" required placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className={neonInputClass} />
            </div>

            {/* Password Field */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted z-20" />
              <input type="password" required placeholder="Password (min. 6 characters)" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={neonInputClass} />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-full font-black py-6 mt-2 hover-wave btn-glow border-0 text-base shadow-[0_0_20px_rgba(59,130,246,0.4)]">
              {isLoading ? 'Processing...' : (mode === 'login' ? 'Sign In to Dashboard' : 'Create Account')}
            </Button>
          </form>

          {/* Social Auth Divider */}
          <div className="mt-8 relative flex items-center">
            <div className="flex-grow border-t border-zinc-800"></div>
            <span className="flex-shrink-0 mx-4 text-foreground-muted text-xs font-bold uppercase tracking-widest">Or continue with</span>
            <div className="flex-grow border-t border-zinc-800"></div>
          </div>

          {/* Google Auth Button - Added type="button" here */}
          <Button type="button" onClick={handleGoogleLogin} variant="outline" className="w-full mt-6 bg-[#111113] hover:bg-zinc-800 border-zinc-800 text-foreground font-bold rounded-full py-6 transition-all">
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </Button>

          <p className="text-center text-xs text-foreground-muted mt-8 font-medium flex items-center justify-center gap-1">
            <Shield className="w-3 h-3" /> Securely encrypted via Supabase Auth
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}