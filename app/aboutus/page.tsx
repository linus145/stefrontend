import { Header } from '@/components/Public/header';
import { Footer } from '@/components/Public/footer';
import { AboutHero } from '@/components/aboutus/about-hero';
import { MissionSection } from '@/components/aboutus/mission-section';
import { Metadata } from 'next';
import { publicService } from '@/services/public.service';
import { getPageMetadata } from '@/lib/seo';
import { SEOStructuredData } from '@/components/Public/seo-structured-data';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/aboutus', {
    title: 'About Us | B2linq Autonomous Hiring Platform',
    description: 'Learn about our mission to eliminate manual recruiting bottlenecks and build the leading autonomous agentic infrastructure connecting exceptional talent and teams.',
  });
}

export default async function AboutPage() {

  let aboutData = null;
  
  try {
    aboutData = await publicService.getAboutUs();
  } catch (error) {
    console.error("Failed to fetch About Us data:", error);
    // Fallback data
    aboutData = {
      title: "Architecting the future of Startup Ecosystems.",
      description: "B2linq was founded on a simple premise: the best ideas deserve the best capital and the best talent, without the noise of traditional networking. We are building the infrastructure for the next generation of founders.",
      principles: [
        {
          title: "Efficiency",
          description: "We eliminate the friction in capital allocation through advanced matching algorithms.",
          icon: "⚡"
        },
        {
          title: "Transparency",
          description: "Every connection on B2linq is backed by verified data and genuine intent.",
          icon: "💎"
        },
        {
          title: "Velocity",
          description: "Moving at the speed of thought. We help startups go from seed to scale faster.",
          icon: "🚀"
        }
      ]
    };
  }

  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://www.b2linq.in'
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'About Us',
        'item': 'https://www.b2linq.in/aboutus'
      }
    ]
  };

  return (
    <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden min-h-screen font-sans selection:bg-indigo-100 transition-colors duration-300 relative">
      <SEOStructuredData data={breadcrumbData} />
      <Header />
      
      {/* Subtle radial glow */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,rgba(79,70,229,0.05)_0%,transparent_50%)] pointer-events-none" />

      <main className="relative z-10 w-full">
        <AboutHero 
          title={aboutData.title} 
          description={aboutData.description} 
        />
        <MissionSection principles={aboutData.principles} />
        
        {/* Call to action section */}
        <section className="py-32 px-6 text-center max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight mb-6 transition-colors duration-300">
            Join us in reshaping the ecosystem.
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 leading-relaxed transition-colors duration-300">
            Whether you are a founder looking for capital or an investor seeking the next unicorn, 
            B2linq is the place where momentum begins.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}

