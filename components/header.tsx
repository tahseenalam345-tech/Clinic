'use client';

import { Heart, Menu, X, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';

export function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.classList.add('dark');

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        setUserRole(profile?.role || null);
      }
    };
    checkAuth();
  }, [supabase]);

  const handleLogout = async () => {
    // 1. Wipe the Supabase session
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUserRole(null);
    
    // 2. Force the router to the homepage
    router.push('/');
    
    // 3. Clear the Next.js client cache so it forgets the user
    router.refresh(); 
  };

  // Clean, page-only navigation architecture
  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Doctors', href: '/doctors' },
  ];

  return (
    <>
      <header className="glass backdrop-blur-md sticky top-0 z-50 border-b border-white/5 dark:border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4 flex items-center justify-between">
          
          {/* Mobile Menu Button & Logo */}
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
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map(link => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.name} 
                  href={link.href} 
                  className={`font-bold transition-colors duration-300 ${
                    isActive ? 'text-primary dark:text-blue-400' : 'text-foreground-muted hover:text-foreground'
                  }`}
                >
                  {link.name}
                </Link>
              )
            })}
          </nav>

          {/* Authentication Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                
                {/* Admin Exclusive Button */}
                {userRole === 'admin' && (
                  <Link href="/dashboard/admin">
                    <Button variant="outline" className="border-purple-500 text-purple-500 hover:bg-purple-500/10 hidden sm:flex rounded-full font-bold px-4 hover-wave">
                      Admin Panel
                    </Button>
                  </Link>
                )}

                <Link href="/dashboard">
                  <Button className="bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:shadow-glow transition-all duration-300 font-bold btn-glow rounded-full border-0 px-4 md:px-6 gap-2 hover-wave">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Button>
                </Link>
                <Button onClick={handleLogout} variant="outline" className="hidden sm:flex rounded-full border-red-900/50 text-red-400 hover:bg-red-950 font-bold px-4 hover-wave">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button className="bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:shadow-glow transition-all duration-300 font-bold btn-glow rounded-full border-0 px-4 md:px-6 hover-wave">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <div className="absolute top-0 left-0 bottom-0 w-3/4 max-w-sm bg-background border-r border-border shadow-2xl p-6 flex flex-col animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between mb-8">
              <span className="text-2xl font-black text-gradient">Menu</span>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 glass rounded-full text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <nav className="flex flex-col gap-6">
              {navLinks.map(link => {
                const isActive = pathname === link.href;
                return (
                  <Link 
                    key={link.name} 
                    href={link.href} 
                    onClick={() => setIsSidebarOpen(false)}
                    className={`text-lg font-bold transition-colors ${
                      isActive ? 'text-primary dark:text-blue-400' : 'text-foreground hover:text-primary'
                    }`}
                  >
                    {link.name}
                  </Link>
                )
              })}
              
              {/* Add Dashboard directly to mobile menu if logged in */}
              {isLoggedIn && (
                <Link 
                  href="/dashboard" 
                  onClick={() => setIsSidebarOpen(false)}
                  className={`text-lg font-bold transition-colors ${
                    pathname?.startsWith('/dashboard') ? 'text-primary dark:text-blue-400' : 'text-foreground hover:text-primary'
                  }`}
                >
                  Dashboard
                </Link>
              )}

              {/* Admin Panel directly to mobile menu if logged in as admin */}
              {isLoggedIn && userRole === 'admin' && (
                <Link 
                  href="/dashboard/admin" 
                  onClick={() => setIsSidebarOpen(false)}
                  className={`text-lg font-bold transition-colors text-purple-500 hover:text-purple-400`}
                >
                  Admin Panel
                </Link>
              )}

              {isLoggedIn && (
                <button onClick={() => { handleLogout(); setIsSidebarOpen(false); }} className="text-left text-lg font-bold text-red-500 hover:text-red-400 transition-colors mt-4 pt-4 border-t border-border/50">
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