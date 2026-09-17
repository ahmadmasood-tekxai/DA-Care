import { describe, expect, it } from 'vitest';

import { ProductBadge } from '@/types';
import { buildWhatsAppOrderLink, formatCurrency, resolveImageUrl } from '@/utils/format';

const mockProduct = {
  id: 1,
  category_id: 1,
  name: 'The Little Prince Set',
  slug: 'the-little-prince-set',
  short_description: 'Navy waistcoat set',
  description: '',
  price: 2499,
  old_price: 2999,
  stock: 10,
  image_url: null,
  image_color: '#22304F',
  badge: ProductBadge.BESTSELLER,
  is_featured: true,
  is_active: true,
  created_at: '2026-09-01T00:00:00Z',
  updated_at: '2026-09-01T00:00:00Z',
  images: [],
};

describe('formatCurrency', () => {
  it('formats with Rs. prefix and no decimals', () => {
    expect(formatCurrency(2499)).toBe('Rs. 2,499');
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('Rs. 0');
  });
});

describe('resolveImageUrl', () => {
  it('returns null when no image is set', () => {
    expect(resolveImageUrl(null)).toBeNull();
    expect(resolveImageUrl(undefined)).toBeNull();
  });

  it('prefixes relative upload paths with the backend base URL', () => {
    expect(resolveImageUrl('/uploads/products/abc.jpg')).toContain('/uploads/products/abc.jpg');
  });

  it('leaves absolute URLs untouched', () => {
    expect(resolveImageUrl('https://cdn.example.com/x.jpg')).toBe('https://cdn.example.com/x.jpg');
  });
});

describe('buildWhatsAppOrderLink', () => {
  it('includes product name, quantity and total in the message', () => {
    const link = buildWhatsAppOrderLink('923194392573', [{ product: mockProduct, quantity: 2 }], 'Sara Ahmed');
    expect(link).toContain('wa.me/923194392573');
    const decoded = decodeURIComponent(link);
    expect(decoded).toContain('The Little Prince Set x2');
    expect(decoded).toContain('Sara Ahmed');
    expect(decoded).toContain('4,998'); // 2499 * 2
  });
});
