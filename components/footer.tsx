'use client';

import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-blue-900 to-blue-950 text-white py-12 md:py-16 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-blue-500/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-blue-400/10 rounded-full blur-3xl -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center shadow-lg">
                <Heart className="w-5 h-5 fill-white text-white" />
              </div>
              <span className="text-xl font-bold">MediBook</span>
            </div>
            <p className="text-blue-200/80 text-sm leading-relaxed font-medium">
              Simplifying healthcare appointments for providers and patients worldwide.
            </p>
            <div className="flex gap-3">
              {['f', 'x', 'in'].map((social, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 bg-white/15 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/25 transition-all duration-300 text-sm font-bold border border-white/20"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-lg">Product</h4>
            <ul className="space-y-2 text-blue-200/70 text-sm">
              <li><a href="#" className="hover:text-blue-300 transition-colors font-medium">Features</a></li>
              <li><a href="#" className="hover:text-blue-300 transition-colors font-medium">Pricing</a></li>
              <li><a href="#" className="hover:text-blue-300 transition-colors font-medium">Security</a></li>
              <li><a href="#" className="hover:text-blue-300 transition-colors font-medium">Docs</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-lg">Company</h4>
            <ul className="space-y-2 text-blue-200/70 text-sm">
              <li><a href="#" className="hover:text-blue-300 transition-colors font-medium">About Us</a></li>
              <li><a href="#" className="hover:text-blue-300 transition-colors font-medium">Blog</a></li>
              <li><a href="#" className="hover:text-blue-300 transition-colors font-medium">Careers</a></li>
              <li><a href="#" className="hover:text-blue-300 transition-colors font-medium">Press</a></li>
            </ul>
          </div>

          <div className="space-y-3 col-span-2 md:col-span-1">
            <h4 className="font-bold text-lg">Legal</h4>
            <ul className="space-y-2 text-blue-200/70 text-sm flex flex-wrap md:flex-col gap-x-4 md:gap-x-0">
              <li><a href="#" className="hover:text-blue-300 transition-colors font-medium">Privacy</a></li>
              <li><a href="#" className="hover:text-blue-300 transition-colors font-medium">Terms</a></li>
              <li><a href="#" className="hover:text-blue-300 transition-colors font-medium">Cookies</a></li>
              <li><a href="#" className="hover:text-blue-300 transition-colors font-medium">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-blue-400/20 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-blue-200/60 text-xs md:text-sm">
            <div className="font-medium text-center md:text-left">
              &copy; 2026 MediBook. All rights reserved.[cite: 9]
            </div>
            <div className="flex gap-4 md:gap-6">
              <a href="#" className="hover:text-blue-300 transition-colors font-medium">Status</a>
              <a href="#" className="hover:text-blue-300 transition-colors font-medium">Updates</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}