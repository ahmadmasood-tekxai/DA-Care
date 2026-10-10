import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

import { SITE_URL, STORE_DESCRIPTION, STORE_NAME } from '@/constants';

const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

interface SEOProps {
  /** Page title without the brand — the brand suffix is added once, here. */
  title: string;
  description?: string;
  keywords?: string;
  /** Path (e.g. "/products/x") or absolute URL. Defaults to the current path, without query/hash. */
  canonical?: string;
  /** Absolute OG image URL. */
  image?: string;
  type?: 'website' | 'product' | 'article';
  /** One or more JSON-LD objects. */
  schema?: object | object[];
  noIndex?: boolean;
}

function toAbsolute(pathOrUrl: string): string {
  return pathOrUrl.startsWith('http') ? pathOrUrl : `${SITE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

export function SEO({ title, description = STORE_DESCRIPTION, keywords, canonical, image, type = 'website', schema, noIndex }: SEOProps) {
  const { pathname } = useLocation();
  const fullTitle = title.includes(STORE_NAME) ? title : `${title} | ${STORE_NAME}`;
  const url = toAbsolute(canonical ?? pathname);
  const ogImage = image ? toAbsolute(image) : DEFAULT_OG_IMAGE;
  const schemas = schema ? (Array.isArray(schema) ? schema : [schema]) : [];

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'} />
      {!noIndex && <link rel="canonical" href={url} />}

      <meta property="og:site_name" content={STORE_NAME} />
      <meta property="og:locale" content="en_PK" />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={fullTitle} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  );
}

/** BreadcrumbList JSON-LD from [name, path] pairs. */
// eslint-disable-next-line react-refresh/only-export-components
export function breadcrumbSchema(items: Array<[name: string, path: string]>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: toAbsolute(path),
    })),
  };
}
