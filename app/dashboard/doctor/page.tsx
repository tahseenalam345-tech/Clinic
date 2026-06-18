'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { Users, CheckCircle2, Clock, CalendarX, Activity, Trash2, X, ArrowLeft, FileText, Download, Upload, Plus, User as UserIcon, Droplet, Scale, Ruler, Stethoscope } from 'lucide-react';
import Link from 'next/link';

// Database Shapes
type Appointment = {
  id: string;
  patient_id: string; // Needed to fetch their profile
  patient_name: string;
  disease: string;
  appointment_date: string;
  appointment_time: string;
  type: string;
  payment_method: string;
  fee: number;
  status: string;
};

export default function DoctorDashboard() {
  const supabase = createClient();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // --- ROLE GUARD ---
  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (profile?.role !== 'doctor') {
        router.push('/dashboard/patient');
      } else {
        setIsAuthorized(true);
      }
    };
    checkRole();
  }, [router, supabase]);

  // Patient File Modal State
  const [viewingPatient, setViewingPatient] = useState<any | null>(null);
  const [patientProfile, setPatientProfile] = useState<any>(null);
  const [patientRecords, setPatientRecords] = useState<any[]>([]);
  const [isUploadingPrescription, setIsUploadingPrescription] = useState(false);

  const DOCTOR_ID = '1'; 
  const TODAY = '2026-06-18'; 

  // 1. Fetch live data
  const fetchAppointments = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('appointments').select('*').eq('doctor_id', DOCTOR_ID).order('appointment_date', { ascending: false });
    if (data) setAppointments(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isAuthorized) fetchAppointments();
  }, [isAuthorized]);

  // 2. Database Actions
  const updateStatus = async (id: string, newStatus: string) => {
    setAppointments(current => current.map(appt => appt.id === id ? { ...appt, status: newStatus } : appt));
    await supabase.from('appointments').update({ status: newStatus }).eq('id', id);
  };

  const deleteAppointment = async (id: string) => {
    if(!confirm("Are you sure you want to permanently delete this record?")) return;
    setAppointments(current => current.filter(appt => appt.id !== id));
    await supabase.from('appointments').delete().eq('id', id);
  };

  // 3. Open Patient File
  const handleViewPatient = async (appt: Appointment) => {
    setViewingPatient(appt);
    
    // Mocking patient data in case DB is empty during testing. 
    // In production, this fetches by appt.patient_id
    setPatientProfile({
      full_name: appt.patient_name,
      dob: '1995-08-15',
      gender: 'Male',
      blood_group: 'O+',
      weight: '75 kg',
      height: '5 ft 10 in',
      allergies: 'Penicillin, Dust',
      chronic_diseases: 'None',
      current_symptoms: appt.disease
    });

    setPatientRecords([
      { id: '1', created_at: 'June 10, 2026', doctor_name: 'External Lab', type: 'Blood Test Report', file_url: 'H_Pylori_Test.pdf' }
    ]);
  };

  const handleUploadPrescription = async () => {
    setIsUploadingPrescription(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate upload
    
    const newPrescription = {
      id: Math.random().toString(),
      created_at: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      doctor_name: 'Dr. Tariq Mahmood',
      type: 'Prescription',
      file_url: `Rx_${viewingPatient.patient_name.replace(' ', '_')}.pdf`
    };
    
    setPatientRecords([newPrescription, ...patientRecords]);
    setIsUploadingPrescription(false);
  };

  // If not authorized yet, show nothing while redirecting
  if (!isAuthorized) return null;

  // Tables & Reports logic...
  const pendingQueue = appointments.filter(a => a.status === 'Pending');
  const completedQueue = appointments.filter(a => a.status === 'Completed');
  const canceledQueue = appointments.filter(a => a.status === 'Canceled');

  const calculateReports = () => {
    const todayAppts = appointments.filter(a => a.appointment_date === TODAY && a.status === 'Completed');
    const thisMonthAppts = appointments.filter(a => a.appointment_date.startsWith('2026-06') && a.status === 'Completed');
    const thisWeekAppts = thisMonthAppts.filter(a => { const day = parseInt(a.appointment_date.split('-')[2]); return day >= 12 && day <= 18; });
    return {
      daily: { count: todayAppts.length, revenue: todayAppts.reduce((sum, a) => sum + a.fee, 0) },
      weekly: { count: thisWeekAppts.length, revenue: thisWeekAppts.reduce((sum, a) => sum + a.fee, 0) },
      monthly: { count: thisMonthAppts.length, revenue: thisMonthAppts.reduce((sum, a) => sum + a.fee, 0) }
    };
  };
  const reports = calculateReports();

  const AppointmentTable = ({ title, data, icon: Icon, colorClass }: { title: string, data: Appointment[], icon: any, colorClass: string }) => (
    <div className="glass-card rounded-3xl border border-blue-100 dark:border-zinc-800 overflow-hidden mb-8">
      <div className={`p-6 border-b border-border/50 flex items-center gap-3 ${colorClass}`}>
        <Icon className="w-6 h-6" />
        <h2 className="text-xl font-black">{title} ({data.length})</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-black/5 dark:bg-white/5 text-foreground-muted text-sm uppercase tracking-wider">
              <th className="p-4 font-bold">Time</th>
              <th className="p-4 font-bold">Patient Details</th>
              <th className="p-4 font-bold">Type</th>
              <th className="p-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {data.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-foreground-muted font-bold">No appointments found.</td></tr>
            ) : (
              data.map((appt) => (
                <tr key={appt.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-foreground">{appt.appointment_time}</div>
                    <div className="text-xs text-foreground-muted font-medium">{appt.appointment_date}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-foreground">{appt.patient_name}</div>
                    <div className="text-xs text-red-400 font-bold bg-red-500/10 w-fit px-2 py-0.5 rounded-md mt-1">{appt.disease}</div>
                  </td>
                  <td className="p-4 text-foreground-muted font-medium text-sm">{appt.type}</td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => handleViewPatient(appt)} className="text-xs font-bold bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white px-3 py-2 rounded-lg transition-colors">
                      View File
                    </button>
                    {appt.status === 'Pending' && (
                      <button onClick={() => updateStatus(appt.id, 'Completed')} className="text-xs font-bold bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white px-3 py-2 rounded-lg transition-colors">
                        Mark Complete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      <Header />
      
      {/* PATIENT FILE MODAL (DOCTOR'S VIEW) */}
      {viewingPatient && patientProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setViewingPatient(null)} />
          <div className="glass-card bg-[#0a0a0c]/95 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl z-10 border border-blue-500/30 shadow-[0_0_50px_rgba(59,130,246,0.15)] animate-in zoom-in-95">
            
            <div className="sticky top-0 bg-[#0a0a0c]/90 backdrop-blur-md p-6 border-b border-border/50 flex justify-between items-center z-20">
              <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
                <UserIcon className="w-6 h-6 text-primary" /> {patientProfile.full_name}'s Medical File
              </h2>
              <button onClick={() => setViewingPatient(null)} className="p-2 hover:bg-white/10 rounded-full"><X className="w-6 h-6 text-foreground"/></button>
            </div>

            <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8">
              {/* Left Column: Health Profile */}
              <div className="space-y-6">
                <div className="bg-[#111113] border border-zinc-800 rounded-3xl p-6">
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2 border-b border-zinc-800 pb-3"><Activity className="w-5 h-5 text-red-500"/> Vitals & Bio</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-xs text-foreground-muted font-bold uppercase mb-1">Blood</p><p className="font-black text-red-400 text-lg flex items-center gap-1"><Droplet className="w-4 h-4"/> {patientProfile.blood_group}</p></div>
                    <div><p className="text-xs text-foreground-muted font-bold uppercase mb-1">Gender</p><p className="font-black text-foreground">{patientProfile.gender}</p></div>
                    <div><p className="text-xs text-foreground-muted font-bold uppercase mb-1">Weight</p><p className="font-black text-foreground flex items-center gap-1"><Scale className="w-4 h-4 text-emerald-500"/> {patientProfile.weight}</p></div>
                    <div><p className="text-xs text-foreground-muted font-bold uppercase mb-1">Height</p><p className="font-black text-foreground flex items-center gap-1"><Ruler className="w-4 h-4 text-emerald-500"/> {patientProfile.height}</p></div>
                  </div>
                </div>

                <div className="bg-[#111113] border border-zinc-800 rounded-3xl p-6 space-y-4">
                  <div><p className="text-xs text-foreground-muted font-bold uppercase mb-1 flex items-center gap-1"><Stethoscope className="w-3 h-3 text-amber-500"/> Current Symptoms</p><p className="font-medium text-amber-400 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">{patientProfile.current_symptoms}</p></div>
                  <div><p className="text-xs text-foreground-muted font-bold uppercase mb-1">Allergies</p><p className="font-bold text-foreground">{patientProfile.allergies}</p></div>
                  <div><p className="text-xs text-foreground-muted font-bold uppercase mb-1">Chronic Diseases</p><p className="font-bold text-foreground">{patientProfile.chronic_diseases}</p></div>
                </div>
              </div>

              {/* Right Column: Lab Reports & Prescriptions */}
              <div className="space-y-6">
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-3xl p-6 h-full flex flex-col">
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center justify-between border-b border-blue-500/20 pb-3">
                    <span className="flex items-center gap-2"><FileText className="w-5 h-5 text-primary"/> Medical Records</span>
                  </h3>

                  <div className="flex-1 space-y-3 overflow-y-auto max-h-[300px] pr-2 mb-4">
                    {patientRecords.map((record, idx) => (
                      <div key={idx} className="bg-[#111113] border border-zinc-800 p-3 rounded-2xl flex justify-between items-center group hover:border-blue-500/50 transition-colors">
                        <div>
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${record.type === 'Prescription' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>{record.type}</span>
                          <p className="text-sm font-bold text-foreground mt-1">{record.file_url}</p>
                          <p className="text-[10px] text-foreground-muted font-medium">{record.doctor_name} • {record.created_at}</p>
                        </div>
                        <button className="p-2 bg-zinc-800 hover:bg-primary text-white rounded-xl transition-colors"><Download className="w-4 h-4"/></button>
                      </div>
                    ))}
                  </div>

                  <Button onClick={handleUploadPrescription} disabled={isUploadingPrescription} className="w-full bg-primary hover:bg-blue-600 text-white rounded-full font-bold py-6 hover-wave shadow-glow border-0 mt-auto">
                    {isUploadingPrescription ? 'Uploading...' : <><Plus className="w-5 h-5 mr-2" /> Upload New Prescription</>}
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowReport(false)} />
          <div className="glass-card bg-background/95 w-full max-w-lg rounded-3xl z-10 p-8 border border-blue-500/30 shadow-glow animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6 border-b border-border/50 pb-4">
              <h2 className="text-2xl font-black text-foreground flex items-center gap-2"><Activity className="text-primary"/> Financial Report</h2>
              <button onClick={() => setShowReport(false)} className="p-2 hover:bg-white/10 rounded-full"><X className="w-5 h-5"/></button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl"><div><p className="text-sm text-foreground-muted font-bold">Today</p><p className="text-xl font-black">{reports.daily.count} Patients</p></div><div className="text-right"><p className="text-sm text-foreground-muted font-bold">Revenue</p><p className="text-2xl font-black text-green-400">Rs. {reports.daily.revenue}</p></div></div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl"><div><p className="text-sm text-foreground-muted font-bold">This Week</p><p className="text-xl font-black">{reports.weekly.count} Patients</p></div><div className="text-right"><p className="text-sm text-foreground-muted font-bold">Revenue</p><p className="text-2xl font-black text-green-400">Rs. {reports.weekly.revenue}</p></div></div>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 py-10 md:py-16 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <Link href="/" className="inline-flex items-center gap-2 text-foreground-muted hover:text-primary font-bold mb-2 transition-colors"><ArrowLeft className="w-5 h-5" /> Back to Home</Link>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div><h1 className="text-3xl md:text-4xl font-black text-foreground">Welcome back, <span className="text-primary dark:text-blue-400">Dr. Tariq</span></h1><p className="text-foreground-muted font-medium mt-1">Live Database View • June 18, 2026</p></div>
            <Button onClick={() => setShowReport(true)} className="rounded-full bg-foreground text-background hover:bg-foreground/90 font-bold hover-wave"><Activity className="w-4 h-4 mr-2" /> View Analytics Report</Button>
          </div>
          {isLoading ? ( <div className="text-center py-20 font-bold text-foreground-muted animate-pulse">Loading live database...</div> ) : (
            <>
              <AppointmentTable title="Pending Queue" data={pendingQueue} icon={Clock} colorClass="text-amber-500" />
              <AppointmentTable title="Completed Appointments" data={completedQueue} icon={CheckCircle2} colorClass="text-green-500" />
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}