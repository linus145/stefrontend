import { Header } from '@/components/Public/header';
import { Footer } from '@/components/Public/footer';
import { ContactForm } from '@/components/contactus/contact-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | B2linq Platform',
  description: 'Get in touch with the B2linq team.',
};

export default function ContactPage() {
  return (
    <div className="bg-white text-slate-900 overflow-hidden min-h-screen font-sans selection:bg-indigo-100">
      <Header />
      
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,rgba(79,70,229,0.05)_0%,transparent_50%)] pointer-events-none" />

      <main className="relative z-10 w-full pt-32 pb-24">
        <section className="px-6 max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">
            Get in <span className="text-indigo-600">Touch.</span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Have questions about the platform? Our team is here to help you scale your network.
          </p>
        </section>

        <section className="px-6 max-w-3xl mx-auto">
          <ContactForm />
        </section>

        <section className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto px-6">
           <div className="text-center">
             <h4 className="font-bold text-slate-900 mb-2">Support</h4>
             <p className="text-sm text-slate-500">support@b2linq.com</p>
           </div>
           <div className="text-center">
             <h4 className="font-bold text-slate-900 mb-2">Partnerships</h4>
             <p className="text-sm text-slate-500">partners@b2linq.com</p>
           </div>
           <div className="text-center">
             <h4 className="font-bold text-slate-900 mb-2">Press</h4>
             <p className="text-sm text-slate-500">press@b2linq.com</p>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
