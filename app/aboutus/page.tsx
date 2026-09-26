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
    description: 'Learn about our mission to eliminate manual recruiting bottlenecks with fully autonomous hiring agents that source, screen, and interview talent without any human help.',
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
      title: "Architecting the future of Autonomous Hiring.",
      description: "B2linq, developed by BillionWorld Pvt Limited, is the premier autonomous hiring platform built to orchestrate end-to-end recruitment without any human help. Our specialized AI agents autonomously source talent, screen candidates, conduct dynamic voice interviews, and make data-driven hiring decisions—delivering seamless, unbiased hiring without human intervention.",
      principles: [
        {
          title: "Autonomous Efficiency",
          description: "We eliminate manual recruiting bottlenecks through end-to-end autonomous agentic pipelines that source, screen, and interview candidates without any human help.",
          icon: "⚡"
        },
        {
          title: "Objective Precision",
          description: "Every candidate assessment is backed by verified capability data, structured AI voice interviews, and standardized scoring with zero human bias.",
          icon: "💎"
        },
        {
          title: "Instant Velocity",
          description: "Accelerate hiring from job opening to final candidate evaluation in minutes rather than weeks, operating 24/7 without human latency.",
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
            Join us in reshaping autonomous hiring.
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 leading-relaxed transition-colors duration-300">
            Whether you are scaling high-velocity engineering teams or expanding global operations, 
            B2linq by BillionWorld Pvt Limited empowers organizations to hire top talent end-to-end without any human help.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}

