'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Clock, CreditCard, Wallet, ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, ShieldCheck, X, Lock } from 'lucide-react';
import Link from 'next/link';

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// Standard slots generator (In a real app, this would check a doctor's booked slots table)
const STANDARD_SLOTS = ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'];

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  
  const doctorId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  // Live Database States
  const [doctor, setDoctor] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [isLoadingDB, setIsLoadingDB] = useState(true);

  // Booking States
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedDateDBFormat, setSelectedDateDBFormat] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash'>('online');
  
  // Payment & Success States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Custom Calendar State
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // --- FETCH LIVE DOCTOR & PATIENT DATA ---
  useEffect(() => {
    const fetchBookingData = async () => {
      setIsLoadingDB(true);
      
      // 1. Fetch Doctor Details
      const { data: docData } = await supabase.from('profiles').select('*').eq('id', doctorId).single();
      if (docData) setDoctor(docData);

      // 2. Fetch Current Logged-in Patient
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: patData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (patData) setPatient(patData);
      }

      setIsLoadingDB(false);
    };
    
    if (doctorId) fetchBookingData();
  }, [doctorId, supabase]);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

  const handleSelectDate = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }));
    
    // Format YYYY-MM-DD safely for Supabase DATE column
    const offset = newDate.getTimezoneOffset();
    const localDate = new Date(newDate.getTime() - (offset * 60 * 1000));
    setSelectedDateDBFormat(localDate.toISOString().split('T')[0]);
    
    setShowCalendar(false);
    setSelectedTime(''); 
  };

  const handleInitialBookingClick = () => {
    if (!selectedDate || !selectedTime) return;
    if (!patient) {
      alert("Please log in to book an appointment.");
      router.push('/login?returnTo=/book/' + doctorId);
      return;
    }
    
    if (paymentMethod === 'online') {
      setShowPaymentModal(true);
    } else {
      processFinalBooking();
    }
  };

  // --- REAL SUPABASE INSERTION ---
  const processFinalBooking = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsProcessingPayment(true);

    const feeToCharge = doctor?.fee || 1000;
    const diseaseOrReason = patient?.current_symptoms || 'General Checkup';

    const { error } = await supabase.from('appointments').insert([{
      doctor_id: doctor.id,
      patient_id: patient.id,
      patient_name: patient.full_name || 'Patient',
      disease: diseaseOrReason,
      appointment_date: selectedDateDBFormat,
      appointment_time: selectedTime,
      type: 'Consultation',
      payment_method: paymentMethod === 'online' ? 'Online' : 'Cash',
      fee: feeToCharge,
      status: 'Pending'
    }]);

    setIsProcessingPayment(false);

    if (error) {
      alert("Failed to book appointment. Error: " + error.message);
      return;
    }

    setShowPaymentModal(false);
    setIsSuccess(true);
    setTimeout(() => router.push('/dashboard/patient'), 2000);
  };

  if (isLoadingDB) {
    return <div className="min-h-screen flex items-center justify-center font-black text-primary animate-pulse">Loading Secure Booking Engine...</div>;
  }

  if (!doctor) {
    return <div className="min-h-screen flex flex-col items-center justify-center font-bold text-foreground">Doctor not found. <Link href="/doctors" className="text-primary mt-4">Go Back</Link></div>;
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="glass-card p-12 text-center rounded-3xl max-w-md w-full mx-4 space-y-6 border border-green-500/30 shadow-[0_0_50px_rgba(34,197,94,0.1)] animate-in zoom-in">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(34,197,94,0.4)]">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-black text-foreground">Booking Confirmed!</h2>
          <p className="text-foreground-muted font-medium">
            Your appointment with {doctor.full_name} on {selectedDate} at {selectedTime} has been securely saved to the database.
          </p>
          <p className="text-sm text-primary animate-pulse font-bold pt-4">
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      <Header />

      {/* PAYMENT GATEWAY MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isProcessingPayment && setShowPaymentModal(false)} />
          <div className="glass-card bg-[#0a0a0c]/95 w-full max-w-md rounded-3xl z-10 p-8 border border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.3)] animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-foreground flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-green-500"/> Secure Checkout
              </h2>
              {!isProcessingPayment && (
                <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-white/10 rounded-full">
                  <X className="w-5 h-5 text-foreground"/>
                </button>
              )}
            </div>
            
            <form onSubmit={processFinalBooking} className="space-y-5 relative">
              <div className="bg-[#111113] border border-zinc-800 p-4 rounded-2xl flex justify-between items-center mb-6 shadow-inner">
                <span className="font-bold text-foreground-muted">Total to pay</span>
                <span className="text-2xl font-black text-primary">Rs. {doctor.fee + 100}</span>
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2 ml-1">Card / Account Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted z-10" />
                  <input type="text" required placeholder="0000 0000 0000 0000" className="w-full pl-12 pr-4 py-3 bg-[#111113] border-2 border-zinc-800 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-white font-medium tracking-widest relative z-0 transition-all"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2 ml-1">Expiry Date</label>
                  <input type="text" required placeholder="MM/YY" className="w-full px-4 py-3 bg-[#111113] border-2 border-zinc-800 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-white font-medium text-center transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2 ml-1">CVV</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted z-10" />
                    <input type="password" required placeholder="***" maxLength={3} className="w-full pl-10 pr-4 py-3 bg-[#111113] border-2 border-zinc-800 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-white font-medium tracking-widest text-center relative z-0 transition-all" />
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={isProcessingPayment} className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-full font-black py-6 mt-4 hover-wave shadow-[0_0_20px_rgba(59,130,246,0.4)] border-0 text-lg">
                {isProcessingPayment ? 'Processing Payment...' : `Pay Rs. ${doctor.fee + 100}`}
              </Button>
              <p className="text-center text-xs text-foreground-muted font-medium mt-4 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" /> Payments are 256-bit encrypted.
              </p>
            </form>
          </div>
        </div>
      )}

      <main className="flex-1 py-12 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10 float-slow" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/doctors" className="inline-flex items-center gap-2 text-foreground-muted hover:text-primary font-bold mb-8 transition-colors">
            <ArrowLeft className="w-5 h-5" /> Back to Specialists
          </Link>

          <div className="grid md:grid-cols-3 gap-8 items-start">
            {/* Left Column: Doctor Details */}
            <div className="md:col-span-1 space-y-6 relative z-10">
              <div className="glass-card p-6 md:p-8 rounded-3xl border border-blue-500/20 shadow-lg">
                <h3 className="font-black text-foreground-muted text-xs uppercase tracking-wider mb-6 pb-2 border-b border-zinc-800">Doctor Profile</h3>
                <div className="flex flex-col items-center text-center gap-4 mb-6">
                  <div className={`w-24 h-24 bg-gradient-to-br ${doctor.bg || 'from-blue-600 to-blue-400'} rounded-full flex items-center justify-center text-white font-black text-3xl shadow-[0_0_20px_rgba(59,130,246,0.3)] shrink-0`}>
                    {doctor.initials || doctor.full_name?.substring(0, 2).toUpperCase() || 'DR'}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-foreground">{doctor.full_name}</h3>
                    <p className="text-primary dark:text-blue-400 font-bold text-sm mt-1">{doctor.specialty || 'General Practitioner'}</p>
                    <p className="text-xs text-foreground-muted font-medium mt-1">{doctor.qual}</p>
                  </div>
                </div>
                
                <div className="border-t border-zinc-800 pt-6 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-foreground-muted font-bold">Consultation Fee</span>
                    <span className="text-foreground font-black">Rs. {doctor.fee || 1000}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-foreground-muted font-bold">Platform Fee</span>
                    <span className="text-foreground font-black">Rs. 100</span>
                  </div>
                  <div className="flex justify-between items-center text-base border-t border-zinc-800 pt-4 mt-2">
                    <span className="text-foreground font-black">Total Amount</span>
                    <span className="text-primary dark:text-blue-400 font-black text-xl">Rs. {(doctor.fee || 1000) + 100}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Booking Steps */}
            <div className="md:col-span-2 space-y-6">
              
              <div className="glass-card p-6 md:p-8 rounded-3xl space-y-8 border border-zinc-800">
                <div className="relative">
                  <h3 className="font-black text-foreground flex items-center gap-2 mb-4 text-lg">
                    <CalendarIcon className="w-5 h-5 text-primary drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]" /> 1. Select Date
                  </h3>
                  
                  <div 
                    onClick={() => setShowCalendar(true)}
                    className="w-full max-w-sm px-5 py-3.5 bg-[#111113] border-2 border-zinc-800 hover:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-2xl flex items-center justify-between cursor-pointer transition-all text-white font-bold"
                  >
                    <span>{selectedDate || 'Choose an available date...'}</span>
                    <CalendarIcon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-xs text-amber-500 font-bold mt-3 ml-2 flex items-center gap-1">Note: Doctor is off on {doctor.off_days || 'Sundays'}.</p>

                  {showCalendar && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowCalendar(false)} />
                      <div className="absolute top-[85px] left-0 mt-2 w-full max-w-sm z-50 glass-card bg-[#0a0a0c]/95 backdrop-blur-xl border border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.3)] rounded-3xl p-5 animate-in zoom-in-95">
                        <div className="flex items-center justify-between mb-4">
                          <button onClick={prevMonth} className="p-2 hover:bg-blue-500/20 rounded-full transition-colors text-primary"><ChevronLeft className="w-5 h-5" /></button>
                          <div className="font-black text-white text-lg">{MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}</div>
                          <button onClick={nextMonth} className="p-2 hover:bg-blue-500/20 rounded-full transition-colors text-primary"><ChevronRight className="w-5 h-5" /></button>
                        </div>
                        <div className="grid grid-cols-7 mb-2">
                          {DAYS_OF_WEEK.map(day => <div key={day} className="text-center text-xs font-bold text-primary/70 pb-2">{day}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className="p-2" />)}
                          {Array.from({ length: daysInMonth }).map((_, i) => {
                            const dayNumber = i + 1;
                            const isToday = dayNumber === new Date().getDate() && currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear();
                            const currentDateObj = selectedDate ? new Date(selectedDate) : null;
                            const isSelected = currentDateObj?.getDate() === dayNumber && currentDateObj?.getMonth() === currentMonth.getMonth() && currentDateObj?.getFullYear() === currentMonth.getFullYear();

                            return (
                              <button
                                key={dayNumber}
                                onClick={() => handleSelectDate(dayNumber)}
                                className={`h-10 w-full flex items-center justify-center rounded-xl text-sm font-bold transition-all hover-wave ${
                                  isSelected ? 'bg-primary text-white shadow-[0_0_15px_rgba(59,130,246,0.8)]' : isToday ? 'bg-blue-500/20 text-blue-400' : 'text-foreground hover:bg-zinc-800'
                                }`}
                              >
                                {dayNumber}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className={!selectedDate ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}>
                  <h3 className="font-black text-foreground flex items-center gap-2 mb-4 text-lg">
                    <Clock className="w-5 h-5 text-primary drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]" /> 2. Select Time
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {STANDARD_SLOTS.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-3 px-4 hover-wave rounded-xl font-bold text-sm transition-all border-2 ${
                          selectedTime === time ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-105' : 'bg-[#111113] text-foreground border-zinc-800 hover:border-blue-500/50 hover:text-blue-400'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className={`glass-card p-6 md:p-8 rounded-3xl space-y-6 border border-zinc-800 ${(!selectedDate || !selectedTime) ? 'opacity-50 pointer-events-none' : ''}`}>
                <h3 className="font-black text-foreground text-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]" /> 3. Payment Method
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <button onClick={() => setPaymentMethod('online')} className={`hover-wave p-5 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${paymentMethod === 'online' ? 'border-primary bg-blue-500/10 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]' : 'border-zinc-800 bg-[#111113] hover:border-blue-500/50'}`}>
                    <CreditCard className={`w-8 h-8 ${paymentMethod === 'online' ? 'text-primary drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]' : 'text-foreground-muted'}`} />
                    <div className="text-center"><div className="font-black text-foreground">Pay Online</div><div className="text-xs text-foreground-muted mt-1 font-medium">Debit / Credit Card</div></div>
                  </button>
                  <button onClick={() => setPaymentMethod('cash')} className={`hover-wave p-5 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${paymentMethod === 'cash' ? 'border-primary bg-blue-500/10 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]' : 'border-zinc-800 bg-[#111113] hover:border-blue-500/50'}`}>
                    <Wallet className={`w-8 h-8 ${paymentMethod === 'cash' ? 'text-primary drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]' : 'text-foreground-muted'}`} />
                    <div className="text-center"><div className="font-black text-foreground">Pay at Clinic</div><div className="text-xs text-foreground-muted mt-1 font-medium">Cash on arrival</div></div>
                  </button>
                </div>

                <Button 
                  onClick={handleInitialBookingClick} 
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all duration-300 font-black py-7 text-base rounded-full btn-glow border-0 mt-6 hover-wave"
                >
                  Confirm Booking • Rs. {(doctor.fee || 1000) + 100}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}