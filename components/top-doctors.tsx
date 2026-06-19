'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';

export function TopDoctors() {
  const supabase = createClient();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopDoctors = async () => {
      setIsLoading(true);
      // Fetch up to 3 real doctors to feature on the home page
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'doctor')
        .limit(3);
        
      if (data) setDoctors(data);
      setIsLoading(false);
    };
    fetchTopDoctors();
  }, [supabase]);

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
              Top Rated <span className="text-primary drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">Specialists</span>
            </h2>
            <p className="text-foreground-muted font-medium max-w-2xl">
              Book appointments with our highest-rated and most experienced healthcare professionals.
            </p>
          </div>
          <Link href="/doctors" className="hidden md:block">
            <Button variant="outline" className="rounded-full font-bold border-blue-200 dark:border-zinc-800 hover-wave">
              View All Doctors
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="py-20 text-center font-bold text-primary animate-pulse text-xl">Loading Featured Specialists...</div>
        ) : doctors.length === 0 ? (
          <div className="glass-card py-20 text-center rounded-3xl border border-dashed border-border/50">
            <p className="text-foreground-muted font-bold">No doctors found in the database.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="glass-card p-6 md:p-8 rounded-3xl flex flex-col card-hover bg-white dark:bg-[#111113] border border-blue-100 dark:border-zinc-800 group transition-all">
                <div className="flex items-start gap-4 mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-br ${doctor.bg || 'from-blue-600 to-blue-400'} rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shrink-0 group-hover:scale-105 transition-transform`}>
                    {doctor.initials || doctor.full_name?.substring(0, 2).toUpperCase() || 'DR'}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-foreground mb-1">{doctor.full_name}</h3>
                    <p className="text-primary dark:text-blue-400 font-bold text-sm">{doctor.specialty || 'General Practitioner'}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs font-bold text-amber-500 bg-amber-500/10 w-fit px-2 py-0.5 rounded-md">
                      <Star className="w-3 h-3 fill-amber-500" /> {doctor.rating || '5.0'} ({doctor.reviews || '0'} reviews)
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6 flex-1">
                  <div className="flex items-center gap-3 text-sm font-medium text-foreground-muted">
                    <MapPin className="w-4 h-4 text-zinc-500" /> {doctor.hospital || 'Private Clinic'}, {doctor.city || 'Online'}
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-foreground-muted">
                    <Clock className="w-4 h-4 text-green-500" /> Available: {doctor.avail || 'Contact to check'}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-800 mt-auto">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-foreground-muted">Consultation Fee</p>
                    <p className="text-lg font-black text-foreground">Rs. {doctor.fee || '1000'}</p>
                  </div>
                  <Link href={`/book/${doctor.id}`}>
                    <Button className="rounded-full bg-primary hover:bg-blue-600 text-white font-bold hover-wave shadow-[0_0_15px_rgba(59,130,246,0.3)] border-0">
                      Book Now
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center md:hidden">
          <Link href="/doctors">
            <Button variant="outline" className="w-full rounded-full font-bold border-blue-200 dark:border-zinc-800 hover-wave">
              View All Doctors
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}