'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Clock, CalendarOff, ArrowLeft, Search, Filter, Building, Stethoscope } from 'lucide-react';
import Link from 'next/link';

export default function DoctorsDirectory() {
  const router = useRouter();
  const supabase = createClient();
  
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(false);

  // --- STATE FOR FILTERS ---
  const [searchTerm, setSearchTerm] = useState('');
  const [specialty, setSpecialty] = useState('All Specialties');
  const [city, setCity] = useState('All Cities');
  const [hospital, setHospital] = useState('All Hospitals');

  // --- FETCH LIVE DATA ---
  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoading(true);
      // Fetch only users who have the role of 'doctor'
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'doctor');
        
      if (data) setDoctors(data);
      setIsLoading(false);
    };
    fetchDoctors();
  }, [supabase]);

  // --- EXTRACT UNIQUE OPTIONS FOR DROPDOWNS ---
  const specialties = ['All Specialties', ...Array.from(new Set(doctors.map(d => d.specialty).filter(Boolean)))];
  const cities = ['All Cities', ...Array.from(new Set(doctors.map(d => d.city).filter(Boolean)))];
  const hospitals = ['All Hospitals', ...Array.from(new Set(doctors.map(d => d.hospital).filter(Boolean)))];

  // --- FILTER LOGIC ---
  const filteredDoctors = useMemo(() => {
    return doctors.filter(doctor => {
      const matchName = (doctor.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchSpecialty = specialty === 'All Specialties' || doctor.specialty === specialty;
      const matchCity = city === 'All Cities' || doctor.city === city;
      const matchHospital = hospital === 'All Hospitals' || doctor.hospital === hospital;
      
      return matchName && matchSpecialty && matchCity && matchHospital;
    });
  }, [doctors, searchTerm, specialty, city, hospital]);

  // --- BOOKING HANDLER ---
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

  // --- SHARED NEON STYLING ---
  const neonInputClass = "w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border-2 border-blue-100 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-blue-500 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-foreground font-bold text-sm appearance-none cursor-pointer";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 md:py-20 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-300/10 dark:bg-blue-600/5 rounded-full blur-3xl -z-10 float-slow" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <Link href="/" className="inline-flex items-center gap-2 text-foreground-muted hover:text-primary font-bold mb-8 md:mb-12 transition-colors">
            <ArrowLeft className="w-5 h-5" /> Back to Home
          </Link>

          <div className="mb-12 text-center md:text-left space-y-4">
            <h1 className="text-4xl md:text-5xl font-black text-foreground">
              Our <span className="text-gradient drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">Specialists</span>
            </h1>
            <p className="text-lg text-foreground-muted font-medium max-w-2xl">
              Search and book appointments with top-rated doctors across the country.
            </p>
          </div>

          {/* SEARCH & FILTER COMMAND CENTER */}
          <div className="glass-card p-6 rounded-3xl border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.05)] relative z-20 mb-12">
            <div className="flex items-center gap-2 mb-4 text-foreground font-black">
              <Filter className="w-5 h-5 text-primary" /> Advanced Search
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Name Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted pointer-events-none z-10" />
                <input 
                  type="text" 
                  placeholder="Doctor Name..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${neonInputClass} cursor-text`}
                />
              </div>

              {/* Specialty Dropdown */}
              <div className="relative">
                <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none z-10" />
                <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className={neonInputClass}>
                  {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* City Dropdown */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-500 pointer-events-none z-10" />
                <select value={city} onChange={(e) => setCity(e.target.value)} className={neonInputClass}>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Hospital Dropdown */}
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none z-10" />
                <select value={hospital} onChange={(e) => setHospital(e.target.value)} className={neonInputClass}>
                  {hospitals.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

            </div>
          </div>

          {/* RESULTS GRID */}
          {isLoading ? (
            <div className="py-20 text-center font-bold text-primary animate-pulse text-xl">Loading Live Database...</div>
          ) : filteredDoctors.length === 0 ? (
            <div className="glass-card py-20 text-center rounded-3xl border border-dashed border-border/50">
              <Search className="w-12 h-12 text-foreground-muted mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-foreground">No doctors found</h3>
              <p className="text-foreground-muted mt-2">Try adjusting your filters to see more results.</p>
              <Button onClick={() => { setSearchTerm(''); setSpecialty('All Specialties'); setCity('All Cities'); setHospital('All Hospitals'); }} variant="outline" className="mt-6 rounded-full font-bold">
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
              {filteredDoctors.map((doctor) => (
                <div key={doctor.id} className="glass-card p-6 md:p-8 rounded-3xl flex flex-col card-hover bg-white dark:bg-zinc-900 border border-blue-100 dark:border-zinc-800">
                  
                  <div className="flex items-start gap-4 mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${doctor.bg || 'from-blue-600 to-blue-400'} rounded-full flex items-center justify-center text-white font-black text-xl shadow-md shrink-0`}>
                      {doctor.initials || doctor.full_name?.substring(0, 2).toUpperCase() || 'DR'}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-1">{doctor.full_name}</h3>
                      <p className="text-primary dark:text-blue-400 font-bold text-sm">{doctor.specialty || 'General Practitioner'}</p>
                      <p className="text-xs text-foreground-muted font-semibold mt-1">{doctor.qual || 'MBBS'} • {doctor.exp || 'New'}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-8 flex-1 border-t border-border/50 pt-4">
                    <div className="flex items-center gap-2 text-foreground-muted text-sm font-medium">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-foreground font-bold">{doctor.rating || '5.0'}</span>
                      <span>({doctor.reviews || '0'} reviews)</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground-muted text-sm font-medium">
                      <Clock className="w-4 h-4 text-green-500" />
                      <span className="text-foreground font-semibold">{doctor.avail || 'Contact for availability'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground-muted text-sm font-medium">
                      <CalendarOff className="w-4 h-4 text-red-400" />
                      <span className="text-red-500 dark:text-red-400 font-semibold">{doctor.off_days || 'None'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground-muted text-sm font-medium">
                      <MapPin className="w-4 h-4 text-zinc-500" />
                      <span>{doctor.hospital || 'Private Clinic'}, {doctor.city || 'Online'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-auto">
                    <div>
                      <p className="text-xs text-foreground-muted font-medium mb-1">Consultation Fee</p>
                      <p className="text-xl font-black text-foreground">Rs. {doctor.fee || '1000'}</p>
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
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}