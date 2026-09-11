import { CURRENCY_SYMBOL, UPLOADS_BASE_URL } from '@/constants';
import type { CartItem } from '@/types';

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
  return `${UPLOADS_BASE_URL}${imageUrl}`;
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
    `Hi! I'd like to order from Da Baby Care 👶`,
    customerName ? `Name: ${customerName}` : '',
    '',
    ...items.map((i) => `• ${i.product.name} x${i.quantity} — ${formatCurrency(i.product.price * i.quantity)}`),
    '',
    `Total: ${formatCurrency(items.reduce((sum, i) => sum + i.product.price * i.quantity, 0))}`,
  ].filter(Boolean);

  const message = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${phoneNumber}?text=${message}`;
}
