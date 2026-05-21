import { Metadata } from 'next';
import { seoService } from '@/services/seo.service';

export async function getPageMetadata(path: string, defaultMeta: Metadata): Promise<Metadata> {
  try {
    const data = await seoService.getPageSEO(path);
    if (!data || !data.seo) return defaultMeta;

    const seo = data.seo;
    return {
      title: seo.meta_title || defaultMeta.title,
      description: seo.meta_description || defaultMeta.description,
      keywords: seo.meta_keywords ? seo.meta_keywords.split(',').map((k) => k.trim()) : defaultMeta.keywords,
      openGraph: {
        title: seo.og_title || seo.meta_title || (defaultMeta.openGraph?.title as string),
        description: seo.og_description || seo.meta_description || (defaultMeta.openGraph?.description as string),
        images: seo.og_image ? [{ url: seo.og_image }] : defaultMeta.openGraph?.images,
        type: (seo.og_type || (defaultMeta.openGraph as any)?.type || 'website') as any,
      }
    };
  } catch (error) {
    // Return default meta on any error (network failure, 404, etc.)
    return defaultMeta;
  }
}
