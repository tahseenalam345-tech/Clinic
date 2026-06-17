'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Clock, CalendarOff, ArrowLeft } from 'lucide-react'; // Added ArrowLeft
import Link from 'next/link'; // Added Link

export const MOCK_DOCTORS_FULL = [
  { id: '1', name: 'Dr. Tariq Mahmood', specialty: 'Cardiologist', qual: 'MBBS (KEMU), FCPS (Cardiology)', exp: '15 Years', fee: 2500, rating: 4.9, reviews: 342, avail: 'Mon - Sat (10 AM - 2 PM)', off: 'Sunday Off', initials: 'TM', bg: 'from-blue-600 to-blue-400' },
  { id: '2', name: 'Dr. Ayesha Khan', specialty: 'Dermatologist', qual: 'MBBS (Aga Khan), MCPS', exp: '8 Years', fee: 2000, rating: 4.8, reviews: 189, avail: 'Mon - Thu, Sat (4 PM - 8 PM)', off: 'Fri & Sun Off', initials: 'AK', bg: 'from-zinc-700 to-zinc-900' },
  { id: '3', name: 'Dr. Salman Raza', specialty: 'Pediatrician', qual: 'MBBS (Dow), FCPS, MRCPCH', exp: '12 Years', fee: 1800, rating: 4.9, reviews: 412, avail: 'Mon - Sat (9 AM - 1 PM)', off: 'Sunday Off', initials: 'SR', bg: 'from-cyan-400 to-blue-500' },
  { id: '4', name: 'Dr. Fatima Ali', specialty: 'Orthopedic Surgeon', qual: 'MBBS (AIMC), MS (Orthopedics)', exp: '10 Years', fee: 3000, rating: 4.7, reviews: 156, avail: 'Mon - Wed, Fri - Sat (2 PM - 6 PM)', off: 'Thu & Sun Off', initials: 'FA', bg: 'from-emerald-400 to-teal-500' },
  { id: '5', name: 'Dr. Usman Ahmed', specialty: 'General Physician', qual: 'MBBS (Nishtar), MD (Medicine)', exp: '5 Years', fee: 1500, rating: 4.6, reviews: 89, avail: 'Mon - Sat (6 PM - 10 PM)', off: 'Sunday Off', initials: 'UA', bg: 'from-orange-400 to-red-500' },
];

export default function DoctorsDirectory() {
  const router = useRouter();
  const supabase = createClient();
  const [checkingAuth, setCheckingAuth] = useState(false);

  const handleBookingAttempt = async (doctorId: string) => {
    setCheckingAuth(true);
    const { data: { session } } = await supabase.auth.getSession();
    setCheckingAuth(false);

    if (!session) {
      router.push('/login?returnTo=/book/' + doctorId);
    } else {
      router.push('/book/' + doctorId);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 md:py-20 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-300/10 dark:bg-blue-600/5 rounded-full blur-3xl -z-10 float-slow" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* ADDED BACK BUTTON HERE */}
          <Link href="/" className="inline-flex items-center gap-2 text-foreground-muted hover:text-primary font-bold mb-8 md:mb-12 transition-colors">
            <ArrowLeft className="w-5 h-5" /> 
            Back to Home
          </Link>

          <div className="mb-12 md:mb-16 text-center md:text-left space-y-4">
            <h1 className="text-4xl md:text-5xl font-black text-foreground">
              Our <span className="text-gradient">Specialists</span>
            </h1>
            <p className="text-lg text-foreground-muted font-medium max-w-2xl">
              Browse our verified healthcare professionals and find the perfect doctor for your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
            {MOCK_DOCTORS_FULL.map((doctor) => (
              <div key={doctor.id} className="glass-card p-6 md:p-8 rounded-3xl flex flex-col card-hover bg-white dark:bg-zinc-900 border border-blue-100 dark:border-zinc-800">
                
                <div className="flex items-start gap-4 mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-br ${doctor.bg} rounded-full flex items-center justify-center text-white font-black text-xl shadow-md shrink-0`}>
                    {doctor.initials}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-1">{doctor.name}</h3>
                    <p className="text-primary dark:text-blue-400 font-bold text-sm">{doctor.specialty}</p>
                    <p className="text-xs text-foreground-muted font-semibold mt-1">{doctor.qual} • {doctor.exp}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-8 flex-1 border-t border-border/50 pt-4">
                  <div className="flex items-center gap-2 text-foreground-muted text-sm font-medium">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-foreground font-bold">{doctor.rating}</span>
                    <span>({doctor.reviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground-muted text-sm font-medium">
                    <Clock className="w-4 h-4 text-green-500" />
                    <span className="text-foreground font-semibold">{doctor.avail}</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground-muted text-sm font-medium">
                    <CalendarOff className="w-4 h-4 text-red-400" />
                    <span className="text-red-500 dark:text-red-400 font-semibold">{doctor.off}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-auto">
                  <div>
                    <p className="text-xs text-foreground-muted font-medium mb-1">Consultation Fee</p>
                    <p className="text-xl font-black text-foreground">Rs. {doctor.fee}</p>
                  </div>
                  <Button 
                    onClick={() => handleBookingAttempt(doctor.id)}
                    disabled={checkingAuth}
                    className="hover-wave bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:shadow-glow transition-all duration-300 font-bold rounded-full border-0 px-6 btn-glow"
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}