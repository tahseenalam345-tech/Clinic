'use client';

import Link from 'next/link';
import { Heart, MapPin, Phone, Mail, ChevronRight, Activity } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#050507] border-t border-zinc-800 pt-16 pb-8 relative overflow-hidden z-10">
      {/* Background Ambient Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Section */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-tight">Crescent Care</span>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Medical Center</p>
              </div>
            </Link>
            <p className="text-sm text-zinc-400 font-medium leading-relaxed">
              The most advanced Electronic Health Record system. Connect with top specialists, manage appointments, and secure your medical history instantly.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-black text-lg mb-6 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> Platform
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="text-sm font-bold text-zinc-400 hover:text-primary transition-colors flex items-center gap-2 group">
                  <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-primary transition-colors" /> Home
                </Link>
              </li>
              <li>
                <Link href="/doctors" className="text-sm font-bold text-zinc-400 hover:text-primary transition-colors flex items-center gap-2 group">
                  <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-primary transition-colors" /> Find a Specialist
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm font-bold text-zinc-400 hover:text-primary transition-colors flex items-center gap-2 group">
                  <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-primary transition-colors" /> Create Account
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm font-bold text-zinc-400 hover:text-primary transition-colors flex items-center gap-2 group">
                  <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-primary transition-colors" /> Patient Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Staff & Admin Links */}
          <div>
            <h3 className="text-white font-black text-lg mb-6 flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-500" /> Secure Portals
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href="/dashboard/doctor" className="text-sm font-bold text-zinc-400 hover:text-purple-400 transition-colors flex items-center gap-2 group">
                  <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-purple-500 transition-colors" /> Doctor Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/admin" className="text-sm font-bold text-zinc-400 hover:text-purple-400 transition-colors flex items-center gap-2 group">
                  <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-purple-500 transition-colors" /> Nexus Command Center
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-white transition-colors" /> Staff Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-black text-lg mb-6 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" /> Contact Us
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
                <span className="text-sm font-medium text-zinc-400">Crescent Care Medical Center, Lahore, Pakistan</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-zinc-500 shrink-0" />
                <span className="text-sm font-medium text-zinc-400">051 999 999</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-zinc-500 shrink-0" />
                <span className="text-sm font-medium text-zinc-400">support@crescentcare.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Aura Dept Badge */}
        <div className="pt-8 border-t border-zinc-800/80 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-bold text-zinc-500 text-center md:text-left">
            &copy; {currentYear} Crescent Care. All rights reserved. Secure EHR System.
          </p>

          {/* AURA DEPT OFFICIAL LINK */}
          <a 
            href="https://auradept-ang.vercel.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex items-center gap-2 sm:gap-2.5 text-[10px] sm:text-xs font-black tracking-widest text-zinc-400 hover:text-white transition-all bg-[#0a0a0c] hover:bg-[#111113] px-4 py-2 sm:py-2.5 rounded-full border border-zinc-800 hover:border-primary/50 shadow-sm hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
          >
            <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 fill-emerald-500 group-hover:animate-pulse" />
            <span>DESIGNED BY <span className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">AURA DEPT OFFICIAL</span></span>
          </a>
        </div>
      </div>
    </footer>
  );
}