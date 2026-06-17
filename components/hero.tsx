'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, PhoneCall, MessageCircle, MapPin, Star } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// Real Pakistani Doctor Data for Hero
const HERO_DOCTORS = [
  { id: '1', name: 'Dr. Tariq Mahmood', spec: 'Cardiologist (FCPS)', initials: 'TM', bg: 'from-blue-600 to-blue-400', slot: '10:00 AM' },
  { id: '2', name: 'Dr. Ayesha Khan', spec: 'Dermatologist (MCPS)', initials: 'AK', bg: 'from-zinc-700 to-zinc-900', slot: '04:00 PM' },
  { id: '3', name: 'Dr. Salman Raza', spec: 'Pediatrician (MRCPCH)', initials: 'SR', bg: 'from-cyan-400 to-blue-500', slot: '09:00 AM' }
];

export function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return; 
    
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % HERO_DOCTORS.length);
    }, 2500); 
    
    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <section className="relative py-10 sm:py-16 md:py-24 lg:py-32 overflow-hidden z-0">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-20" style={{ backgroundImage: 'url("/bg.png")' }} />
      <div className="absolute inset-0 bg-white/70 dark:bg-zinc-950/60 backdrop-blur-sm -z-10" />
      <div className="absolute top-10 right-10 w-48 h-48 md:w-80 md:h-80 bg-blue-500/30 dark:bg-blue-600/20 rounded-full blur-3xl -z-10 float-slower" />
      <div className="absolute bottom-0 left-20 w-64 h-64 md:w-96 md:h-96 bg-cyan-400/30 dark:bg-cyan-600/20 rounded-full blur-3xl -z-10 float-slow" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 md:gap-12 lg:gap-8 items-center">
          
          <div className="space-y-6 md:space-y-8 text-center lg:text-left pt-4 md:pt-0">
            <div className="glass w-fit px-4 py-2 mx-auto lg:mx-0 card-hover rounded-full border-blue-200/50">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-blue-500 animate-pulse" />
                <span className="text-primary dark:text-blue-400 font-bold text-xs md:text-sm uppercase tracking-wider">Crescent Care Medical Center, Lahore</span>
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-foreground leading-tight tracking-tight drop-shadow-sm">
              Book Your Doctor <br className="hidden md:block"/> <span className="text-gradient">Appointment</span> Online
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-foreground-muted leading-relaxed max-w-lg mx-auto lg:mx-0 font-medium drop-shadow-sm">
              Schedule appointments with Lahore's top specialists. Expert healthcare, fast bookings, and secure digital records.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2 justify-center lg:justify-start">
              <Link href="/doctors" className="w-full sm:w-auto">
                <Button size="lg" className="hover-wave bg-gradient-to-r from-blue-500 to-blue-700 text-white gap-2 shadow-glow hover:shadow-2xl transition-all duration-300 font-bold btn-glow h-12 px-6 md:px-8 text-base rounded-full border-0 w-full">
                  Book Online
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <a href="https://wa.me/923261688628" target="_blank" rel="noreferrer" className="w-full sm:w-auto">
                  <Button size="lg" className="hover-wave bg-green-500 hover:bg-green-600 text-white gap-2 font-bold transition-all h-12 px-4 sm:px-6 text-base rounded-full border-0 w-full shadow-lg shadow-green-500/20">
                    <MessageCircle className="w-5 h-5" />
                    WhatsApp
                  </Button>
                </a>
                <a href="tel:051999999" className="w-full sm:w-auto">
                  <Button size="lg" className="hover-wave bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 gap-2 font-bold transition-all h-12 px-4 sm:px-6 text-base rounded-full border-0 w-full shadow-lg">
                    <PhoneCall className="w-5 h-5" />
                    Call Us
                  </Button>
                </a>
              </div>
            </div>
          </div>

          <div 
            className="relative h-[420px] md:h-[500px] lg:h-[600px] flex items-center justify-center mt-12 lg:mt-0 w-full max-w-md mx-auto perspective-1000 pb-12 cursor-pointer group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => setIsHovered(!isHovered)}
          >
            {HERO_DOCTORS.map((doc, index) => {
              const position = (index - activeIndex + HERO_DOCTORS.length) % HERO_DOCTORS.length;
              let transformClasses = '';
              let opacityClasses = '';
              let zIndex = '';

              if (isHovered) {
                if (index === 0) transformClasses = 'scale-100 -translate-y-24 md:-translate-y-32 -translate-x-2 md:-translate-x-4';
                if (index === 1) transformClasses = 'scale-100 translate-y-0 translate-x-0';
                if (index === 2) transformClasses = 'scale-100 translate-y-24 md:translate-y-32 translate-x-2 md:translate-x-4';
                opacityClasses = 'opacity-100';
                zIndex = index === 0 ? 'z-30' : index === 1 ? 'z-20' : 'z-10';
              } else {
                if (position === 0) { transformClasses = 'scale-100 translate-y-12 translate-x-4 md:translate-x-6'; opacityClasses = 'opacity-100'; zIndex = 'z-30'; }
                if (position === 1) { transformClasses = 'scale-95 translate-y-0 -translate-x-4 md:-translate-x-6'; opacityClasses = 'opacity-80'; zIndex = 'z-20'; }
                if (position === 2) { transformClasses = 'scale-90 -translate-y-12 translate-x-8 md:translate-x-12'; opacityClasses = 'opacity-40'; zIndex = 'z-10'; }
              }

              return (
                <div 
                  key={doc.id}
                  className={`absolute p-5 md:p-6 rounded-3xl w-[90%] sm:w-80 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-[0_20px_50px_-12px_rgba(59,130,246,0.3)] bg-white/70 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/50 dark:border-zinc-700/50 ${transformClasses} ${opacityClasses} ${zIndex}`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <div className={`w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br ${doc.bg} rounded-full flex items-center justify-center text-white font-black text-lg md:text-xl shadow-lg`}>
                        {doc.initials}
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 md:w-4 md:h-4 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full"></div>
                    </div>
                    <div>
                      <h3 className="font-black text-foreground text-base md:text-lg">{doc.name}</h3>
                      <p className="text-xs md:text-sm text-primary font-bold">{doc.spec}</p>
                      <p className="text-[10px] md:text-xs text-foreground-muted mt-1 font-medium">Next Slot: {doc.slot}</p>
                    </div>
                  </div>
                  
                  <div className={`transition-opacity duration-300 ${isHovered || position === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <Link href={`/book/${doc.id}`}>
                      <Button className="w-full hover-wave bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 rounded-full font-bold transition-colors text-xs md:text-sm h-9 md:h-10">
                        Book Slot
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}

            <div className={`absolute -bottom-6 md:-bottom-2 left-1/2 -translate-x-1/2 transition-all duration-700 z-40 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
              <Link href="/doctors">
                <Button className="rounded-full hover-wave shadow-2xl bg-foreground text-background hover:bg-foreground/90 font-bold px-6 py-5 md:px-8 md:py-6 text-sm md:text-base border-4 border-background dark:border-zinc-950">
                   View All Specialists <ArrowRight className="ml-2 w-4 h-4"/>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}