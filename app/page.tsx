import { Header } from '@/components/header';
import { Hero } from '@/components/hero';
import { TopDoctors } from '@/components/top-doctors';
import { QuickBook } from '@/components/quick-book';
import { Contact } from '@/components/contact';
import { Features } from '@/components/features';
import { Footer } from '@/components/footer';

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <Hero />
        <TopDoctors />
        
        {/* NEW COMPONENT ADDED HERE */}
        <QuickBook />
        
        <Contact />
        <Features />
      </main>
      <Footer />
    </div>
  );
}