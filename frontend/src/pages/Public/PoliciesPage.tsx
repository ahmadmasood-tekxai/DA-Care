import { Mail, MessageCircle, Phone, RefreshCcw, Shield, ShieldCheck, Truck, Wallet } from 'lucide-react';

import { PageHeader } from '@/components/common/PageHeader';
import { SEO, breadcrumbSchema } from '@/components/common/SEO';
import { PublicLayout } from '@/components/layout/public/PublicLayout';
import { BANK_ACCOUNTS, ROUTES, STORE_NAME, SUPPORT_EMAIL, WHATSAPP_NUMBER_1, WHATSAPP_NUMBER_2 } from '@/constants';
import { buildWhatsAppLink } from '@/utils/format';

const formatPhone = (n: string) => `+${n.slice(0, 2)} ${n.slice(2, 5)} ${n.slice(5)}`;

const SECTION_HEADING = 'text-xl font-display font-semibold text-navy mt-10 mb-3 first:mt-0';
const BODY_TEXT = 'text-navy-soft leading-relaxed mb-4';
const LIST_ITEM = 'flex items-start gap-2.5 text-navy-soft mb-2';

export function PoliciesPage() {
  return (
    <PublicLayout>
      <SEO
        title={`Shipping, Returns & Policies — ${STORE_NAME}`}
        description={`Everything you need to know about shipping, returns, privacy and how to contact ${STORE_NAME}. Free delivery and cash on delivery across Pakistan.`}
        canonical={ROUTES.POLICIES}
        schema={breadcrumbSchema([['Home', '/'], ['Policies', ROUTES.POLICIES]])}
      />

      <PageHeader
        eyebrow="Store policies"
        title="Shipping, Returns & Contact"
        description={`Honest answers about how ${STORE_NAME} works — from when your order ships to how we handle returns.`}
        breadcrumbs={[{ label: 'Home', to: ROUTES.HOME }, { label: 'Policies' }]}
      />

      <div className="container-page py-12 sm:py-16">
        <div className="mx-auto max-w-3xl space-y-2">

          {/* ─── Shipping ─── */}
          <section aria-labelledby="shipping-heading">
            <h2 id="shipping-heading" className={SECTION_HEADING}>
              <span className="inline-flex items-center gap-2"><Truck className="h-5 w-5 text-pink-deep" /> Shipping & Delivery</span>
            </h2>
            <p className={BODY_TEXT}>
              We deliver across <strong>Pakistan</strong> — cities, towns and rural areas alike.
              All orders are dispatched within 1–2 business days after confirmation.
            </p>
            <ul className="mb-4 space-y-1">
              <li className={LIST_ITEM}><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-pink-deep" /><span><strong>Delivery time:</strong> 3–5 working days nationwide.</span></li>
              <li className={LIST_ITEM}><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-pink-deep" /><span><strong>Delivery cost:</strong> Free on all orders — no minimum order value required.</span></li>
              <li className={LIST_ITEM}><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-pink-deep" /><span><strong>Tracking:</strong> Once dispatched, we share courier tracking information via WhatsApp or phone.</span></li>
              <li className={LIST_ITEM}><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-pink-deep" /><span><strong>Packaging:</strong> All items are carefully packaged to arrive in pristine condition.</span></li>
            </ul>
            <p className={BODY_TEXT}>
              During peak seasons (Eid, school admissions, winter) delivery may take an extra 1–2 days.
              We will always let you know if there is any delay.
            </p>
          </section>

          <div className="my-8 border-t border-navy/10" />

          {/* ─── Payment ─── */}
          <section aria-labelledby="payment-heading">
            <h2 id="payment-heading" className={SECTION_HEADING}>
              <span className="inline-flex items-center gap-2"><Wallet className="h-5 w-5 text-pink-deep" /> Payment Methods</span>
            </h2>
            <p className={BODY_TEXT}>We offer two convenient, secure payment options:</p>
            <ul className="mb-4 space-y-1">
              <li className={LIST_ITEM}><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-pink-deep" /><span><strong>Cash on Delivery (COD):</strong> Pay in cash when your order arrives at your door — available across all of Pakistan.</span></li>
              <li className={LIST_ITEM}><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-pink-deep" /><span><strong>Bank Transfer:</strong> Transfer the order amount to our bank account and upload your receipt at checkout. We verify and confirm your order promptly.</span></li>
            </ul>
            <p className="text-sm text-navy-soft/70 mb-4">
              Bank account details are shown at checkout when you select the Bank Transfer option.
              {BANK_ACCOUNTS.mashreq.bank} ({BANK_ACCOUNTS.mashreq.account}) and {BANK_ACCOUNTS.meezan.bank} ({BANK_ACCOUNTS.meezan.account}) are both accepted.
            </p>
          </section>

          <div className="my-8 border-t border-navy/10" />

          {/* ─── Returns & Exchange ─── */}
          <section aria-labelledby="returns-heading">
            <h2 id="returns-heading" className={SECTION_HEADING}>
              <span className="inline-flex items-center gap-2"><RefreshCcw className="h-5 w-5 text-pink-deep" /> Return & Exchange Policy</span>
            </h2>
            <p className={BODY_TEXT}>
              We want you to be completely happy with your purchase. If something is not right, we are here to help.
            </p>
            <ul className="mb-4 space-y-1">
              <li className={LIST_ITEM}><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-pink-deep" /><span><strong>Exchange window:</strong> 7 days from the date of delivery for eligible items.</span></li>
              <li className={LIST_ITEM}><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-pink-deep" /><span><strong>Eligible items:</strong> Unworn / unused apparel, bags, jewellery and accessories in their original condition and packaging.</span></li>
              <li className={LIST_ITEM}><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-pink-deep" /><span><strong>Non-eligible items:</strong> Opened or used cosmetics and skincare products cannot be exchanged or returned for hygiene reasons.</span></li>
              <li className={LIST_ITEM}><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-pink-deep" /><span><strong>How to initiate:</strong> Contact us on WhatsApp within 7 days with a photo of the item and your order details.</span></li>
              <li className={LIST_ITEM}><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-pink-deep" /><span><strong>Defective items:</strong> If you receive a defective or incorrect item, we will exchange it at no cost to you.</span></li>
            </ul>
          </section>

          <div className="my-8 border-t border-navy/10" />

          {/* ─── Privacy ─── */}
          <section aria-labelledby="privacy-heading">
            <h2 id="privacy-heading" className={SECTION_HEADING}>
              <span className="inline-flex items-center gap-2"><Shield className="h-5 w-5 text-pink-deep" /> Privacy Policy</span>
            </h2>
            <p className={BODY_TEXT}>
              {STORE_NAME} respects your privacy. We collect only the information needed to process and deliver your orders.
            </p>
            <ul className="mb-4 space-y-1">
              <li className={LIST_ITEM}><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-pink-deep" /><span><strong>Data collected:</strong> Name, delivery address, phone number and email (when provided) for order processing.</span></li>
              <li className={LIST_ITEM}><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-pink-deep" /><span><strong>Data sharing:</strong> Your information is shared only with the courier partner needed to deliver your order. We do not sell or share your data with third-party marketers.</span></li>
              <li className={LIST_ITEM}><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-pink-deep" /><span><strong>Cookies:</strong> We use cookies to improve website performance and remember cart contents. No tracking cookies for advertising are placed without your consent.</span></li>
              <li className={LIST_ITEM}><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-pink-deep" /><span><strong>Your rights:</strong> You may request deletion of your account and personal data at any time by contacting us.</span></li>
            </ul>
          </section>

          <div className="my-8 border-t border-navy/10" />

          {/* ─── Contact ─── */}
          <section aria-labelledby="contact-heading">
            <h2 id="contact-heading" className={SECTION_HEADING}>
              <span className="inline-flex items-center gap-2"><MessageCircle className="h-5 w-5 text-pink-deep" /> Contact Us</span>
            </h2>
            <p className={BODY_TEXT}>
              Our team is available 7 days a week. The fastest way to reach us is on WhatsApp.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {[WHATSAPP_NUMBER_1, WHATSAPP_NUMBER_2].map((n) => (
                <a
                  key={n}
                  href={buildWhatsAppLink(n)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-2xl border border-navy/10 bg-white px-5 py-4 transition-colors hover:border-gold/40 hover:bg-cream"
                >
                  <Phone className="h-5 w-5 shrink-0 text-pink-deep" />
                  <div>
                    <p className="font-semibold text-navy">{formatPhone(n)}</p>
                    <p className="text-xs text-navy-soft/70">WhatsApp · Customer service</p>
                  </div>
                </a>
              ))}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="flex items-center gap-3 rounded-2xl border border-navy/10 bg-white px-5 py-4 transition-colors hover:border-gold/40 hover:bg-cream sm:col-span-2"
              >
                <Mail className="h-5 w-5 shrink-0 text-pink-deep" />
                <div>
                  <p className="font-semibold text-navy">{SUPPORT_EMAIL}</p>
                  <p className="text-xs text-navy-soft/70">Email — we respond within 24 hours</p>
                </div>
              </a>
            </div>
          </section>

        </div>
      </div>
    </PublicLayout>
  );
}
