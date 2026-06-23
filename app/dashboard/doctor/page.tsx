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
  patient_id: string; 
  patient_name: string;
  disease: string;
  appointment_date: string;
  appointment_time: string;
  type: string;
  payment_method: string;
  fee: number;
  status: string;
  patient?: any; // To hold joined relational data if needed
};

export default function DoctorDashboard() {
  const supabase = createClient();
  const router = useRouter();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // Real Doctor Info
  const [doctorProfile, setDoctorProfile] = useState<any>(null);

  // Patient File Modal State
  const [viewingPatient, setViewingPatient] = useState<Appointment | null>(null);
  const [patientProfile, setPatientProfile] = useState<any>(null);
  const [patientRecords, setPatientRecords] = useState<any[]>([]);
  const [isUploadingPrescription, setIsUploadingPrescription] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);

  // --- ROLE GUARD & DOCTOR FETCH ---
  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/login');
      
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      
      // STRICT GUARD: If not a doctor AND not an admin, kick out. 
      if (profile?.role !== 'doctor' && profile?.role !== 'admin') {
        window.location.href = '/'; 
        return;
      }
      
      setDoctorProfile(profile); 
      setIsAuthorized(true);
    };
    checkRole();
  }, [router, supabase]);

  // 1. Fetch live appointments for this doctor
  const fetchAppointments = async () => {
    if (!doctorProfile) return;
    setIsLoading(true);
    
    // Join with profiles table to ensure we always have the real patient name
    const { data } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:profiles!patient_id(full_name, email, phone)
      `)
      .eq('doctor_id', doctorProfile.id)
      .order('appointment_date', { ascending: false });
      
    if (data) {
      // Map it securely so your UI doesn't break
      const mappedAppts = data.map(appt => ({
        ...appt,
        patient_name: appt.patient_name || appt.patient?.full_name || 'Unknown Patient'
      }));
      setAppointments(mappedAppts);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isAuthorized && doctorProfile) {
      fetchAppointments();
    }
  }, [isAuthorized, doctorProfile]);

  // 2. Database Actions
  const updateStatus = async (id: string, newStatus: string) => {
    setAppointments(current => current.map(appt => appt.id === id ? { ...appt, status: newStatus } : appt));
    await supabase.from('appointments').update({ status: newStatus }).eq('id', id);
  };

  // 3. Open Patient File (LIVE FETCH)
  const handleViewPatient = async (appt: Appointment) => {
    setViewingPatient(appt);
    setIsLoadingFile(true);
    setPatientProfile(null);
    setPatientRecords([]);

    // Fetch REAL patient profile
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', appt.patient_id).single();
    if (profile) setPatientProfile(profile);

    // Fetch REAL patient records
    const { data: records } = await supabase.from('medical_records').select('*').eq('patient_id', appt.patient_id).order('created_at', { ascending: false });
    if (records) setPatientRecords(records);

    setIsLoadingFile(false);
  };

  // 4. Upload Prescription (LIVE INSERT)
  const handleUploadPrescription = async () => {
    if (!viewingPatient || !doctorProfile) return;
    
    setIsUploadingPrescription(true);
    
    // Simulate file generation delay
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    
    const newRecord = {
      patient_id: viewingPatient.patient_id,
      doctor_name: doctorProfile.full_name,
      title: 'Digital Prescription',
      report_type: 'Prescription',
      uploaded_by: 'Doctor',
      file_url: `Rx_${viewingPatient.patient_name.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`,
      created_at: new Date().toISOString()
    };
    
    // Insert into Supabase
    const { data, error } = await supabase.from('medical_records').insert([newRecord]).select().single();
    
    if (data) {
      setPatientRecords([data, ...patientRecords]);
    } else if (error) {
      alert("Failed to save prescription: " + error.message);
    }
    
    setIsUploadingPrescription(false);
  };

  // If not authorized yet, show nothing while redirecting
  if (!isAuthorized) return null;

  // Tables & Reports logic...
  const pendingQueue = appointments.filter(a => a.status === 'Pending');
  const completedQueue = appointments.filter(a => a.status === 'Completed');

  const calculateReports = () => {
    return {
      total: { count: completedQueue.length, revenue: completedQueue.reduce((sum, a) => sum + (a.fee || 0), 0) },
      pending: { count: pendingQueue.length, revenue: pendingQueue.reduce((sum, a) => sum + (a.fee || 0), 0) },
    };
  };
  const reports = calculateReports();

  const AppointmentTable = ({ title, data, icon: Icon, colorClass }: { title: string, data: Appointment[], icon: any, colorClass: string }) => (
    <div className="glass-card rounded-3xl border border-blue-100 dark:border-zinc-800 overflow-hidden mb-8">
      <div className={`p-4 sm:p-6 border-b border-border/50 flex items-center gap-3 ${colorClass}`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        <h2 className="text-lg sm:text-xl font-black">{title} ({data.length})</h2>
      </div>
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse min-w-[650px]">
          <thead>
            <tr className="bg-black/5 dark:bg-white/5 text-foreground-muted text-[10px] sm:text-xs uppercase tracking-wider">
              <th className="p-3 sm:p-4 font-bold">Date & Time</th>
              <th className="p-3 sm:p-4 font-bold">Patient Details</th>
              <th className="p-3 sm:p-4 font-bold">Type</th>
              <th className="p-3 sm:p-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {data.length === 0 ? (
              <tr><td colSpan={4} className="p-6 sm:p-8 text-center text-foreground-muted font-bold text-sm">No appointments found.</td></tr>
            ) : (
              data.map((appt) => (
                <tr key={appt.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="p-3 sm:p-4">
                    <div className="font-bold text-foreground text-sm sm:text-base">{appt.appointment_time}</div>
                    <div className="text-[10px] sm:text-xs text-foreground-muted font-medium">{new Date(appt.appointment_date).toLocaleDateString()}</div>
                  </td>
                  <td className="p-3 sm:p-4">
                    <div className="font-bold text-foreground text-sm sm:text-base">{appt.patient_name}</div>
                    <div className="text-[10px] sm:text-xs text-red-400 font-bold bg-red-500/10 w-fit px-2 py-0.5 rounded-md mt-1">{appt.disease || 'General'}</div>
                  </td>
                  <td className="p-3 sm:p-4 text-foreground-muted font-medium text-xs sm:text-sm">{appt.type || 'Standard'}</td>
                  <td className="p-3 sm:p-4 text-right">
                    <div className="flex flex-col sm:flex-row justify-end gap-2">
                      <button onClick={() => handleViewPatient(appt)} className="text-[10px] sm:text-xs font-bold bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white px-3 py-1.5 sm:py-2 rounded-lg transition-colors whitespace-nowrap">
                        View File
                      </button>
                      {appt.status === 'Pending' && (
                        <button onClick={() => updateStatus(appt.id, 'Completed')} className="text-[10px] sm:text-xs font-bold bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white px-3 py-1.5 sm:py-2 rounded-lg transition-colors whitespace-nowrap">
                          Mark Complete
                        </button>
                      )}
                    </div>
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
      {viewingPatient && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setViewingPatient(null)} />
          <div className="glass-card bg-[#0a0a0c]/95 w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl z-10 border border-blue-500/30 shadow-[0_0_50px_rgba(59,130,246,0.15)] animate-in zoom-in-95">
            
            <div className="sticky top-0 bg-[#0a0a0c]/90 backdrop-blur-md p-4 sm:p-6 border-b border-border/50 flex justify-between items-center z-20">
              <h2 className="text-lg sm:text-2xl font-black text-foreground flex items-center gap-2 sm:gap-3">
                <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0" /> <span className="truncate">{viewingPatient.patient_name}'s File</span>
              </h2>
              <button onClick={() => setViewingPatient(null)} className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full shrink-0"><X className="w-5 h-5 sm:w-6 sm:h-6 text-foreground"/></button>
            </div>

            <div className="p-4 sm:p-6 md:p-8">
              {isLoadingFile ? (
                 <div className="text-center py-10 font-bold text-primary animate-pulse text-sm sm:text-base">Loading secure patient records...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  {/* Left Column: Health Profile */}
                  <div className="space-y-4 sm:space-y-6">
                    <div className="bg-[#111113] border border-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg font-bold text-foreground mb-3 sm:mb-4 flex items-center gap-2 border-b border-zinc-800 pb-2 sm:pb-3"><Activity className="w-4 h-4 sm:w-5 sm:h-5 text-red-500"/> Vitals & Bio</h3>
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div><p className="text-[10px] sm:text-xs text-foreground-muted font-bold uppercase mb-1">Blood</p><p className="font-black text-red-400 text-sm sm:text-lg flex items-center gap-1"><Droplet className="w-3 h-3 sm:w-4 sm:h-4"/> {patientProfile?.blood_group || 'N/A'}</p></div>
                        <div><p className="text-[10px] sm:text-xs text-foreground-muted font-bold uppercase mb-1">Gender</p><p className="font-black text-foreground text-sm sm:text-base">{patientProfile?.gender || 'N/A'}</p></div>
                        <div><p className="text-[10px] sm:text-xs text-foreground-muted font-bold uppercase mb-1">Weight</p><p className="font-black text-foreground text-sm sm:text-base flex items-center gap-1"><Scale className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500"/> {patientProfile?.weight || 'N/A'}</p></div>
                        <div><p className="text-[10px] sm:text-xs text-foreground-muted font-bold uppercase mb-1">Height</p><p className="font-black text-foreground text-sm sm:text-base flex items-center gap-1"><Ruler className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500"/> {patientProfile?.height || 'N/A'}</p></div>
                      </div>
                    </div>

                    <div className="bg-[#111113] border border-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-3 sm:space-y-4">
                      <div><p className="text-[10px] sm:text-xs text-foreground-muted font-bold uppercase mb-1 flex items-center gap-1"><Stethoscope className="w-3 h-3 text-amber-500"/> Appointment Reason</p><p className="font-medium text-amber-400 bg-amber-500/10 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-amber-500/20 text-sm sm:text-base">{viewingPatient.disease || 'General Checkup'}</p></div>
                      <div><p className="text-[10px] sm:text-xs text-foreground-muted font-bold uppercase mb-1">Allergies</p><p className="font-bold text-foreground text-sm sm:text-base">{patientProfile?.allergies || 'None recorded'}</p></div>
                      <div><p className="text-[10px] sm:text-xs text-foreground-muted font-bold uppercase mb-1">Chronic Diseases</p><p className="font-bold text-foreground text-sm sm:text-base">{patientProfile?.chronic_diseases || 'None recorded'}</p></div>
                    </div>
                  </div>

                  {/* Right Column: Lab Reports & Prescriptions */}
                  <div className="space-y-4 sm:space-y-6">
                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 h-full flex flex-col">
                      <h3 className="text-base sm:text-lg font-bold text-foreground mb-3 sm:mb-4 flex items-center justify-between border-b border-blue-500/20 pb-2 sm:pb-3">
                        <span className="flex items-center gap-2"><FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary"/> Medical Records</span>
                      </h3>

                      <div className="flex-1 space-y-2 sm:space-y-3 overflow-y-auto max-h-[250px] sm:max-h-[300px] pr-1 sm:pr-2 mb-4">
                        {patientRecords.length === 0 ? (
                           <p className="text-xs sm:text-sm text-foreground-muted italic text-center py-4">No records found for this patient.</p>
                        ) : (
                          patientRecords.map((record, idx) => (
                            <div key={idx} className="bg-[#111113] border border-zinc-800 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl flex justify-between items-center group hover:border-blue-500/50 transition-colors">
                              <div className="truncate pr-2">
                                <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full ${record.report_type === 'Prescription' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>{record.report_type}</span>
                                <p className="text-xs sm:text-sm font-bold text-foreground mt-1 truncate">{record.title || record.file_url}</p>
                                <p className="text-[8px] sm:text-[10px] text-foreground-muted font-medium truncate">{record.doctor_name} • {new Date(record.created_at).toLocaleDateString()}</p>
                              </div>
                              <a href={record.file_url} target="_blank" rel="noopener noreferrer" className="p-1.5 sm:p-2 bg-zinc-800 hover:bg-primary text-white rounded-lg sm:rounded-xl transition-colors shrink-0"><Download className="w-3 h-3 sm:w-4 sm:h-4"/></a>
                            </div>
                          ))
                        )}
                      </div>

                      <Button onClick={handleUploadPrescription} disabled={isUploadingPrescription} className="w-full bg-primary hover:bg-blue-600 text-white rounded-full font-bold py-5 sm:py-6 hover-wave shadow-glow border-0 mt-auto text-xs sm:text-sm">
                        {isUploadingPrescription ? 'Generating...' : <><Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" /> Digital Prescription</>}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowReport(false)} />
          <div className="glass-card bg-background/95 w-full max-w-lg rounded-2xl sm:rounded-3xl z-10 p-5 sm:p-8 border border-blue-500/30 shadow-glow animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4 sm:mb-6 border-b border-border/50 pb-3 sm:pb-4">
              <h2 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2"><Activity className="w-5 h-5 sm:w-6 sm:h-6 text-primary"/> Financial Report</h2>
              <button onClick={() => setShowReport(false)} className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full"><X className="w-4 h-4 sm:w-5 sm:h-5"/></button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center p-3 sm:p-4 bg-white/5 rounded-xl sm:rounded-2xl"><div><p className="text-xs sm:text-sm text-foreground-muted font-bold">Total Completed</p><p className="text-lg sm:text-xl font-black">{reports.total.count} Patients</p></div><div className="text-right"><p className="text-xs sm:text-sm text-foreground-muted font-bold">Revenue</p><p className="text-xl sm:text-2xl font-black text-green-400">Rs. {reports.total.revenue}</p></div></div>
              <div className="flex justify-between items-center p-3 sm:p-4 bg-white/5 rounded-xl sm:rounded-2xl"><div><p className="text-xs sm:text-sm text-foreground-muted font-bold">Pending Revenue</p><p className="text-lg sm:text-xl font-black">{reports.pending.count} Patients</p></div><div className="text-right"><p className="text-xs sm:text-sm text-foreground-muted font-bold">Expected</p><p className="text-xl sm:text-2xl font-black text-amber-400">Rs. {reports.pending.revenue}</p></div></div>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 py-8 sm:py-10 md:py-16 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-blue-500/10 rounded-full blur-3xl -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
          <Link href="/" className="inline-flex items-center gap-1.5 sm:gap-2 text-foreground-muted hover:text-primary font-bold mb-1 sm:mb-2 transition-colors text-sm sm:text-base"><ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /> Back to Home</Link>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground">
                Welcome back, <span className="text-primary dark:text-blue-400">{doctorProfile?.full_name || 'Doctor'}</span>
              </h1>
              <p className="text-xs sm:text-sm text-foreground-muted font-medium mt-1">Live Database View • {new Date().toLocaleDateString()}</p>
            </div>
            <Button onClick={() => setShowReport(true)} className="w-full md:w-auto rounded-full bg-foreground text-background hover:bg-foreground/90 font-bold hover-wave text-xs sm:text-sm"><Activity className="w-4 h-4 mr-2" /> View Analytics Report</Button>
          </div>
          {isLoading ? ( <div className="text-center py-20 font-bold text-primary animate-pulse text-sm sm:text-base">Syncing with secure server...</div> ) : (
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