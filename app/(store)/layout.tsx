export const dynamic = 'force-dynamic';

import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-[113px]">
        {children}
      </main>
      <Footer />
    </div>
  );
}
