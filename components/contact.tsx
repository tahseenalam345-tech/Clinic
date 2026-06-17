'use client';

import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';

export function Contact() {
  return (
    <section id="contact" className="py-10 md:py-16 lg:py-24 bg-gradient-to-b from-background to-blue-50/50 dark:to-blue-950/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start">
          
          {/* Left Form */}
          <div className="space-y-6">
            <div className="space-y-2 text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground">
                Get in Touch
              </h2>
              <p className="text-base md:text-lg text-foreground-muted">
                Need assistance? Reach out to our reception desk directly.
              </p>
            </div>

            <form className="space-y-4 glass-card p-6 md:p-8 rounded-3xl">
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-foreground mb-2 ml-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="M Tahseen Alam"
                  className="w-full px-5 md:px-6 py-3 md:py-4 bg-white dark:bg-zinc-800 border border-blue-200 dark:border-zinc-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-foreground-muted/50 transition-all duration-300 text-sm md:text-base text-foreground"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-bold text-foreground mb-2 ml-2">
                  Email / Phone Number
                </label>
                <input
                  id="email"
                  type="text"
                  placeholder="tahseen@example.com or 03xxxxxxxxx"
                  className="w-full px-5 md:px-6 py-3 md:py-4 bg-white dark:bg-zinc-800 border border-blue-200 dark:border-zinc-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-foreground-muted/50 transition-all duration-300 text-sm md:text-base text-foreground"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-bold text-foreground mb-2 ml-2">
                  Message
                </label>
                <textarea
                  id="message"
                  placeholder="How can we help you today?"
                  rows={4}
                  className="w-full px-5 md:px-6 py-3 md:py-4 bg-white dark:bg-zinc-800 border border-blue-200 dark:border-zinc-700 rounded-3xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none placeholder:text-foreground-muted/50 transition-all duration-300 text-sm md:text-base text-foreground"
                />
              </div>

              <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:shadow-glow transition-all duration-300 font-bold py-4 md:py-6 text-base rounded-full btn-glow border-0 mt-2 hover-wave">
                Send Message
              </Button>
            </form>
          </div>

          {/* Right Info */}
          <div className="space-y-6">
            <div className="space-y-4">
              {[
                {
                  icon: Phone,
                  label: 'Reception (Call)',
                  value: '051 999 999',
                  href: 'tel:051999999',
                  bg: 'bg-blue-500',
                },
                {
                  icon: MessageCircle,
                  label: 'WhatsApp',
                  value: '+92 326 1688628',
                  href: 'https://wa.me/923261688628',
                  bg: 'bg-green-500',
                },
                {
                  icon: MapPin,
                  label: 'Hospital Address',
                  value: 'Crescent Care Medical Center, Gulberg III, Lahore, Pakistan',
                  href: '#',
                  bg: 'bg-gradient-to-r from-blue-500 to-blue-700',
                },
              ].map((contact, i) => {
                const Icon = contact.icon;
                return (
                  <a
                    key={i}
                    href={contact.href}
                    target={contact.icon === MessageCircle ? "_blank" : "_self"}
                    // Added items-start so icon stays at top if text wraps
                    className="flex gap-4 p-4 md:p-5 glass-card hover:shadow-glow transition-all duration-300 group rounded-3xl items-start sm:items-center"
                  >
                    <div className={`w-12 h-12 md:w-14 md:h-14 ${contact.bg} rounded-full flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="font-bold text-foreground text-sm md:text-base">
                        {contact.label}
                      </div>
                      {/* Removed 'truncate' and added 'leading-relaxed' to allow text wrapping */}
                      <div className="text-foreground-muted text-xs md:text-sm font-medium leading-relaxed mt-0.5">
                        {contact.value}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>

            <div className="glass-card p-6 md:p-8 space-y-4 rounded-3xl">
              <h3 className="font-bold text-foreground text-lg md:text-xl">Outpatient Timings</h3>
              <div className="space-y-3 text-sm md:text-base">
                <div className="flex justify-between items-center border-b border-border/50 pb-2">
                  <span className="text-foreground-muted font-medium">Mon - Sat</span>
                  <span className="text-foreground font-bold text-right">9:00 AM - 10:00 PM</span>
                </div>
                <div className="flex justify-between items-center border-b border-border/50 pb-2">
                  <span className="text-foreground-muted font-medium">Emergency</span>
                  <span className="text-green-600 font-bold text-right">24/7 Open</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground-muted font-medium">Sun (OPD)</span>
                  <span className="text-foreground font-bold text-red-500 text-right">Closed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}