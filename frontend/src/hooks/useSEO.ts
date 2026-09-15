import { useEffect } from 'react';

const BRAND = 'OKIRA';

interface SEOOptions {
  title: string;
  description?: string;
  keywords?: string;
}

/**
 * Sets the document <title> and meta description/keywords per page.
 * Falls back to the brand name if no title is given.
 */
export function useSEO({ title, description, keywords }: SEOOptions) {
  useEffect(() => {
    // Title
    document.title = `${title} | ${BRAND}`;

    // Description
    if (description) {
      let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (!tag) {
        tag = document.createElement('meta');
        tag.name = 'description';
        document.head.appendChild(tag);
      }
      tag.content = description;
    }

    // Keywords
    if (keywords) {
      let tag = document.querySelector<HTMLMetaElement>('meta[name="keywords"]');
      if (!tag) {
        tag = document.createElement('meta');
        tag.name = 'keywords';
        document.head.appendChild(tag);
      }
      tag.content = keywords;
    }

    // OG Title
    let ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = `${title} | ${BRAND}`;

    // OG Description
    if (description) {
      let ogDesc = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
      if (ogDesc) ogDesc.content = description;
    }

    // Restore default title on unmount
    return () => {
      document.title = `${BRAND} — Premium Skin Care, Jewellery & Luxury Apparel in Pakistan`;
    };
  }, [title, description, keywords]);
}
