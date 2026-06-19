'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { createClient } from '@/lib/supabase/client';
import { ShieldCheck, Users, Stethoscope, Activity, DollarSign, Calendar, Trash2, Ban, CheckCircle2 } from 'lucide-react';

export default function AdminDashboard() {
  const supabase = createClient();
  const router = useRouter();
  
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'patients'>('overview');
  
  // Platform Data
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- ROLE GUARD & DATA FETCHING ---
  useEffect(() => {
    const verifyAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      
      // STRICT ADMIN GUARD
      if (profile?.role !== 'admin') {
        router.push('/'); // Kick non-admins out to the home page
        return;
      } 
      
      setCheckingAuth(false);
      
      // Fetch All Platform Data
      const [docsRes, patsRes, apptsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('role', 'doctor').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').eq('role', 'patient').order('created_at', { ascending: false }),
        supabase.from('appointments').select('*')
      ]);

      if (docsRes.data) setDoctors(docsRes.data);
      if (patsRes.data) setPatients(patsRes.data);
      if (apptsRes.data) setAppointments(apptsRes.data);
      
      setIsLoading(false);
    };
    verifyAndFetch();
  }, [router, supabase]);

  // --- METRICS CALCULATION ---
  const totalRevenue = appointments.reduce((sum, appt) => sum + (appt.fee || 0), 0);
  const platformFeeRevenue = appointments.length * 100; // Rs. 100 platform fee per booking

  if (checkingAuth) return <div className="min-h-screen flex items-center justify-center font-black text-primary animate-pulse text-xl">Securing Command Center...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      <Header />

      <main className="flex-1 py-10 md:py-16 relative overflow-hidden">
        {/* Background Ambience */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10 float-slower" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border/50 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 font-black text-xs uppercase tracking-widest mb-4 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                <ShieldCheck className="w-4 h-4" /> Level 5 Access
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-foreground">
                Nexus <span className="text-gradient drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">Command Center</span>
              </h1>
              <p className="text-foreground-muted font-medium mt-2">Manage users, monitor platform health, and track revenue.</p>
            </div>
            
            {/* Tabs */}
            <div className="flex bg-[#111113] border border-zinc-800 p-1.5 rounded-full">
              <button onClick={() => setActiveTab('overview')} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-primary text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'text-foreground-muted hover:text-foreground'}`}>Overview</button>
              <button onClick={() => setActiveTab('doctors')} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'doctors' ? 'bg-primary text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'text-foreground-muted hover:text-foreground'}`}>Doctors</button>
              <button onClick={() => setActiveTab('patients')} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'patients' ? 'bg-primary text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'text-foreground-muted hover:text-foreground'}`}>Patients</button>
            </div>
          </div>

          {isLoading ? (
            <div className="py-20 text-center font-bold text-primary animate-pulse text-xl">Aggregating Platform Data...</div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                  {/* Top Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="glass-card p-6 rounded-3xl border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-500/5 to-transparent">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-2xl"><Users className="w-6 h-6 text-blue-500" /></div>
                        <span className="text-xs font-black text-green-500 bg-green-500/10 px-2 py-1 rounded-md">Live</span>
                      </div>
                      <p className="text-foreground-muted font-bold text-sm">Total Patients</p>
                      <h3 className="text-3xl font-black text-foreground">{patients.length}</h3>
                    </div>

                    <div className="glass-card p-6 rounded-3xl border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-500/5 to-transparent">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-500/10 rounded-2xl"><Stethoscope className="w-6 h-6 text-emerald-500" /></div>
                        <span className="text-xs font-black text-green-500 bg-green-500/10 px-2 py-1 rounded-md">Live</span>
                      </div>
                      <p className="text-foreground-muted font-bold text-sm">Verified Doctors</p>
                      <h3 className="text-3xl font-black text-foreground">{doctors.length}</h3>
                    </div>

                    <div className="glass-card p-6 rounded-3xl border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-500/5 to-transparent">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-500/10 rounded-2xl"><Calendar className="w-6 h-6 text-purple-500" /></div>
                        <span className="text-xs font-black text-green-500 bg-green-500/10 px-2 py-1 rounded-md">Live</span>
                      </div>
                      <p className="text-foreground-muted font-bold text-sm">Total Appointments</p>
                      <h3 className="text-3xl font-black text-foreground">{appointments.length}</h3>
                    </div>

                    <div className="glass-card p-6 rounded-3xl border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-500/5 to-transparent shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-amber-500/10 rounded-2xl"><DollarSign className="w-6 h-6 text-amber-500" /></div>
                        <span className="text-xs font-black text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md">Nexus Cut</span>
                      </div>
                      <p className="text-foreground-muted font-bold text-sm">Platform Revenue (Fees)</p>
                      <h3 className="text-3xl font-black text-foreground">Rs. {platformFeeRevenue}</h3>
                    </div>
                  </div>

                  <div className="glass-card p-8 rounded-3xl border border-zinc-800">
                    <h3 className="text-xl font-black text-foreground mb-4 flex items-center gap-2">
                      <Activity className="text-primary" /> System Status
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-[#111113] rounded-2xl border border-zinc-800">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                          <span className="font-bold text-foreground">Database Connection</span>
                        </div>
                        <span className="text-sm font-black text-green-500">Operational</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-[#111113] rounded-2xl border border-zinc-800">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                          <span className="font-bold text-foreground">Storage Bucket (medical_records)</span>
                        </div>
                        <span className="text-sm font-black text-green-500">Operational</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-[#111113] rounded-2xl border border-zinc-800">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                          <span className="font-bold text-foreground">Authentication Services</span>
                        </div>
                        <span className="text-sm font-black text-green-500">Operational</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: DOCTORS */}
              {activeTab === 'doctors' && (
                <div className="glass-card rounded-3xl border border-zinc-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                  <div className="p-6 border-b border-border/50 bg-[#111113]">
                    <h2 className="text-xl font-black text-foreground">Registered Specialists ({doctors.length})</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-black/20 text-foreground-muted text-sm uppercase tracking-wider">
                          <th className="p-4 font-bold">Doctor</th>
                          <th className="p-4 font-bold">Location</th>
                          <th className="p-4 font-bold">Fee</th>
                          <th className="p-4 font-bold text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {doctors.map(doc => (
                          <tr key={doc.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 flex items-center gap-3">
                              <div className={`w-10 h-10 bg-gradient-to-br ${doc.bg || 'from-blue-600 to-blue-400'} rounded-full flex items-center justify-center text-white font-black text-xs`}>
                                {doc.initials || doc.full_name?.substring(0, 2).toUpperCase() || 'DR'}
                              </div>
                              <div>
                                <p className="font-bold text-foreground">{doc.full_name}</p>
                                <p className="text-xs text-primary font-medium">{doc.specialty}</p>
                              </div>
                            </td>
                            <td className="p-4 text-sm font-medium text-foreground-muted">{doc.hospital}, {doc.city}</td>
                            <td className="p-4 font-black text-foreground">Rs. {doc.fee}</td>
                            <td className="p-4 text-right">
                              <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-black">
                                <CheckCircle2 className="w-3 h-3" /> Verified
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: PATIENTS */}
              {activeTab === 'patients' && (
                <div className="glass-card rounded-3xl border border-zinc-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                  <div className="p-6 border-b border-border/50 bg-[#111113]">
                    <h2 className="text-xl font-black text-foreground">Registered Patients ({patients.length})</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-black/20 text-foreground-muted text-sm uppercase tracking-wider">
                          <th className="p-4 font-bold">Patient Name</th>
                          <th className="p-4 font-bold">Email</th>
                          <th className="p-4 font-bold">Phone</th>
                          <th className="p-4 font-bold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {patients.map(pat => (
                          <tr key={pat.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 font-bold text-foreground">{pat.full_name || 'Unnamed User'}</td>
                            <td className="p-4 text-sm font-medium text-foreground-muted">{pat.email}</td>
                            <td className="p-4 text-sm font-medium text-foreground-muted">{pat.phone || 'N/A'}</td>
                            <td className="p-4 text-right space-x-2">
                              <button title="Suspend User" className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-colors">
                                <Ban className="w-4 h-4" />
                              </button>
                              <button title="Delete Data" className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
}