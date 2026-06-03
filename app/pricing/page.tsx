import { Header } from '@/components/Public/header';
import { Footer } from '@/components/Public/footer';
import { PricingTable } from '@/components/Public/pricing/pricing-table';
import { Metadata } from 'next';
import { getPageMetadata } from '@/lib/seo';
import { SEOStructuredData } from '@/components/Public/seo-structured-data';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/pricing', {
    title: 'Pricing Plans | B2linq Autonomous Recruitment Platform',
    description: 'Simple, transparent pricing tailored to your scale. Deploy autonomous AI sourcing, screening, and voice interview agents that save hours of human effort.',
  });
}

export default function PricingPage() {
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
        'name': 'Pricing',
        'item': 'https://www.b2linq.in/pricing'
      }
    ]
  };

  const productData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': 'B2linq Autonomous Recruiting Subscription',
    'image': 'https://www.b2linq.in/logo.webp',
    'description': 'Subscription plans to deploy autonomous AI agents that handle talent sourcing, resume processing, and dynamic voice screening interviews.',
    'brand': {
      '@type': 'Brand',
      'name': 'B2linq'
    },
    'offers': {
      '@type': 'AggregateOffer',
      'priceCurrency': 'USD',
      'lowPrice': '0',
      'highPrice': '999',
      'offerCount': '3',
      'offers': [
        {
          '@type': 'Offer',
          'name': 'Free Tier',
          'price': '0',
          'priceCurrency': 'USD',
          'category': 'SaaS Subscription'
        },
        {
          '@type': 'Offer',
          'name': 'Growth Plan',
          'price': '199',
          'priceCurrency': 'USD',
          'category': 'SaaS Subscription'
        },
        {
          '@type': 'Offer',
          'name': 'Enterprise Plan',
          'price': '999',
          'priceCurrency': 'USD',
          'category': 'SaaS Subscription'
        }
      ]
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden min-h-screen font-sans selection:bg-blue-100 relative transition-colors duration-300">
      <SEOStructuredData data={[breadcrumbData, productData]} />
      {/* Background Decorative Gradients */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(10,102,194,0.05)_0%,transparent_55%)] pointer-events-none" />
      <div className="fixed top-1/4 right-0 w-96 h-96 bg-blue-200/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 left-0 w-96 h-96 bg-indigo-200/10 rounded-full blur-3xl pointer-events-none" />

      <Header />

      <main className="relative z-10 w-full pt-28 sm:pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <PricingTable />
      </main>

      <Footer />
    </div>
  );
}

