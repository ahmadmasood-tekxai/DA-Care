import { CURRENCY_SYMBOL, STORE_NAME, UPLOADS_BASE_URL } from '@/constants';
import type { CartItem, Product } from '@/types';

/** Formats a number as "Rs. 2,499" style currency for display. */
export function formatCurrency(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (Number.isNaN(num)) return `${CURRENCY_SYMBOL} 0`;
  return `${CURRENCY_SYMBOL} ${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

/** Resolves a product's relative image_url (e.g. "/uploads/products/abc.jpg")
 * into an absolute URL pointing at the backend. Returns null if no image is set,
 * so callers can fall back to the color-accent placeholder. */
export function resolveImageUrl(imageUrl?: string | null): string | null {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${UPLOADS_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
}

/** Asks Cloudinary for a resized, auto-format (WebP/AVIF), auto-quality variant.
 * Non-Cloudinary URLs are returned unchanged. */
export function optimizeImageUrl(url: string | null, width?: number): string | null {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  const transforms = ['f_auto', 'q_auto', ...(width ? [`w_${width}`, 'c_limit'] : [])].join(',');
  return url.replace('/upload/', `/upload/${transforms}/`);
}

/** Builds a srcset for Cloudinary images; undefined for other hosts. */
export function buildSrcSet(url: string | null, widths: number[]): string | undefined {
  if (!url || !url.includes('res.cloudinary.com')) return undefined;
  return widths.map((w) => `${optimizeImageUrl(url, w)} ${w}w`).join(', ');
}

/** All distinct image URLs for a product, primary image first. */
export function getProductImages(product: Pick<Product, 'image_url' | 'images'>): string[] {
  const urls = [product.image_url, ...(product.images?.map((i) => i.url) ?? [])].filter(Boolean) as string[];
  return Array.from(new Set(urls));
}

/** Whole-number discount percentage, or 0 when the product isn't on sale. */
export function getDiscountPercent(product: Pick<Product, 'price' | 'old_price'>): number {
  const { price, old_price } = product;
  if (!old_price || old_price <= price) return 0;
  return Math.round(((old_price - price) / old_price) * 100);
}

/** Formats a full ISO datetime string for display. */
export function formatDateTime(isoDateTime: string): string {
  try {
    return new Date(isoDateTime).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return isoDateTime;
  }
}

export function formatDate(isoDateTime: string): string {
  try {
    return new Date(isoDateTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return isoDateTime;
  }
}

/** Builds a pre-filled WhatsApp deep link summarizing the cart contents,
 * so the customer can send their order straight from checkout. */
export function buildWhatsAppOrderLink(phoneNumber: string, items: CartItem[], customerName?: string): string {
  const lines = [
    `Hi! I'd like to order from ${STORE_NAME}`,
    customerName ? `Name: ${customerName}` : '',
    '',
    ...items.map((i) => `• ${i.product.name} x${i.quantity} — ${formatCurrency(i.product.price * i.quantity)}`),
    '',
    `Total: ${formatCurrency(items.reduce((sum, i) => sum + i.product.price * i.quantity, 0))}`,
  ].filter(Boolean);

  const message = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${phoneNumber}?text=${message}`;
}

/** WhatsApp link with a free-text message. */
export function buildWhatsAppLink(phoneNumber: string, message?: string): string {
  return message ? `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}` : `https://wa.me/${phoneNumber}`;
}

/** A `?next=` redirect target — only same-site relative paths are honoured. */
export function safeNext(value: string | null, fallback: string): string {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : fallback;
}

/** "Sara Ahmed" → "SA" for avatar fallbacks. */
export function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || '?'
  );
}
