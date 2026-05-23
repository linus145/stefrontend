import { MetadataRoute } from 'next';
import { publicService } from '@/services/public.service';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = 'https://b2linq.com';
  
  // Public static routes
  const staticRoutes = [
    '',
    '/aboutus',
    '/pricing',
    '/book-demo',
    '/careers',
    '/login',
    '/register',
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: (route === '' ? 'daily' : 'weekly') as any,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Fetch dynamic blog routes from backend REST API
  let blogRoutes: any[] = [];
  try {
    const blogs = await publicService.getBlogs();
    if (Array.isArray(blogs)) {
      blogRoutes = blogs.map((blog: any) => ({
        url: `${siteUrl}/blogs/${blog.slug}`,
        // Handle ISO Date parsing safely
        lastModified: blog.date ? new Date(blog.date) : new Date(),
        changeFrequency: 'monthly' as any,
        priority: 0.6,
      }));
    }
  } catch (error) {
    console.error('Error fetching blogs inside sitemap generation:', error);
  }

  return [...staticRoutes, ...blogRoutes];
}
