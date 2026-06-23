'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { Calendar, Clock, User, X, Edit2, AlertCircle, CheckCircle2, ArrowLeft, History } from 'lucide-react';
import Link from 'next/link';

export default function PatientDashboard() {
  const supabase = createClient();
  const router = useRouter();
  
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [patient, setPatient] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  
  // --- ROLE GUARD & LIVE DATA FETCHING ---
  // --- ROLE GUARD ---
 // Put this at the top of your Patient dashboard
  // --- ROLE GUARD ---
  useEffect(() => {
    const checkRoleAndFetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      
      // Treat missing roles as 'patient' by default to prevent loops
      // Treat missing roles as 'patient' by default to prevent loops
      const userRole = profile?.role || 'patient';
      
      // KICK OUT doctors (unless they are an admin!)
      if (userRole === 'doctor') {
        window.location.href = '/dashboard/doctor';
        return;
      } 
      // Admins and Patients are allowed to stay here!
      
      // If they are a patient (or defaulted to patient), let them in!
      setPatient(profile);
      setCheckingAuth(false);

      // Fetch Real Appointments from Supabase
      const { data: appts } = await supabase
        .from('appointments')
        .select(`*, doctor:profiles!doctor_id(full_name, specialty, bg, initials)`)
        .eq('patient_id', user.id)
        .order('appointment_date', { ascending: false });

      if (appts) setAppointments(appts);
    };
    checkRoleAndFetchData();
  }, [router, supabase]);

  // Modal States
  const [cancelModal, setCancelModal] = useState<{ isOpen: boolean, apptId: string | null }>({ isOpen: false, apptId: null });
  const [rescheduleModal, setRescheduleModal] = useState<{ isOpen: boolean, apptId: string | null }>({ isOpen: false, apptId: null });
  
  // Reschedule Form States
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  // --- LIVE DATABASE ACTIONS ---
  const handleCancel = async () => {
    if (cancelModal.apptId) {
      // 1. Optimistic UI Update (Instant feedback)
      setAppointments(current => 
        current.map(appt => appt.id === cancelModal.apptId ? { ...appt, status: 'Canceled' } : appt)
      );
      // 2. Real Database Update
      await supabase.from('appointments').update({ status: 'Canceled' }).eq('id', cancelModal.apptId);
      
      setCancelModal({ isOpen: false, apptId: null });
    }
  };

  const handleReschedule = async () => {
    if (rescheduleModal.apptId && newDate && newTime) {
      // 1. Optimistic UI Update
      setAppointments(current => 
        current.map(appt => appt.id === rescheduleModal.apptId ? { ...appt, appointment_date: newDate, appointment_time: newTime } : appt)
      );
      // 2. Real Database Update
      await supabase.from('appointments').update({ appointment_date: newDate, appointment_time: newTime }).eq('id', rescheduleModal.apptId);
      
      setRescheduleModal({ isOpen: false, apptId: null });
      setNewDate('');
      setNewTime('');
    }
  };

  const upcoming = appointments.filter(a => a.status === 'Pending' || a.status === 'Upcoming' || a.status === 'Confirmed');
  const past = appointments.filter(a => a.status === 'Completed' || a.status === 'Canceled');

  if (checkingAuth) return <div className="min-h-screen flex items-center justify-center font-bold text-primary animate-pulse">Loading Secure Dashboard...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      <Header />

      {/* CANCEL MODAL */}
      {cancelModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setCancelModal({ isOpen: false, apptId: null })} />
          <div className="glass-card bg-background/95 w-full max-w-md rounded-3xl z-10 p-8 border border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.1)] animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-foreground text-center mb-2">Cancel Appointment?</h2>
            <p className="text-foreground-muted text-center mb-8 font-medium">Are you sure you want to cancel this appointment? This action cannot be undone.</p>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Button onClick={() => setCancelModal({ isOpen: false, apptId: null })} variant="outline" className="flex-1 rounded-full hover-wave">Keep It</Button>
              <Button onClick={handleCancel} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-full border-0 hover-wave">Yes, Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {rescheduleModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setRescheduleModal({ isOpen: false, apptId: null })} />
          <div className="glass-card bg-background/95 w-full max-w-md rounded-3xl z-10 p-8 border border-blue-500/30 shadow-glow animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-foreground flex items-center gap-2"><Edit2 className="w-5 h-5 text-primary"/> Reschedule</h2>
              <button onClick={() => setRescheduleModal({ isOpen: false, apptId: null })} className="p-2 hover:bg-white/10 rounded-full"><X className="w-5 h-5 text-foreground"/></button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2 ml-2">New Date</label>
                <input 
                  type="date" 
                  className="w-full px-5 py-3 bg-white dark:bg-zinc-800 border border-blue-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground font-medium cursor-pointer"
                  onChange={(e) => setNewDate(e.target.value)}
                  onClick={(e) => { if ('showPicker' in HTMLInputElement.prototype) { (e.target as HTMLInputElement).showPicker(); } }}
                />
              </div>
              <div className={!newDate ? 'opacity-50 pointer-events-none' : ''}>
                <label className="block text-sm font-bold text-foreground mb-2 ml-2">New Time Slot</label>
                <div className="grid grid-cols-2 gap-2">
                  {['10:00 AM', '11:00 AM', '04:00 PM', '05:00 PM'].map((time) => (
                    <button
                      key={time}
                      onClick={() => setNewTime(time)}
                      className={`py-2 px-4 rounded-xl font-bold text-sm transition-all border ${
                        newTime === time 
                          ? 'bg-primary text-white border-primary' 
                          : 'bg-transparent text-foreground border-border hover:border-primary'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={handleReschedule} disabled={!newDate || !newTime} className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-full font-bold py-6 hover-wave btn-glow border-0">
                Confirm New Schedule
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 py-10 md:py-16 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-10" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <Link href="/" className="inline-flex items-center gap-2 text-foreground-muted hover:text-primary font-bold mb-4 transition-colors">
                <ArrowLeft className="w-5 h-5" /> Back to Home
              </Link>
              <h1 className="text-3xl md:text-4xl font-black text-foreground">
                Hello, <span className="text-primary dark:text-blue-400">{patient?.full_name || 'Patient'}</span> 👋
              </h1>
              <p className="text-foreground-muted font-medium mt-1">Manage your appointments and medical records.</p>
            </div>
            <Link href="/dashboard/profile">
              <Button variant="outline" className="rounded-full font-bold border-blue-200 dark:border-zinc-700 hover-wave">
                <User className="w-4 h-4 mr-2" /> My Profile & Records
              </Button>
            </Link>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary" /> Upcoming Appointments
            </h2>
            
            {upcoming.length === 0 ? (
              <div className="glass-card p-10 rounded-3xl text-center border-dashed border-2 border-border/50">
                <p className="text-foreground-muted font-bold mb-4">You have no upcoming appointments.</p>
                <Link href="/doctors">
                  <Button className="rounded-full bg-primary text-white hover-wave px-8">Book a Doctor</Button>
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {upcoming.map((appt) => {
                  // Fallbacks in case the doctor table join returns null
                  const docName = appt.doctor?.full_name || 'Doctor';
                  const docSpecialty = appt.doctor?.specialty || 'Consultation';
                  const docInitials = appt.doctor?.initials || 'DR';
                  const docBg = appt.doctor?.bg || 'from-blue-600 to-blue-400';

                  return (
                    <div key={appt.id} className="glass-card p-6 rounded-3xl border border-blue-500/20 shadow-[0_10px_30px_rgba(59,130,246,0.1)] relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                      
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 bg-gradient-to-br ${docBg} rounded-full flex items-center justify-center text-white font-black text-lg shadow-md shrink-0`}>
                            {docInitials}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-foreground">{docName}</h3>
                            <p className="text-primary dark:text-blue-400 font-bold text-xs">{docSpecialty}</p>
                          </div>
                        </div>
                        <span className="bg-blue-500/10 text-primary text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">{appt.status}</span>
                      </div>

                      <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-4 mb-6 grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-foreground-muted" />
                          <div><p className="text-[10px] text-foreground-muted font-bold uppercase">Date</p><p className="text-sm font-black text-foreground">{appt.appointment_date}</p></div>
                        </div>
                        <div className="flex items-center gap-3 border-l border-border/50 pl-4">
                          <Clock className="w-5 h-5 text-foreground-muted" />
                          <div><p className="text-[10px] text-foreground-muted font-bold uppercase">Time</p><p className="text-sm font-black text-foreground">{appt.appointment_time}</p></div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button onClick={() => setRescheduleModal({ isOpen: true, apptId: appt.id })} className="flex-1 bg-white dark:bg-zinc-800 text-foreground border-2 border-border hover:border-primary hover:text-primary rounded-full hover-wave font-bold transition-all">
                          <Edit2 className="w-4 h-4 mr-2" /> Reschedule
                        </Button>
                        <Button onClick={() => setCancelModal({ isOpen: true, apptId: appt.id })} variant="outline" className="flex-1 bg-red-500/10 text-red-500 border-0 hover:bg-red-500 hover:text-white rounded-full hover-wave font-bold transition-all">
                          <X className="w-4 h-4 mr-2" /> Cancel
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-6 pt-8 border-t border-border/50">
            <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
              <History className="w-6 h-6 text-foreground-muted" /> Past Appointments
            </h2>
            
            <div className="glass-card rounded-3xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-black/5 dark:bg-white/5 text-foreground-muted text-sm uppercase tracking-wider">
                      <th className="p-4 font-bold">Doctor</th>
                      <th className="p-4 font-bold">Date & Time</th>
                      <th className="p-4 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {past.map((appt) => (
                      <tr key={appt.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-foreground">{appt.doctor?.full_name || 'Doctor'}</div>
                          <div className="text-xs text-foreground-muted font-medium">{appt.doctor?.specialty || 'Consultation'}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-foreground">{appt.appointment_date}</div>
                          <div className="text-xs text-foreground-muted font-medium">{appt.appointment_time}</div>
                        </td>
                        <td className="p-4">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center w-fit gap-1 ${
                            appt.status === 'Completed' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                          }`}>
                            {appt.status === 'Completed' ? <CheckCircle2 className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            {appt.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}