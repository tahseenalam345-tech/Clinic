'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Heart, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/dashboard/patient'); // We will build this next!
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setSuccess('Check your email for the confirmation link!');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-blue-950/20 px-4 py-12">
      {/* Floating Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl -z-10 float-slower" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-300/20 dark:bg-cyan-600/10 rounded-full blur-3xl -z-10 float" />

      <div className="w-full max-w-md">
        {/* Logo/Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <span className="text-2xl font-black text-gradient">MediBook</span>
          </Link>
          <h1 className="text-3xl font-black text-foreground mb-2">
            {isLogin ? 'Welcome Back' : 'Create an Account'}
          </h1>
          <p className="text-foreground-muted font-medium">
            {isLogin ? 'Enter your details to access your account.' : 'Join us to manage your healthcare seamlessly.'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-card p-6 md:p-8 rounded-3xl relative overflow-hidden">
          <form onSubmit={handleAuth} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-2xl text-red-600 dark:text-red-400 text-sm font-medium">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-900 rounded-2xl text-green-600 dark:text-green-400 text-sm font-medium">
                {success}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-foreground mb-2 ml-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-5 py-3.5 bg-white dark:bg-zinc-800 border border-blue-200 dark:border-zinc-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-foreground mb-2 ml-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-5 py-3.5 bg-white dark:bg-zinc-800 border border-blue-200 dark:border-zinc-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-foreground"
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:shadow-glow transition-all duration-300 font-bold py-6 text-base rounded-full btn-glow border-0 mt-4"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setSuccess(null);
              }}
              className="text-sm text-foreground-muted hover:text-primary dark:hover:text-blue-400 font-semibold transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}