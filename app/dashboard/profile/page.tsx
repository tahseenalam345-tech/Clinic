'use client';

import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { User, FileText, Download, ArrowLeft, Save, Activity, Droplet, Upload, Plus, X, Stethoscope, Scale, Ruler, Trash2, Edit, CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

// Fallback Mock Data
const MOCK_RECORDS = [
  { id: '1', created_at: 'June 10, 2026', doctor_name: 'Dr. Tariq Mahmood', type: 'Prescription', file_url: 'Rx_Cardiology.pdf' },
  { id: '2', created_at: 'May 22, 2026', doctor_name: 'Crescent Lab', type: 'Blood Test Report', file_url: 'CBC_Report.pdf' },
];

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// Generate Dropdown Options
const WEIGHT_OPTIONS = Array.from({ length: 111 }, (_, i) => `${i + 40} kg`);
const HEIGHT_OPTIONS: string[] = [];
for (let f = 4; f <= 7; f++) {
  for (let i = 0; i < 12; i++) {
    if (f === 7 && i > 0) break;
    HEIGHT_OPTIONS.push(`${f} ft ${i} in`);
  }
}
const YEAR_OPTIONS = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

export default function PatientProfile() {
  const supabase = createClient();
  
  // Real State for Profile
  const [profile, setProfile] = useState({
    full_name: 'M Tahseen Alam',
    email: 'tahseen@example.com',
    phone: '0300 1234567',
    dob: '2003-08-15', // Set to align with 22 years of age
    gender: 'Male',
    emergency_contact: '0300 7654321',
    blood_group: 'O+',
    weight: '75 kg',
    height: '5 ft 10 in',
    disability: 'None',
    allergies: 'None',
    chronic_diseases: 'None',
    current_symptoms: 'Mild stomach pain'
  });
  
  const [records, setRecords] = useState<any[]>(MOCK_RECORDS);
  const [isSaving, setIsSaving] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Modals & Popovers State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadData, setUploadData] = useState({ id: '', doctor: '', type: 'Blood Test Report', file: null as File | null | string });

  // Custom DOB Calendar State
  const [showDobCalendar, setShowDobCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date(profile.dob || '2003-08-15'));

  // --- STYLING ---
  // The exact Neon Glow requested for every field
  const neonInputClass = "w-full px-5 py-3.5 bg-[#111113] border-2 border-zinc-800 rounded-full focus:outline-none focus:border-blue-500 focus:shadow-[0_0_20px_rgba(59,130,246,0.6)] focus:ring-4 focus:ring-blue-500/20 hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all duration-300 text-white font-bold text-sm relative z-10 appearance-none";

  // --- AUTO AGE CALCULATOR ---
  const calculatedAge = useMemo(() => {
    if (!profile.dob) return 'Select DOB';
    const dob = new Date(profile.dob);
    const now = new Date(); // June 18, 2026
    let years = now.getFullYear() - dob.getFullYear();
    let months = now.getMonth() - dob.getMonth();
    let days = now.getDate() - dob.getDate();

    if (days < 0) {
      months -= 1;
      days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    return `${years} yrs, ${months} mos, ${days} days`;
  }, [profile.dob]);

  // Load Data on Mount
  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (prof) setProfile(prev => ({ ...prev, ...prof }));
      const { data: recs } = await supabase.from('medical_records').select('*').eq('patient_id', user.id).order('created_at', { ascending: false });
      if (recs && recs.length > 0) setRecords(recs);
    };
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from('profiles').upsert({ id: user.id, ...profile });
    else await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  // --- CALENDAR LOGIC ---
  const daysInMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay();

  const handleSelectDate = (day: number) => {
    const newDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
    const formatted = newDate.toISOString().split('T')[0];
    setProfile({ ...profile, dob: formatted });
    setShowDobCalendar(false);
  };

  // --- RECORD MANAGEMENT ACTIONS ---
  const handleDownload = async (id: string) => {
    setDownloadingId(id);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setDownloadingId(null);
  };

  const handleDeleteRecord = async (id: string) => {
    if(!confirm("Are you sure you want to permanently delete this report?")) return;
    setRecords(records.filter(r => r.id !== id));
  };

  const openEditModal = (record: any) => {
    setUploadData({ id: record.id, doctor: record.doctor_name, type: record.type, file: record.file_url });
    setShowEditModal(true);
  };

  const confirmUploadOrEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadData.doctor) return;
    setIsUploading(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    
    if (showEditModal) {
      setRecords(records.map(r => r.id === uploadData.id ? { ...r, doctor_name: uploadData.doctor, type: uploadData.type } : r));
    } else {
      const newRecord = {
        id: Math.random().toString(),
        created_at: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        doctor_name: uploadData.doctor,
        type: uploadData.type,
        file_url: typeof uploadData.file === 'object' && uploadData.file ? uploadData.file.name : 'Unknown_File.pdf'
      };
      setRecords([newRecord, ...records]);
    }
    setIsUploading(false); setShowUploadModal(false); setShowEditModal(false);
    setUploadData({ id: '', doctor: '', type: 'Blood Test Report', file: null });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      <Header />

      {/* SHARED UPLOAD / EDIT MODAL */}
      {(showUploadModal || showEditModal) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isUploading && (setShowUploadModal(false), setShowEditModal(false))} />
          <div className="glass-card bg-background/95 w-full max-w-md rounded-3xl z-10 p-8 border border-blue-500/50 shadow-[0_0_40px_rgba(59,130,246,0.3)] animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-foreground flex items-center gap-2">
                {showEditModal ? <Edit className="w-5 h-5 text-amber-500"/> : <Upload className="w-5 h-5 text-primary"/>} 
                {showEditModal ? 'Edit Report Info' : 'Upload Report'}
              </h2>
              {!isUploading && <button onClick={() => (setShowUploadModal(false), setShowEditModal(false))} className="p-2 hover:bg-white/10 rounded-full"><X className="w-5 h-5 text-foreground"/></button>}
            </div>
            
            <form onSubmit={confirmUploadOrEdit} className="space-y-5 relative">
              <div className="relative">
                <label className="block text-sm font-bold text-foreground mb-2 ml-2">Select Doctor or Lab</label>
                <div className="relative">
                  <select required value={uploadData.doctor} onChange={e => setUploadData({...uploadData, doctor: e.target.value})} className={neonInputClass}>
                    <option value="" disabled>Choose an option...</option>
                    <option value="Dr. Tariq Mahmood">Dr. Tariq Mahmood</option>
                    <option value="Dr. Ayesha Khan">Dr. Ayesha Khan</option>
                    <option value="External Lab (Chughtai/Shaukat Khanum)">External Lab / Private</option>
                  </select>
                  <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none z-20"><ArrowLeft className="w-4 h-4 -rotate-90 text-primary drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]" /></div>
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-bold text-foreground mb-2 ml-2">Report Type</label>
                <div className="relative">
                  <select value={uploadData.type} onChange={e => setUploadData({...uploadData, type: e.target.value})} className={neonInputClass}>
                    <option>Blood Test Report</option>
                    <option>Prescription</option>
                    <option>X-Ray / MRI Scan</option>
                    <option>Urine Test Report</option>
                  </select>
                  <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none z-20"><ArrowLeft className="w-4 h-4 -rotate-90 text-primary drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]" /></div>
                </div>
              </div>

              {!showEditModal && (
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2 ml-2">Attach PDF or Image</label>
                  <input type="file" required accept=".pdf,.jpg,.png" onChange={e => setUploadData({...uploadData, file: e.target.files?.[0] || null})} className="w-full text-sm text-foreground-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-primary file:text-white hover:file:bg-blue-600 transition-all cursor-pointer" />
                </div>
              )}

              <Button type="submit" disabled={isUploading || (!showEditModal && !uploadData.file)} className={`w-full text-white rounded-full font-bold py-6 mt-4 hover-wave btn-glow border-0 ${showEditModal ? 'bg-amber-500 hover:bg-amber-600 shadow-[0_0_20px_rgba(245,158,11,0.4)]' : 'bg-gradient-to-r from-blue-500 to-blue-700 shadow-[0_0_20px_rgba(59,130,246,0.4)]'}`}>
                {isUploading ? 'Processing...' : (showEditModal ? 'Save Changes' : 'Confirm Upload')}
              </Button>
            </form>
          </div>
        </div>
      )}

      <main className="flex-1 py-10 md:py-16 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10 float-slower" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div>
            <Link href="/dashboard/patient" className="inline-flex items-center gap-2 text-foreground-muted hover:text-primary font-bold mb-4 transition-colors">
              <ArrowLeft className="w-5 h-5" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl md:text-4xl font-black text-foreground">
              Profile & <span className="text-primary dark:text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">Records</span>
            </h1>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-start">
            
            {/* LEFT COLUMN: Profile Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card p-6 md:p-8 rounded-3xl border border-blue-500/20 shadow-lg relative z-10">
                <form onSubmit={handleSave} className="space-y-8">
                  
                  {/* Basic Info */}
                  <div>
                    <h2 className="text-xl font-black text-foreground flex items-center gap-2 mb-6 border-b border-border/50 pb-4">
                      <User className="w-5 h-5 text-primary" /> Personal Information
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div><label className="block text-sm font-bold text-foreground mb-2 ml-2">Full Name</label><input type="text" value={profile.full_name} onChange={e => setProfile({...profile, full_name: e.target.value})} className={neonInputClass}/></div>
                      <div><label className="block text-sm font-bold text-foreground mb-2 ml-2">Email</label><input type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} className={neonInputClass}/></div>
                      <div><label className="block text-sm font-bold text-foreground mb-2 ml-2">Phone</label><input type="text" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className={neonInputClass}/></div>
                      
                      <div className="relative">
                        <label className="block text-sm font-bold text-foreground mb-2 ml-2">Gender</label>
                        <div className="relative">
                          <select value={profile.gender} onChange={e => setProfile({...profile, gender: e.target.value})} className={neonInputClass}>
                            <option>Male</option><option>Female</option><option>Other</option><option>Prefer not to say</option>
                          </select>
                          <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none z-20"><ArrowLeft className="w-4 h-4 -rotate-90 text-primary drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]" /></div>
                        </div>
                      </div>

                      {/* DOB Field with Custom Neon Calendar */}
                      <div className="relative">
                        <label className="block text-sm font-bold text-foreground mb-2 ml-2">Date of Birth</label>
                        <div 
                          onClick={() => setShowDobCalendar(true)}
                          className={`${neonInputClass} flex items-center justify-between cursor-pointer`}
                        >
                          <span>{new Date(profile.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric'})}</span>
                          <CalendarIcon className="w-4 h-4 text-primary drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]" />
                        </div>
                        
                        {/* CUSTOM NEON CALENDAR POPOVER */}
                        {showDobCalendar && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowDobCalendar(false)} />
                            <div className="absolute top-full left-0 mt-2 w-full z-50 glass-card bg-[#0a0a0c]/95 backdrop-blur-xl border border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.3)] rounded-3xl p-5 animate-in zoom-in-95">
                              <div className="flex items-center justify-between mb-4">
                                <button type="button" onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))} className="p-2 hover:bg-blue-500/20 rounded-full transition-colors"><ChevronLeft className="w-5 h-5 text-primary" /></button>
                                
                                <div className="flex gap-2">
                                  <select value={calendarDate.getMonth()} onChange={e => setCalendarDate(new Date(calendarDate.getFullYear(), parseInt(e.target.value), 1))} className="bg-transparent text-white font-bold outline-none cursor-pointer hover:text-primary">
                                    {MONTH_NAMES.map((m, i) => <option key={m} value={i} className="text-black">{m}</option>)}
                                  </select>
                                  <select value={calendarDate.getFullYear()} onChange={e => setCalendarDate(new Date(parseInt(e.target.value), calendarDate.getMonth(), 1))} className="bg-transparent text-white font-bold outline-none cursor-pointer hover:text-primary">
                                    {YEAR_OPTIONS.map(y => <option key={y} value={y} className="text-black">{y}</option>)}
                                  </select>
                                </div>

                                <button type="button" onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))} className="p-2 hover:bg-blue-500/20 rounded-full transition-colors"><ChevronRight className="w-5 h-5 text-primary" /></button>
                              </div>
                              
                              <div className="grid grid-cols-7 mb-2">
                                {DAYS_OF_WEEK.map(day => <div key={day} className="text-center text-xs font-bold text-primary/70 pb-2">{day}</div>)}
                              </div>
                              <div className="grid grid-cols-7 gap-1">
                                {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className="p-2" />)}
                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                  const dayNumber = i + 1;
                                  const isSelected = new Date(profile.dob).getDate() === dayNumber && new Date(profile.dob).getMonth() === calendarDate.getMonth() && new Date(profile.dob).getFullYear() === calendarDate.getFullYear();
                                  return (
                                    <button
                                      type="button"
                                      key={dayNumber}
                                      onClick={() => handleSelectDate(dayNumber)}
                                      className={`h-10 w-full flex items-center justify-center rounded-xl text-sm font-bold transition-all hover-wave ${
                                        isSelected ? 'bg-primary text-white shadow-[0_0_15px_rgba(59,130,246,0.8)]' : 'text-foreground hover:bg-blue-500/20 hover:text-blue-400'
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

                      {/* Read-Only Auto Age Box */}
                      <div>
                        <label className="block text-sm font-bold text-foreground mb-2 ml-2">Current Age</label>
                        <input type="text" readOnly value={calculatedAge} className="w-full px-5 py-3.5 bg-primary/10 border-2 border-primary/30 rounded-full text-primary font-black text-sm outline-none shadow-[inset_0_0_10px_rgba(59,130,246,0.1)] cursor-default"/>
                      </div>

                      <div><label className="block text-sm font-bold text-foreground mb-2 ml-2">Emergency Contact</label><input type="text" placeholder="Relative's Phone No." value={profile.emergency_contact} onChange={e => setProfile({...profile, emergency_contact: e.target.value})} className={neonInputClass}/></div>
                    </div>
                  </div>

                  {/* Medical Info */}
                  <div>
                    <h3 className="text-xl font-black text-foreground flex items-center gap-2 pt-4 border-t border-border/50 mb-6">
                      <Activity className="w-5 h-5 text-red-400" /> Comprehensive Medical Profile
                    </h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                      
                      <div className="relative">
                        <label className="block text-sm font-bold text-foreground mb-2 ml-2 flex items-center gap-1"><Droplet className="w-4 h-4 text-red-500" /> Blood</label>
                        <div className="relative">
                          <select value={profile.blood_group} onChange={e => setProfile({...profile, blood_group: e.target.value})} className={neonInputClass}>
                            <option>A+</option><option>B+</option><option>O+</option><option>AB+</option><option>A-</option><option>B-</option><option>O-</option><option>AB-</option>
                          </select>
                          <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none z-20"><ArrowLeft className="w-4 h-4 -rotate-90 text-primary drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]" /></div>
                        </div>
                      </div>

                      <div className="relative">
                        <label className="block text-sm font-bold text-foreground mb-2 ml-2 flex items-center gap-1"><Scale className="w-4 h-4 text-emerald-500" /> Weight</label>
                        <div className="relative">
                          <select value={profile.weight} onChange={e => setProfile({...profile, weight: e.target.value})} className={neonInputClass}>
                            {WEIGHT_OPTIONS.map(w => <option key={w} value={w}>{w}</option>)}
                          </select>
                          <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none z-20"><ArrowLeft className="w-4 h-4 -rotate-90 text-primary drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]" /></div>
                        </div>
                      </div>

                      <div className="relative">
                        <label className="block text-sm font-bold text-foreground mb-2 ml-2 flex items-center gap-1"><Ruler className="w-4 h-4 text-emerald-500" /> Height</label>
                        <div className="relative">
                          <select value={profile.height} onChange={e => setProfile({...profile, height: e.target.value})} className={neonInputClass}>
                            {HEIGHT_OPTIONS.map(h => <option key={h} value={h}>{h}</option>)}
                          </select>
                          <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none z-20"><ArrowLeft className="w-4 h-4 -rotate-90 text-primary drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]" /></div>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <label className="block text-sm font-bold text-foreground mb-2 ml-2 flex items-center gap-1">Disability</label>
                        <div className="relative">
                          <select value={profile.disability} onChange={e => setProfile({...profile, disability: e.target.value})} className={neonInputClass}>
                            <option>None</option><option>Physical</option><option>Visual</option><option>Hearing</option><option>Cognitive</option><option>Other</option>
                          </select>
                          <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none z-20"><ArrowLeft className="w-4 h-4 -rotate-90 text-primary drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]" /></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div><label className="block text-sm font-bold text-foreground mb-2 ml-2">Permanent / Chronic Diseases</label><input type="text" placeholder="e.g., Diabetes, BP, Cancer" value={profile.chronic_diseases} onChange={e => setProfile({...profile, chronic_diseases: e.target.value})} className={neonInputClass}/></div>
                      <div><label className="block text-sm font-bold text-foreground mb-2 ml-2">Known Allergies</label><input type="text" placeholder="e.g., Peanuts, Penicillin, Dust" value={profile.allergies} onChange={e => setProfile({...profile, allergies: e.target.value})} className={neonInputClass}/></div>
                      <div>
                        <label className="block text-sm font-bold text-primary mb-2 ml-2 flex items-center gap-2"><Stethoscope className="w-4 h-4 drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]"/> Current Symptoms</label>
                        <textarea rows={3} placeholder="Describe your current stomach pain, headaches, etc." value={profile.current_symptoms} onChange={e => setProfile({...profile, current_symptoms: e.target.value})} className={`${neonInputClass} rounded-2xl resize-none`}/>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 border-t border-border/50">
                    <Button type="submit" disabled={isSaving} className="bg-primary text-white font-bold rounded-full px-10 py-6 hover-wave btn-glow border-0 shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                      {isSaving ? 'Saving Updates...' : <><Save className="w-5 h-5 mr-2" /> Save Profile</>}
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            {/* RIGHT COLUMN: Medical Records */}
            <div className="lg:col-span-1 space-y-6">
              <div className="glass-card p-6 md:p-8 rounded-3xl border border-blue-500/20 bg-gradient-to-b from-blue-500/5 to-transparent relative z-0">
                <h2 className="text-xl font-black text-foreground flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-primary drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]" /> Medical Records
                </h2>
                <p className="text-sm text-foreground-muted font-medium mb-6">Manage prescriptions and lab reports.</p>
                
                <Button onClick={() => setShowUploadModal(true)} className="w-full flex items-center justify-center gap-2 py-6 bg-blue-500/10 hover:bg-blue-500/20 text-primary border border-blue-500/50 border-dashed rounded-full font-bold transition-all mb-6 hover-wave shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:shadow-[0_0_25px_rgba(59,130,246,0.4)]">
                  <Plus className="w-5 h-5" /> Upload New Report
                </Button>
                
                <div className="space-y-4">
                  {records.map((record) => (
                    <div key={record.id} className="bg-[#111113] border border-zinc-800 p-4 rounded-3xl hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all group">
                      
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            record.type === 'Prescription' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                          }`}>
                            {record.type}
                          </span>
                          <h4 className="font-bold text-foreground text-sm mt-2">{record.doctor_name}</h4>
                          <p className="text-xs text-foreground-muted font-medium">{record.created_at}</p>
                        </div>
                        
                        <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal(record)} className="p-1.5 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white hover:shadow-[0_0_10px_rgba(245,158,11,0.5)] rounded-full transition-all">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteRecord(record.id)} className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white hover:shadow-[0_0_10px_rgba(239,68,68,0.5)] rounded-full transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      
                      <Button onClick={() => handleDownload(record.id)} disabled={downloadingId === record.id} variant="outline" className="w-full text-xs font-bold rounded-full h-9 border-zinc-700 hover:bg-primary hover:text-white hover:border-primary hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all mt-1">
                        {downloadingId === record.id ? 'Downloading...' : <><Download className="w-3 h-3 mr-2" /> {record.file_url}</>}
                      </Button>
                    </div>
                  ))}
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}