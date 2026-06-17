'use client';

import { Shield, Users, Zap, Clock } from 'lucide-react';

const features = [
  {
    icon: Clock,
    title: 'Fast Scheduling',
    description: 'Book appointments in under 60 seconds with our streamlined interface.',
  },
  {
    icon: Users,
    title: 'Doctor Management',
    description: 'Choose from verified healthcare professionals in your area.',
  },
  {
    icon: Shield,
    title: 'Secure System',
    description: 'Your data is encrypted and protected with industry-leading security.',
  },
  {
    icon: Zap,
    title: 'Online Booking',
    description: 'Available 24/7 from any device, anytime, anywhere.',
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-10 md:py-24 bg-gradient-to-b from-background via-blue-50/50 to-cyan-50/50 dark:via-zinc-950/50 dark:to-blue-950/10 overflow-hidden">
      <div className="absolute top-1/4 right-0 w-64 h-64 md:w-96 md:h-96 bg-cyan-300/10 dark:bg-cyan-600/5 rounded-full blur-3xl -z-10 float" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 md:w-96 md:h-96 bg-blue-300/10 dark:bg-blue-600/5 rounded-full blur-3xl -z-10 float-slow" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-20 space-y-4 md:space-y-6">
          <div className="inline-block glass-card px-4 py-2 md:px-5 md:py-3 card-hover rounded-full">
            <span className="text-primary dark:text-blue-400 font-bold text-xs md:text-sm uppercase tracking-wider">Features</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-foreground px-4">
            Powerful Features for <span className="text-gradient">Modern Healthcare</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-foreground-muted max-w-2xl mx-auto font-medium px-4">
            Everything you need to manage appointments efficiently and securely
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-7">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group glass-card p-6 md:p-8 card-hover relative overflow-hidden rounded-3xl"
              >
                <div className="relative mb-4 md:mb-6">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-premium relative">
                    <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                </div>
                
                <h3 className="text-base md:text-lg font-black text-foreground mb-2 md:mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm md:text-base text-foreground-muted leading-relaxed font-medium">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}