import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = 'https://www.b2linq.in';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/aboutus',
          '/pricing',
          '/book-demo',
          '/careers',
          '/blogs',
          '/blogs/*',
        ],
        disallow: [
          '/dashboard',
          '/dashboard/*',
          '/recruiter',
          '/recruiter/*',
          '/employee',
          '/employee/*',
          '/Hrtools',
          '/Hrtools/*',
          '/api/*', // Block crawler indexing of raw API backend proxy calls
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
