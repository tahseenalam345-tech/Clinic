'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, LogOut, User, Activity, FileText, CheckCircle2, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function PatientDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setUserEmail(session.user.email || 'Patient');
      }
      setLoading(false);
    };
    getUser();
  }, [router, supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-background dark:from-zinc-950 dark:to-background pb-12">
      {/* Dashboard Navigation */}
      <nav className="glass sticky top-0 z-40 border-b border-blue-100 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black text-gradient">MediBook</Link>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline-block text-sm font-medium text-foreground-muted">
              {userEmail}
            </span>
            <Button 
              onClick={handleLogout}
              variant="outline" 
              className="rounded-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950 font-bold"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-foreground mb-2">My Dashboard</h1>
            <p className="text-foreground-muted font-medium">Manage your appointments and medical records.</p>
          </div>
          <Link href="/doctors">
            <Button className="bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:shadow-glow transition-all duration-300 font-bold btn-glow rounded-full border-0 px-6">
              + New Appointment
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left/Main Column: Appointments */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Upcoming Appointment Card */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Upcoming Appointments
              </h2>
              
              <div className="glass-card p-6 md:p-8 rounded-3xl relative overflow-hidden border-l-4 border-l-primary">
                <div className="absolute top-0 right-0 p-4">
                  <span className="bg-blue-100 dark:bg-blue-900/40 text-primary dark:text-blue-400 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> Confirmed
                  </span>
                </div>
                
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-black text-xl shadow-md shrink-0">
                    SJ
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-bold text-foreground">Dr. Sarah Jenkins</h3>
                    <p className="text-primary dark:text-blue-400 font-semibold text-sm">Cardiologist</p>
                    
                    <div className="flex flex-wrap gap-4 pt-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground-muted">
                        <Calendar className="w-4 h-4" />
                        <span>June 24, 2026</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground-muted">
                        <Clock className="w-4 h-4" />
                        <span>10:00 AM</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground-muted">
                        <MapPin className="w-4 h-4" />
                        <span>Main Clinic, Room 302</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex flex-wrap gap-3 pt-6 border-t border-border/50">
                  <Button variant="outline" className="rounded-full border-blue-200 dark:border-zinc-700 text-foreground font-bold">
                    Reschedule
                  </Button>
                  <Button variant="outline" className="rounded-full border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 dark:border-red-900/30 dark:hover:bg-red-950 font-bold">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>

            {/* Past Appointments */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-foreground-muted" />
                Past Visits
              </h2>
              <div className="glass-card rounded-3xl divide-y divide-border/50">
                {[
                  { doctor: 'Dr. Michael Chen', spec: 'Dermatologist', date: 'May 12, 2026' },
                  { doctor: 'Dr. Emily Rodriguez', spec: 'Pediatrician', date: 'Mar 04, 2026' }
                ].map((visit, i) => (
                  <div key={i} className="p-6 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors first:rounded-t-3xl last:rounded-b-3xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-foreground-muted font-black text-sm shrink-0">
                        {visit.doctor.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-sm md:text-base">{visit.doctor}</h4>
                        <div className="flex items-center gap-2 text-xs md:text-sm text-foreground-muted mt-1">
                          <span>{visit.spec}</span>
                          <span>•</span>
                          <span>{visit.date}</span>
                        </div>
                      </div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-green-500 hidden sm:block" />
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Profile & Quick Stats */}
          <div className="space-y-6">
            <div className="glass-card p-6 md:p-8 rounded-3xl text-center space-y-4">
              <div className="w-24 h-24 bg-gradient-to-tr from-blue-100 to-cyan-100 dark:from-zinc-800 dark:to-zinc-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <User className="w-10 h-10 text-primary dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-black text-xl text-foreground">My Profile</h3>
                <p className="text-sm text-foreground-muted break-all mt-1">{userEmail}</p>
              </div>
              <Button variant="outline" className="w-full rounded-full font-bold border-blue-200 dark:border-zinc-700">
                Edit Profile
              </Button>
            </div>

            <div className="glass-card p-6 md:p-8 rounded-3xl space-y-6">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Health Overview
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-border/50">
                  <span className="text-foreground-muted text-sm font-medium">Blood Type</span>
                  <span className="text-foreground font-bold bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full text-sm">O+</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-border/50">
                  <span className="text-foreground-muted text-sm font-medium">Height</span>
                  <span className="text-foreground font-bold">175 cm</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground-muted text-sm font-medium">Weight</span>
                  <span className="text-foreground font-bold">70 kg</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}