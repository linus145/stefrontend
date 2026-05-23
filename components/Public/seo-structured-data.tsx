'use client';

interface SEOStructuredDataProps {
  data: Record<string, any> | Record<string, any>[];
}

export function SEOStructuredData({ data }: SEOStructuredDataProps) {
  if (!data) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}
