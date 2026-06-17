'use client';

import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    title: 'Patient',
    content: 'MediBook made scheduling my doctor visit so easy. No more phone calls or waiting hours on hold. Highly recommended!',
    rating: 5,
    initials: 'SJ',
  },
  {
    name: 'Dr. Michael Chen',
    title: 'Healthcare Provider',
    content: 'As a clinician, this system has streamlined my practice. My staff loves it, and patients appreciate the convenience.',
    rating: 5,
    initials: 'MC',
  },
  {
    name: 'Emily Rodriguez',
    title: 'Clinic Manager',
    content: 'We decreased no-shows by 40% after implementing MediBook. The analytics dashboard is incredibly helpful.',
    rating: 5,
    initials: 'ER',
  },
  {
    name: 'James Wilson',
    title: 'Patient',
    content: 'The reminder notifications are fantastic. I never miss appointments anymore, and rescheduling is a breeze.',
    rating: 5,
    initials: 'JW',
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="relative py-16 md:py-32 lg:py-40 bg-gradient-to-b from-blue-50/50 via-cyan-50/30 to-background dark:from-blue-950/10 dark:via-zinc-950/50 overflow-hidden">
      <div className="absolute top-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-blue-300/10 dark:bg-blue-600/5 rounded-full blur-3xl -z-10 float-slow" />
      <div className="absolute bottom-1/3 right-0 w-64 h-64 md:w-96 md:h-96 bg-cyan-300/10 dark:bg-cyan-600/5 rounded-full blur-3xl -z-10 float" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-20 space-y-4 md:space-y-6">
          <div className="inline-block glass-card px-4 py-2 md:px-5 md:py-3 card-hover rounded-full">
            <span className="text-primary dark:text-blue-400 font-bold text-xs md:text-sm uppercase tracking-wider">Testimonials</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-foreground">
            Trusted by <span className="text-gradient">Healthcare Professionals</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-foreground-muted max-w-2xl mx-auto font-medium px-4">
            See what doctors, clinics, and patients say about MediBook
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-7">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="glass-card p-6 md:p-8 card-hover relative overflow-hidden rounded-3xl flex flex-col"
            >
              <div className="flex gap-1 mb-4 md:mb-6">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 md:w-5 md:h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              <p className="text-foreground mb-6 md:mb-8 leading-relaxed font-bold text-sm md:text-base flex-1">
                &quot;{testimonial.content}&quot;
              </p>

              <div className="flex items-center gap-3 md:gap-4 mt-auto">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-black text-xs md:text-sm shadow-premium shrink-0">
                  {testimonial.initials}
                </div>
                <div>
                  <div className="font-black text-foreground text-sm">
                    {testimonial.name}
                  </div>
                  <div className="text-foreground-muted text-xs font-semibold">
                    {testimonial.title}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 md:mt-24 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 border-t border-blue-200/50 dark:border-zinc-800 pt-12 md:pt-20">
          {[
            { value: '15,000+', label: 'Active Users' },
            { value: '45,000+', label: 'Appointments' },
            { value: '250+', label: 'Providers' },
            { value: '98%', label: 'Satisfaction' },
          ].map((stat, i) => (
            <div key={i} className="text-center space-y-2 md:space-y-4 glass-card p-6 md:p-8 card-hover rounded-3xl">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gradient">
                {stat.value}
              </div>
              <div className="text-foreground-muted text-xs md:text-sm font-bold uppercase tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}