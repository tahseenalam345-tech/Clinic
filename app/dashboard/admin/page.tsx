'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Header } from '@/components/header';
import { ShieldAlert, Activity, Users, Stethoscope, Calendar, Trash2, Edit, X, Save, Clock, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const supabase = createClient();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'patients' | 'timeline'>('overview');
  const [isLoading, setIsLoading] = useState(true);

  // Real-time System Health States
  const [dbStatus, setDbStatus] = useState<'Checking...' | 'Operational' | 'Degraded'>('Checking...');
  const [authStatus, setAuthStatus] = useState<'Checking...' | 'Operational' | 'Degraded'>('Checking...');
  const [storageStatus, setStorageStatus] = useState<'Checking...' | 'Operational' | 'Degraded'>('Checking...');

  // Master Data States
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  // Editing State
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchGodModeData = async () => {
      // 1. PING AUTHENTICATION SERVICE
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setAuthStatus('Degraded');
        return router.push('/login');
      }
      setAuthStatus('Operational');

      // Verify Admin Role
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (profile?.role !== 'admin') {
        window.location.href = '/';
        return;
      }

      // 2. PING DATABASE & FETCH DATA
      const [docsRes, patsRes, apptsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('role', 'doctor').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').eq('role', 'patient').order('created_at', { ascending: false }),
        supabase.from('appointments').select(`*, doctor:profiles!doctor_id(full_name), patient:profiles!patient_id(full_name)`).order('appointment_date', { ascending: false })
      ]);

      if (docsRes.data) setDoctors(docsRes.data);
      if (patsRes.data) setPatients(patsRes.data);
      if (apptsRes.data) setAppointments(apptsRes.data);

      if (docsRes.error || patsRes.error || apptsRes.error) {
        setDbStatus('Degraded');
      } else {
        setDbStatus('Operational');
      }

      // 3. PING STORAGE SERVICE
      const { error: storageError } = await supabase.storage.listBuckets();
      if (storageError) {
        setStorageStatus('Degraded');
      } else {
        setStorageStatus('Operational');
      }

      setIsLoading(false);
    };

    fetchGodModeData();
  }, [router, supabase]);

  // --- CRUD OPERATIONS ---
  const handleEditClick = (user: any) => {
    setEditingUser(user);
    setEditForm(user); 
  };

  const handleSaveUser = async () => {
    setIsSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update(editForm)
      .eq('id', editingUser.id);

    if (!error) {
      if (editingUser.role === 'doctor') {
        setDoctors(docs => docs.map(d => d.id === editingUser.id ? { ...d, ...editForm } : d));
      } else {
        setPatients(pats => pats.map(p => p.id === editingUser.id ? { ...p, ...editForm } : p));
      }
      setEditingUser(null);
    } else {
      alert("Error saving updates: " + error.message);
    }
    setIsSaving(false);
  };

  const handleDeleteUser = async (id: string, role: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete this ${role}? This action cannot be undone.`)) return;
    
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (!error) {
      if (role === 'doctor') setDoctors(docs => docs.filter(d => d.id !== id));
      if (role === 'patient') setPatients(pats => pats.filter(p => p.id !== id));
    } else {
      alert("Delete failed: " + error.message);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!window.confirm('Delete this appointment record forever?')) return;
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (!error) setAppointments(appts => appts.filter(a => a.id !== id));
  };

  // Metrics
  const totalRevenue = appointments.filter(a => a.status === 'Completed').reduce((sum, a) => sum + (a.fee || 0), 0);
  const platformCut = totalRevenue * 0.10; 

  // Common Input Style
  const inputClass = "w-full bg-[#0a0a0c] border border-zinc-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-purple-500 transition-colors font-medium";

  // Reusable System Status Component (Made Responsive)
  const StatusIndicator = ({ name, status }: { name: string, status: string }) => {
    const isGood = status === 'Operational';
    const isChecking = status === 'Checking...';
    
    return (
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 p-4 bg-black/40 rounded-lg border border-zinc-800/50">
        <span className="font-bold text-zinc-300">{name}</span>
        <span className={`text-sm font-black flex items-center gap-2 ${isGood ? 'text-emerald-500' : isChecking ? 'text-amber-500' : 'text-red-500'}`}>
          <div className={`w-2 h-2 rounded-full ${isGood ? 'bg-emerald-500' : isChecking ? 'bg-amber-500' : 'bg-red-500'} animate-pulse`} /> 
          {status}
        </span>
      </div>
    );
  };

  if (isLoading) return <div className="min-h-screen bg-[#050507] flex items-center justify-center font-black text-purple-500 animate-pulse text-lg sm:text-xl"><ShieldAlert className="mr-3"/> Initializing God Mode...</div>;

  return (
    <div className="min-h-screen bg-[#050507] text-white selection:bg-purple-500/30 font-sans">
      <Header />

      {/* EDIT MODAL (Responsive Grid) */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setEditingUser(null)} />
          <div className="bg-[#111113] border border-zinc-800 w-full max-w-xl rounded-xl z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 sm:p-6 border-b border-zinc-800 flex justify-between items-center bg-[#0a0a0c]">
              <h2 className="text-lg sm:text-xl font-black flex items-center gap-2"><Edit className="w-5 h-5 text-purple-500"/> Edit {editingUser.role.toUpperCase()}</h2>
              <button onClick={() => setEditingUser(null)} className="text-zinc-500 hover:text-white"><X className="w-6 h-6"/></button>
            </div>
            
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1">
              <div><label className="text-xs font-bold text-zinc-400 uppercase">Full Name</label>
              <input type="text" value={editForm.full_name || ''} onChange={e => setEditForm({...editForm, full_name: e.target.value})} className={inputClass} /></div>
              
              <div><label className="text-xs font-bold text-zinc-400 uppercase">Email Address</label>
              <input type="email" value={editForm.email || ''} onChange={e => setEditForm({...editForm, email: e.target.value})} className={inputClass} /></div>

              {editingUser.role === 'doctor' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="text-xs font-bold text-zinc-400 uppercase">Specialty</label>
                    <input type="text" value={editForm.specialty || ''} onChange={e => setEditForm({...editForm, specialty: e.target.value})} className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-zinc-400 uppercase">Fee (Rs.)</label>
                    <input type="number" value={editForm.fee || ''} onChange={e => setEditForm({...editForm, fee: Number(e.target.value)})} className={inputClass} /></div>
                  </div>
                  <div><label className="text-xs font-bold text-zinc-400 uppercase">Hospital/Clinic</label>
                  <input type="text" value={editForm.hospital || ''} onChange={e => setEditForm({...editForm, hospital: e.target.value})} className={inputClass} /></div>
                  <div><label className="text-xs font-bold text-zinc-400 uppercase">City</label>
                  <input type="text" value={editForm.city || ''} onChange={e => setEditForm({...editForm, city: e.target.value})} className={inputClass} /></div>
                </>
              )}

              {editingUser.role === 'patient' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="text-xs font-bold text-zinc-400 uppercase">Phone</label>
                  <input type="text" value={editForm.phone || ''} onChange={e => setEditForm({...editForm, phone: e.target.value})} className={inputClass} /></div>
                  <div><label className="text-xs font-bold text-zinc-400 uppercase">Blood Group</label>
                  <input type="text" value={editForm.blood_group || ''} onChange={e => setEditForm({...editForm, blood_group: e.target.value})} className={inputClass} /></div>
                </div>
              )}
            </div>

            <div className="p-5 sm:p-6 border-t border-zinc-800 bg-[#0a0a0c] flex flex-col sm:flex-row justify-end gap-3">
              <Button onClick={() => setEditingUser(null)} variant="outline" className="border-zinc-700 hover:bg-zinc-800 rounded-lg w-full sm:w-auto">Cancel</Button>
              <Button onClick={handleSaveUser} disabled={isSaving} className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold gap-2 w-full sm:w-auto">
                {isSaving ? 'Saving...' : <><Save className="w-4 h-4"/> Save Changes</>}
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8 sm:py-10">
        
        {/* Header */}
        <div className="mb-8 sm:mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20 text-[10px] sm:text-xs font-black tracking-widest uppercase mb-4">
            <ShieldAlert className="w-3 h-3" /> Level 5 Access
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-2">Nexus <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Command Center</span></h1>
          <p className="text-zinc-400 font-medium text-sm sm:text-lg">Absolute control over users, appointments, and global settings.</p>
        </div>

        {/* Tab Navigation (Scrollable horizontally on very small screens) */}
        <div className="overflow-x-auto pb-4 mb-4 sm:mb-8 no-scrollbar">
          <div className="flex flex-nowrap gap-2 bg-[#111113] p-1.5 rounded-xl border border-zinc-800 w-max sm:w-fit">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'doctors', label: 'Doctors', icon: Stethoscope },
              { id: 'patients', label: 'Patients', icon: Users },
              { id: 'timeline', label: 'Timeline', icon: Clock }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* --- TAB CONTENT --- */}
        
        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-[#111113] border border-zinc-800 p-5 sm:p-6 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4"><Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500/20"/></div>
                <p className="text-zinc-400 font-bold text-xs sm:text-sm mb-1">Total Patients</p>
                <p className="text-3xl sm:text-4xl font-black">{patients.length}</p>
              </div>
              <div className="bg-[#111113] border border-zinc-800 p-5 sm:p-6 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4"><Stethoscope className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500/20"/></div>
                <p className="text-zinc-400 font-bold text-xs sm:text-sm mb-1">Verified Doctors</p>
                <p className="text-3xl sm:text-4xl font-black">{doctors.length}</p>
              </div>
              <div className="bg-[#111113] border border-zinc-800 p-5 sm:p-6 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4"><Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500/20"/></div>
                <p className="text-zinc-400 font-bold text-xs sm:text-sm mb-1">Total Appointments</p>
                <p className="text-3xl sm:text-4xl font-black">{appointments.length}</p>
              </div>
              <div className="bg-[#111113] border border-amber-500/30 p-5 sm:p-6 rounded-xl relative overflow-hidden shadow-[0_0_30px_rgba(245,158,11,0.05)]">
                <div className="absolute top-4 right-4 text-[10px] sm:text-xs font-black bg-amber-500/20 text-amber-500 px-2 py-1 rounded-md">10% Cut</div>
                <p className="text-zinc-400 font-bold text-xs sm:text-sm mb-1">Platform Revenue</p>
                <p className="text-2xl sm:text-4xl font-black text-amber-400">Rs. {platformCut.toLocaleString()}</p>
              </div>
            </div>

            {/* REAL System Status */}
            <div className="bg-[#111113] border border-zinc-800 rounded-xl p-5 sm:p-6">
              <h2 className="text-lg sm:text-xl font-black flex items-center gap-2 mb-4 sm:mb-6 border-b border-zinc-800 pb-4"><Server className="w-5 h-5 text-blue-400"/> Live System Status</h2>
              <div className="space-y-3 sm:space-y-4">
                <StatusIndicator name="Database Connection" status={dbStatus} />
                <StatusIndicator name="Storage Bucket (medical_records)" status={storageStatus} />
                <StatusIndicator name="Authentication Services" status={authStatus} />
              </div>
            </div>
          </div>
        )}

        {/* 2. DOCTORS TAB (Responsive Table) */}
        {activeTab === 'doctors' && (
          <div className="bg-[#111113] border border-zinc-800 rounded-xl overflow-hidden animate-in fade-in">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead><tr className="bg-[#0a0a0c] text-zinc-400 text-[10px] sm:text-xs uppercase tracking-widest border-b border-zinc-800"><th className="p-4 sm:p-5 font-bold">Doctor Details</th><th className="p-4 sm:p-5 font-bold">Specialty & Clinic</th><th className="p-4 sm:p-5 font-bold">Fee</th><th className="p-4 sm:p-5 font-bold text-right">Admin Actions</th></tr></thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {doctors.map(doc => (
                    <tr key={doc.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 sm:p-5"><p className="font-black text-white text-base sm:text-lg">{doc.full_name}</p><p className="text-[10px] sm:text-xs text-zinc-500 font-mono mt-1">{doc.email}</p></td>
                      <td className="p-4 sm:p-5"><p className="font-bold text-blue-400 text-sm sm:text-base">{doc.specialty || 'Unassigned'}</p><p className="text-xs sm:text-sm text-zinc-400">{doc.hospital || 'No Clinic'} • {doc.city || 'No City'}</p></td>
                      <td className="p-4 sm:p-5 font-black text-emerald-400 text-sm sm:text-base">Rs. {doc.fee || 0}</td>
                      <td className="p-4 sm:p-5 text-right">
                        <button onClick={() => handleEditClick(doc)} className="p-1.5 sm:p-2 text-zinc-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all mr-1 sm:mr-2"><Edit className="w-4 h-4 sm:w-5 sm:h-5"/></button>
                        <button onClick={() => handleDeleteUser(doc.id, 'doctor')} className="p-1.5 sm:p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"><Trash2 className="w-4 h-4 sm:w-5 sm:h-5"/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. PATIENTS TAB (Responsive Table) */}
        {activeTab === 'patients' && (
          <div className="bg-[#111113] border border-zinc-800 rounded-xl overflow-hidden animate-in fade-in">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead><tr className="bg-[#0a0a0c] text-zinc-400 text-[10px] sm:text-xs uppercase tracking-widest border-b border-zinc-800"><th className="p-4 sm:p-5 font-bold">Patient Details</th><th className="p-4 sm:p-5 font-bold">Contact Info</th><th className="p-4 sm:p-5 font-bold">Blood Group</th><th className="p-4 sm:p-5 font-bold text-right">Admin Actions</th></tr></thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {patients.map(pat => (
                    <tr key={pat.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 sm:p-5"><p className="font-black text-white text-base sm:text-lg">{pat.full_name}</p><p className="text-[10px] sm:text-xs text-zinc-500 font-mono mt-1">{pat.email}</p></td>
                      <td className="p-4 sm:p-5 font-medium text-zinc-300 text-sm sm:text-base">{pat.phone || 'No phone provided'}</td>
                      <td className="p-4 sm:p-5"><span className="bg-red-500/10 text-red-500 font-bold px-2 py-1 sm:px-3 sm:py-1 rounded-md text-xs sm:text-sm border border-red-500/20">{pat.blood_group || 'Unknown'}</span></td>
                      <td className="p-4 sm:p-5 text-right">
                        <button onClick={() => handleEditClick(pat)} className="p-1.5 sm:p-2 text-zinc-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all mr-1 sm:mr-2"><Edit className="w-4 h-4 sm:w-5 sm:h-5"/></button>
                        <button onClick={() => handleDeleteUser(pat.id, 'patient')} className="p-1.5 sm:p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"><Trash2 className="w-4 h-4 sm:w-5 sm:h-5"/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. GLOBAL TIMELINE TAB (Responsive Table) */}
        {activeTab === 'timeline' && (
          <div className="bg-[#111113] border border-zinc-800 rounded-xl overflow-hidden animate-in fade-in">
            <div className="p-4 sm:p-5 bg-purple-500/10 border-b border-purple-500/20 flex items-start sm:items-center gap-3">
              <Clock className="w-5 h-5 text-purple-400 shrink-0 mt-0.5 sm:mt-0" />
              <p className="font-bold text-purple-400 text-xs sm:text-sm">Master chronological view of all system bookings.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead><tr className="bg-[#0a0a0c] text-zinc-400 text-[10px] sm:text-xs uppercase tracking-widest border-b border-zinc-800"><th className="p-4 sm:p-5 font-bold">Date & Time</th><th className="p-4 sm:p-5 font-bold">Participants</th><th className="p-4 sm:p-5 font-bold">Status & Fee</th><th className="p-4 sm:p-5 font-bold text-right">Delete</th></tr></thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {appointments.map(appt => (
                    <tr key={appt.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 sm:p-5">
                        <p className="font-black text-white text-sm sm:text-base">{new Date(appt.appointment_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                        <p className="text-xs sm:text-sm text-zinc-400 font-bold">{appt.appointment_time}</p>
                      </td>
                      <td className="p-4 sm:p-5">
                        <p className="font-bold text-blue-400 text-xs sm:text-sm mb-1">Doc: {appt.doctor?.full_name || 'Unknown'}</p>
                        <p className="font-bold text-zinc-300 text-xs sm:text-sm">Pat: {appt.patient?.full_name || appt.patient_name || 'Unknown'}</p>
                      </td>
                      <td className="p-4 sm:p-5">
                        <span className={`inline-flex px-2 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-black border ${appt.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : appt.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>{appt.status}</span>
                        <p className="text-[10px] sm:text-xs text-zinc-500 font-bold mt-1.5 sm:mt-2">Fee: Rs. {appt.fee}</p>
                      </td>
                      <td className="p-4 sm:p-5 text-right">
                        <button onClick={() => handleDeleteAppointment(appt.id)} className="p-1.5 sm:p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"><Trash2 className="w-4 h-4 sm:w-5 sm:h-5"/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}