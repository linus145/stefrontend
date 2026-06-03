import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'B2linq - Autonomous Hiring Orchestration Platform',
  description: 'Deploy specialized AI agents that autonomously source, parse, screen, interview, and orchestrate recruitment workflows to the final handshake.',
  keywords: ['autonomous hiring', 'AI recruiter agents', 'talent acquisition', 'resume screening', 'AI voice interviews', 'hiring flow automation', 'recruitment workflow', 'handshake'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} font-sans h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script src="https://accounts.google.com/gsi/client" async defer></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('ste-theme') === 'dark' || (!localStorage.getItem('ste-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  '@id': 'https://www.b2linq.in/#organization',
                  'name': 'B2linq',
                  'url': 'https://www.b2linq.in',
                  'logo': 'https://www.b2linq.in/logo.webp',
                  'sameAs': [
                    'https://www.linkedin.com/company/b2linq'
                  ],
                  'description': 'B2linq is the premier autonomous hiring orchestration platform, leveraging multi-agent systems to source, screen, and interview candidates end-to-end—from initial sourcing to the final handshake.'
                },
                {
                  '@type': 'SoftwareApplication',
                  '@id': 'https://www.b2linq.in/#software',
                  'name': 'B2linq Autonomous Hiring OS',
                  'applicationCategory': 'BusinessApplication',
                  'operatingSystem': 'All',
                  'url': 'https://www.b2linq.in',
                  'offers': {
                    '@type': 'Offer',
                    'price': '0',
                    'priceCurrency': 'USD'
                  },
                  'description': 'An end-to-end autonomous agentic recruitment software that sources talent, performs screening, conducts AI voice interviews, and automates hiring decisions to the final handshake.',
                  'featureList': [
                    'Autonomous Talent Sourcing Agents',
                    'Deep AI Capabilities Screening & Skill Extraction',
                    'Real-Time Structured AI Voice Interviews',
                    'Automated Stage Transitions & Background Checks',
                    'Recruiter & HR Command Workspace',
                    'End-to-End Recruitment Orchestration to Handshake'
                  ]
                },
                {
                  '@type': 'WebSite',
                  '@id': 'https://www.b2linq.in/#website',
                  'url': 'https://www.b2linq.in',
                  'name': 'B2linq Platform',
                  'publisher': {
                    '@id': 'https://www.b2linq.in/#organization'
                  }
                }
              ]
            })
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
