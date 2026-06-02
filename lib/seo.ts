import { Metadata } from 'next';
import { seoService } from '@/services/seo.service';

/**
 * Standardize path to match the backend's expected lookup key:
 * 1. Strip query parameters and fragment anchors
 * 2. Collapse duplicate slashes
 * 3. Convert to lowercase
 * 4. Strip trailing slash unless it's the root '/'
 */
export function normalizePath(rawPath: string): string {
  if (!rawPath) return '/';
  
  // Strip query parameters and fragment anchors
  let cleanPath = rawPath.split('?')[0].split('#')[0].trim();
  
  // Collapse duplicate slashes
  cleanPath = '/' + cleanPath.split('/').filter(Boolean).join('/');
  
  // Convert to lowercase
  cleanPath = cleanPath.toLowerCase();
  
  return cleanPath;
}

export async function getPageMetadata(path: string, defaultMeta: Metadata): Promise<Metadata> {
  const normalizedPath = normalizePath(path);
  const siteUrl = 'https://www.b2linq.in'; // Production URL baseline

  const defaultMetaBase = {
    metadataBase: new URL(siteUrl),
    title: defaultMeta.title,
    description: defaultMeta.description,
    keywords: defaultMeta.keywords,
    alternates: {
      canonical: `${siteUrl}${normalizedPath === '/' ? '' : normalizedPath}`,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: defaultMeta.title as string,
      description: defaultMeta.description as string,
      url: `${siteUrl}${normalizedPath === '/' ? '' : normalizedPath}`,
      siteName: 'B2linq Platform',
      locale: 'en_US',
      type: 'website',
      ...defaultMeta.openGraph,
    },
    twitter: {
      card: 'summary_large_image',
      title: defaultMeta.title as string,
      description: defaultMeta.description as string,
      ...defaultMeta.twitter,
    }
  };

  try {
    const data = await seoService.getPageSEO(normalizedPath);
    if (!data || !data.seo) return defaultMetaBase;

    const seo = data.seo;
    const isIndex = !seo.is_noindex;
    const isFollow = !seo.is_nofollow;

    return {
      metadataBase: new URL(siteUrl),
      title: seo.meta_title || defaultMeta.title,
      description: seo.meta_description || defaultMeta.description,
      keywords: seo.meta_keywords ? seo.meta_keywords.split(',').map((k) => k.trim()) : defaultMeta.keywords,
      alternates: {
        canonical: `${siteUrl}${normalizedPath === '/' ? '' : normalizedPath}`,
      },
      robots: {
        index: isIndex,
        follow: isFollow,
      },
      openGraph: {
        title: seo.og_title || seo.meta_title || (defaultMeta.openGraph?.title as string),
        description: seo.og_description || seo.meta_description || (defaultMeta.openGraph?.description as string),
        images: seo.og_image ? [{ url: seo.og_image }] : defaultMeta.openGraph?.images,
        url: `${siteUrl}${normalizedPath === '/' ? '' : normalizedPath}`,
        type: (seo.og_type || (defaultMeta.openGraph as any)?.type || 'website') as any,
      },
      twitter: {
        card: 'summary_large_image',
        title: seo.og_title || seo.meta_title || (defaultMeta.openGraph?.title as string),
        description: seo.og_description || seo.meta_description || (defaultMeta.openGraph?.description as string),
        images: seo.og_image ? [seo.og_image] : undefined,
      }
    };
  } catch (error) {
    // Return standard meta config on fetch failure
    return defaultMetaBase;
  }
}

