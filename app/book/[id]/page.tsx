'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Clock, CreditCard, Wallet, ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { MOCK_DOCTORS_FULL } from '@/app/doctors/page';

const DOCTOR_SLOTS: Record<string, string[]> = {
  '1': ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:30 PM', '01:00 PM', '01:30 PM'],
  '2': ['04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:30 PM', '07:00 PM', '07:30 PM'],
  '3': ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:30 AM', '12:00 PM', '12:30 PM'],
  '4': ['02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:30 PM', '05:00 PM', '05:30 PM'],
  '5': ['06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:30 PM', '09:00 PM', '09:30 PM'],
};

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  
  const doctorId = Array.isArray(params.id) ? params.id[0] : params.id;
  const doctor = MOCK_DOCTORS_FULL.find(d => d.id === doctorId) || MOCK_DOCTORS_FULL[0];
  const availableTimes = DOCTOR_SLOTS[doctor.id] || DOCTOR_SLOTS['1'];

  // Form State
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash'>('online');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Custom Calendar State
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Calendar Engine Helpers
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

  const handleSelectDate = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    // Format to a readable string (e.g., "Mon, Jun 24, 2026")
    setSelectedDate(newDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }));
    setShowCalendar(false);
    setSelectedTime(''); // Reset time when date changes
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) return;
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);
    setTimeout(() => router.push('/dashboard/patient'), 2000);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="glass-card p-12 text-center rounded-3xl max-w-md w-full mx-4 space-y-6">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-500/30">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-black text-foreground">Booking Confirmed!</h2>
          <p className="text-foreground-muted font-medium">
            Your appointment with {doctor.name} on {selectedDate} at {selectedTime} has been secured.
          </p>
          <p className="text-sm text-primary animate-pulse font-bold pt-4">
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl -z-10 float-slow" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/doctors" className="inline-flex items-center gap-2 text-foreground-muted hover:text-primary font-bold mb-8 transition-colors">
            <ArrowLeft className="w-5 h-5" /> Back to Specialists
          </Link>

          <div className="grid md:grid-cols-3 gap-8 items-start">
            {/* Left Column: Doctor Details */}
            <div className="md:col-span-1 space-y-6">
              <div className="glass-card p-6 rounded-3xl">
                <h3 className="font-bold text-foreground-muted text-sm uppercase tracking-wider mb-4">Doctor Details</h3>
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-14 h-14 bg-gradient-to-br ${doctor.bg} rounded-full flex items-center justify-center text-white font-black text-lg shadow-md shrink-0`}>
                    {doctor.initials}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{doctor.name}</h3>
                    <p className="text-primary dark:text-blue-400 font-bold text-xs mt-1">{doctor.specialty}</p>
                  </div>
                </div>
                
                <div className="border-t border-border/50 pt-4 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-foreground-muted font-medium">Consultation Fee</span>
                    <span className="text-foreground font-black">Rs. {doctor.fee}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-foreground-muted font-medium">Platform Fee</span>
                    <span className="text-foreground font-black">Rs. 100</span>
                  </div>
                  <div className="flex justify-between items-center text-base border-t border-border/50 pt-3 mt-3">
                    <span className="text-foreground font-bold">Total Amount</span>
                    <span className="text-primary dark:text-blue-400 font-black">Rs. {doctor.fee + 100}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Booking Steps */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Step 1 & 2 */}
              <div className="glass-card p-6 md:p-8 rounded-3xl space-y-8">
                
                {/* CUSTOM DATE PICKER */}
                <div className="relative">
                  <h3 className="font-bold text-foreground flex items-center gap-2 mb-4 text-lg">
                    <CalendarIcon className="w-5 h-5 text-primary" /> 1. Select Date
                  </h3>
                  
                  {/* Fake Input Trigger */}
                  <div 
                    onClick={() => setShowCalendar(true)}
                    className="w-full max-w-sm px-5 py-3.5 bg-white dark:bg-zinc-800 border border-blue-200 dark:border-zinc-700 rounded-2xl flex items-center justify-between cursor-pointer hover:border-primary transition-colors text-foreground font-bold shadow-sm"
                  >
                    <span>{selectedDate || 'Choose a date...'}</span>
                    <CalendarIcon className="w-5 h-5 text-foreground-muted" />
                  </div>
                  <p className="text-xs text-red-500 font-semibold mt-2 ml-2">Note: {doctor.off}. Bookings on these days will be invalid.</p>

                  {/* Calendar Dropdown Popup */}
                  {showCalendar && (
                    <>
                      {/* Invisible overlay to close calendar when clicking outside */}
                      <div className="fixed inset-0 z-40" onClick={() => setShowCalendar(false)} />
                      
                      <div className="absolute top-[85px] left-0 mt-2 w-full max-w-sm z-50 glass-card bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-blue-200 dark:border-zinc-700 shadow-2xl rounded-2xl p-5 animate-in fade-in slide-in-from-top-2">
                        
                        {/* Month/Year Header */}
                        <div className="flex items-center justify-between mb-4">
                          <button onClick={prevMonth} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-foreground">
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <div className="font-black text-foreground text-lg">
                            {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                          </div>
                          <button onClick={nextMonth} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-foreground">
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Days of Week */}
                        <div className="grid grid-cols-7 mb-2">
                          {DAYS_OF_WEEK.map(day => (
                            <div key={day} className="text-center text-xs font-bold text-foreground-muted pb-2">
                              {day}
                            </div>
                          ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1">
                          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                            <div key={`empty-${i}`} className="p-2" />
                          ))}
                          {Array.from({ length: daysInMonth }).map((_, i) => {
                            const dayNumber = i + 1;
                            const isToday = dayNumber === new Date().getDate() && currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear();
                            
                            // Check if this day matches the currently selected date
                            const currentDateObj = selectedDate ? new Date(selectedDate) : null;
                            const isSelected = currentDateObj?.getDate() === dayNumber && currentDateObj?.getMonth() === currentMonth.getMonth() && currentDateObj?.getFullYear() === currentMonth.getFullYear();

                            return (
                              <button
                                key={dayNumber}
                                onClick={() => handleSelectDate(dayNumber)}
                                className={`h-10 w-full flex items-center justify-center rounded-xl text-sm font-bold transition-all hover-wave ${
                                  isSelected
                                    ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-glow'
                                    : isToday
                                    ? 'bg-blue-100 dark:bg-blue-900/40 text-primary dark:text-blue-400'
                                    : 'text-foreground hover:bg-black/5 dark:hover:bg-white/10'
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
                  <h3 className="font-bold text-foreground flex items-center gap-2 mb-4 text-lg">
                    <Clock className="w-5 h-5 text-primary" /> 2. Select Time ({doctor.avail})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {availableTimes.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-3 px-4 hover-wave rounded-xl font-bold text-sm transition-all border ${
                          selectedTime === time 
                            ? 'bg-primary text-white border-primary shadow-md scale-105' 
                            : 'bg-white dark:bg-zinc-800 text-foreground border-blue-200 dark:border-zinc-700 hover:border-primary hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 3: Payment */}
              <div className={`glass-card p-6 md:p-8 rounded-3xl space-y-6 ${(!selectedDate || !selectedTime) ? 'opacity-50 pointer-events-none' : ''}`}>
                <h3 className="font-bold text-foreground text-lg">3. Payment Method</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <button onClick={() => setPaymentMethod('online')} className={`hover-wave p-5 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all ${paymentMethod === 'online' ? 'border-primary bg-blue-50/50 dark:bg-blue-900/20' : 'border-blue-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-blue-300'}`}>
                    <CreditCard className={`w-8 h-8 ${paymentMethod === 'online' ? 'text-primary' : 'text-foreground-muted'}`} />
                    <div className="text-center"><div className="font-bold text-foreground">Pay Online</div><div className="text-xs text-foreground-muted mt-1">Debit / Credit Card</div></div>
                  </button>
                  <button onClick={() => setPaymentMethod('cash')} className={`hover-wave p-5 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all ${paymentMethod === 'cash' ? 'border-primary bg-blue-50/50 dark:bg-blue-900/20' : 'border-blue-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-blue-300'}`}>
                    <Wallet className={`w-8 h-8 ${paymentMethod === 'cash' ? 'text-primary' : 'text-foreground-muted'}`} />
                    <div className="text-center"><div className="font-bold text-foreground">Pay at Clinic</div><div className="text-xs text-foreground-muted mt-1">Cash on arrival</div></div>
                  </button>
                </div>

                <Button onClick={handleBooking} disabled={isSubmitting} className="hover-wave w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:shadow-glow transition-all duration-300 font-bold py-6 text-base rounded-full btn-glow border-0 mt-4">
                  {isSubmitting ? 'Confirming Appointment...' : `Confirm Booking • Rs. ${doctor.fee + 100}`}
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