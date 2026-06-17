'use client';

import { Heart, Moon, Sun, Menu, X, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function Header() {
  const [isDark, setIsDark] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (document.documentElement.classList.contains('dark') || window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkAuth();
  }, [supabase.auth]);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    router.push('/');
  };

  const navLinks = [
    { name: 'Doctors', href: '/doctors' },
    { name: 'Contact', href: '#contact' },
    { name: 'Features', href: '#features' },
  ];

  return (
    <>
      <header className="glass backdrop-blur-md sticky top-0 z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4 flex items-center justify-between">
          
          <div className="flex items-center gap-2 md:gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-foreground">
              <Menu className="w-6 h-6" />
            </button>
            <Link href="/" className="flex items-center gap-2 md:gap-3">
              <div className="w-10 h-10 md:w-11 md:h-11 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-premium">
                <Heart className="w-5 h-5 md:w-6 md:h-6 text-white fill-white" />
              </div>
              <div>
                <span className="text-xl md:text-2xl font-black text-gradient">Crescent Care</span>
                <p className="hidden md:block text-xs text-foreground-muted font-medium">Medical Center</p>
              </div>
            </Link>
          </div>
          
          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map(link => (
              <Link key={link.name} href={link.href} className="text-foreground-muted hover:text-primary font-bold transition-colors duration-300">
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={toggleTheme}
              className="glass p-2 md:p-2.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-300"
            >
              {isDark ? <Sun className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" /> : <Moon className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />}
            </button>

            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <Link href="/dashboard/patient">
                  <Button className="bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:shadow-glow transition-all duration-300 font-bold btn-glow rounded-full border-0 px-4 md:px-6 gap-2">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Button>
                </Link>
                <Button onClick={handleLogout} variant="outline" className="hidden sm:flex rounded-full border-red-200 text-red-600 hover:bg-red-50 font-bold px-4">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button className="bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:shadow-glow transition-all duration-300 font-bold btn-glow rounded-full border-0 px-4 md:px-6">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay remains the same */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <div className="absolute top-0 left-0 bottom-0 w-3/4 max-w-sm bg-background border-r border-border shadow-2xl p-6 flex flex-col animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between mb-8">
              <span className="text-2xl font-black text-gradient">Menu</span>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 glass rounded-full text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-6">
              {navLinks.map(link => (
                <Link 
                  key={link.name} 
                  href={link.href} 
                  onClick={() => setIsSidebarOpen(false)}
                  className="text-lg font-bold text-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              {isLoggedIn && (
                <button onClick={handleLogout} className="text-left text-lg font-bold text-red-500 hover:text-red-600 transition-colors mt-4">
                  Logout
                </button>
              )}
            </nav>
            <div className="mt-auto pt-8 border-t border-border/50">
              <p className="text-sm text-foreground-muted font-medium mb-4">Need immediate help?</p>
              <a href="tel:051999999" className="flex items-center gap-3 font-bold text-primary mb-4">
                Call: 051 999 999
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}