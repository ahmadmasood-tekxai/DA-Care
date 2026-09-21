import { Helmet } from 'react-helmet-async';

const BRAND = 'OQIRA';
const SITE_URL = 'https://oqira.vercel.app';
const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string;
  /** Absolute URL of this page, defaults to current href */
  url?: string;
  /** OG image override — full absolute URL */
  image?: string;
  /** JSON-LD structured data object (Product, BreadcrumbList, etc.) */
  schema?: object;
  /** noindex pages (admin, etc.) */
  noIndex?: boolean;
}

export function SEO({ title, description, keywords, url, image, schema, noIndex }: SEOProps) {
  const fullTitle = `${title} | ${BRAND}`;
  const pageUrl = url ?? (typeof window !== 'undefined' ? window.location.href : SITE_URL);
  const ogImage = image ?? OG_IMAGE;

  return (
    <Helmet>
      {/* Core */}
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'} />
      <link rel="canonical" href={pageUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:site_name" content={BRAND} />
      <meta property="og:locale" content="en_PK" />

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD structured data (optional per-page) */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}
