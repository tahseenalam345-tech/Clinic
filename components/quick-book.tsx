'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, ArrowRight, User, X } from 'lucide-react';
import Link from 'next/link';

// Standard slots for the Quick Book UI
const STANDARD_SLOTS = ['10:00 AM', '11:30 AM', '04:00 PM', '05:30 PM'];

export function QuickBook() {
  const supabase = createClient();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');
  const [selectedSlot, setSelectedSlot] = useState<{ doctor: any, time: string } | null>(null);

  // --- LIVE DATA FETCHING ---
  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoading(true);
      // Fetch active doctors (limit to 5 for the quick-book section)
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'doctor')
        .limit(5);
        
      if (data) setDoctors(data);
      setIsLoading(false);
    };
    fetchDoctors();
  }, [supabase]);

  // Dynamically extract unique specialties from the live database
  const specialties = ['All Specialties', ...Array.from(new Set(doctors.map(d => d.specialty).filter(Boolean)))];

  // Filter doctors based on dropdown
  const filteredDoctors = selectedSpecialty === 'All Specialties' 
    ? doctors 
    : doctors.filter(d => d.specialty === selectedSpecialty);

  return (
    <section className="py-12 md:py-24 bg-gradient-to-b from-blue-50/30 to-background dark:from-zinc-950 dark:to-background relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Filter */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-foreground text-center md:text-left">
              Quick <span className="text-gradient drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">Availability</span>
            </h2>
            <p className="text-foreground-muted font-medium mt-2 text-center md:text-left">Select a specialty and grab an open slot instantly.</p>
          </div>

          <div className="relative w-full md:w-72">
            <select 
              value={selectedSpecialty}
              onChange={(e) => {
                setSelectedSpecialty(e.target.value);
                setSelectedSlot(null); 
              }}
              disabled={isLoading}
              className="w-full appearance-none bg-white dark:bg-zinc-900 border-2 border-blue-100 dark:border-zinc-800 text-foreground font-bold py-3 px-5 rounded-full focus:outline-none focus:border-primary hover:border-blue-300 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              {specialties.map((spec: any) => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-foreground-muted">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Main Grid: Doctors & Slots */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Doctor Slots */}
          <div className="lg:col-span-2 space-y-6">
            {isLoading ? (
               <div className="text-center p-8 glass-card rounded-3xl font-bold text-primary animate-pulse border border-dashed border-blue-200 dark:border-zinc-800">
                 Loading available slots from database...
               </div>
            ) : filteredDoctors.map((doc) => (
              <div key={doc.id} className="glass-card p-6 rounded-3xl bg-white dark:bg-[#111113] border border-blue-50 dark:border-zinc-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${doc.bg || 'from-blue-600 to-blue-400'} rounded-full flex items-center justify-center text-white font-black text-xs shadow-md shrink-0`}>
                      {doc.initials || doc.full_name?.substring(0, 2).toUpperCase() || 'DR'}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{doc.full_name}</h4>
                      <p className="text-xs text-primary font-semibold">{doc.specialty || 'General'}</p>
                    </div>
                  </div>
                  <div className="text-sm font-black text-foreground bg-blue-50 dark:bg-zinc-800 px-3 py-1 rounded-full w-fit">
                    Rs. {doc.fee || 1000}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  {STANDARD_SLOTS.map((time) => {
                    const isSelected = selectedSlot?.doctor.id === doc.id && selectedSlot?.time === time;
                    return (
                      <button
                        key={time}
                        onClick={() => setSelectedSlot({ doctor: doc, time })}
                        className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all duration-300 ${
                          isSelected 
                            ? 'bg-primary border-primary text-white shadow-md scale-105' 
                            : 'bg-background text-foreground border-blue-100 dark:border-zinc-700 hover:border-primary hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20'
                        }`}
                      >
                        {time}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}

            {!isLoading && filteredDoctors.length === 0 && (
              <div className="text-center p-8 glass-card rounded-3xl border border-dashed border-zinc-800">
                <p className="text-foreground-muted font-bold">No doctors found for this specialty.</p>
              </div>
            )}
          </div>

          {/* Right Column: Responsive Booking Pane */}
          <div className="lg:col-span-1 lg:relative">
            
            {/* Mobile Backdrop Overlay */}
            {selectedSlot && (
              <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
                onClick={() => setSelectedSlot(null)}
              />
            )}

            <div className={`
              /* Mobile Fixed Bottom Sheet Styles */
              fixed inset-x-0 bottom-0 z-50 p-4 pb-8 lg:pb-0
              /* Desktop Sticky Sidebar Styles */
              lg:sticky lg:top-32 lg:p-0 lg:inset-auto lg:z-auto
              /* Animations */
              transition-all duration-500 ease-out
              ${selectedSlot 
                ? 'translate-y-0 opacity-100' 
                : 'translate-y-[120%] lg:translate-y-4 opacity-0 lg:opacity-50 pointer-events-none'
              }
            `}>
              <div className="glass-card p-6 md:p-8 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-[0_-10px_40px_rgba(0,0,0,0.3)] lg:shadow-[0_0_40px_rgba(59,130,246,0.3)] relative overflow-hidden pointer-events-auto border-0">
                
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                
                {/* Mobile Close Button */}
                {selectedSlot && (
                  <button 
                    onClick={() => setSelectedSlot(null)}
                    className="lg:hidden absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors z-10"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                )}

                {selectedSlot ? (
                  <>
                    <h3 className="font-black text-xl mb-6 flex items-center gap-2 pr-8">
                      <Calendar className="w-5 h-5" />
                      Slot Selected
                    </h3>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-blue-200" />
                        <div>
                          <p className="text-xs text-blue-200 font-medium">Doctor</p>
                          <p className="font-bold">{selectedSlot.doctor.full_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-blue-200" />
                        <div>
                          <p className="text-xs text-blue-200 font-medium">Time</p>
                          <p className="font-bold">{selectedSlot.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 border-t border-white/20 pt-4 mt-2">
                        <div>
                          <p className="text-xs text-blue-200 font-medium">Consultation Fee</p>
                          <p className="font-black text-xl">Rs. {selectedSlot.doctor.fee || 1000}</p>
                        </div>
                      </div>
                    </div>

                    <Link href={`/book/${selectedSlot.doctor.id}`}>
                      <Button className="w-full bg-white text-blue-700 hover:bg-blue-50 font-black rounded-full py-6 text-base shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all hover-wave">
                        Proceed to Booking <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    </Link>
                  </>
                ) : (
                  // This empty state is now only seen on Desktop
                  <div className="text-center py-10">
                    <Clock className="w-12 h-12 mx-auto text-blue-200 mb-4 opacity-50" />
                    <h3 className="font-bold text-lg">Select a Time</h3>
                    <p className="text-blue-100 text-sm mt-2">Click on any available slot box to view details and proceed with booking.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}