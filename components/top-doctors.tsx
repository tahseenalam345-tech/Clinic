'use client';

import { Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const TOP_DOCTORS = [
  { 
    id: '1', name: 'Dr. Tariq Mahmood', specialty: 'Cardiologist', qual: 'MBBS (KEMU), FCPS',
    fee: 2500, rating: 4.9, initials: 'TM', bg: 'from-blue-600 to-blue-400' 
  },
  { 
    id: '2', name: 'Dr. Ayesha Khan', specialty: 'Dermatologist', qual: 'MBBS (AKU), MCPS',
    fee: 2000, rating: 4.8, initials: 'AK', bg: 'from-zinc-700 to-zinc-900' 
  },
  { 
    id: '3', name: 'Dr. Salman Raza', specialty: 'Pediatrician', qual: 'MBBS (Dow), MRCPCH',
    fee: 1800, rating: 4.9, initials: 'SR', bg: 'from-cyan-400 to-blue-500' 
  },
];

export function TopDoctors() {
  return (
    <section className="py-10 md:py-24 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-4 md:gap-6">
          <div className="space-y-2 md:space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground">
              Our <span className="text-gradient">Specialists</span>
            </h2>
            <p className="text-foreground-muted font-medium text-base md:text-lg">Meet our highly qualified medical professionals.</p>
          </div>
          <Link href="/doctors">
            <Button variant="outline" className="rounded-full hover-wave font-bold border-blue-200 dark:border-zinc-700 w-full sm:w-auto mt-2 md:mt-0">
              View All Doctors
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          {TOP_DOCTORS.map((doctor) => (
            <div key={doctor.id} className="glass-card p-6 rounded-3xl flex flex-col card-hover bg-white dark:bg-zinc-900 border border-blue-100 dark:border-zinc-800">
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${doctor.bg} rounded-full flex items-center justify-center text-white font-black text-lg shadow-md shrink-0`}>
                  {doctor.initials}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{doctor.name}</h3>
                  <p className="text-primary dark:text-blue-400 font-bold text-sm">{doctor.specialty}</p>
                  <p className="text-xs text-foreground-muted font-medium mt-1">{doctor.qual}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                <div className="flex items-center gap-1 text-sm font-bold text-foreground">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  {doctor.rating}
                </div>
                <div className="text-sm font-black text-foreground">
                  Rs. {doctor.fee}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}