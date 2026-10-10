"""
Transactional email for OQIRA — order confirmations, status follow-ups,
payment updates, welcome mail and admin alerts.

Delivery: Gmail SMTP (STARTTLS on 587, implicit SSL on 465) with an App
Password from settings. Sending is synchronous on purpose: routes schedule it
with FastAPI's BackgroundTasks, which runs after the response is sent (and,
unlike a bare asyncio task, also works from sync endpoints and survives on
serverless). When SMTP isn't configured, emails are logged and skipped.

Templates are table-based with inline styles — the only layout that renders
the same in Gmail, Outlook and Apple Mail — and every email carries a
plain-text alternative. All customer-supplied text is HTML-escaped.
"""
from __future__ import annotations

import html
import logging
import smtplib
import ssl
from dataclasses import dataclass
from datetime import datetime, timezone
from decimal import Decimal
from email.message import EmailMessage
from email.utils import formataddr, formatdate, make_msgid
from typing import Iterable, Optional
from urllib.parse import quote

from app.constants import OrderStatus, PaymentMethod, PaymentStatus
from app.core.config import settings

logger = logging.getLogger("oqira.email")

# ---------------------------------------------------------------------------
# Brand tokens (mirror frontend/tailwind.config.js)
# ---------------------------------------------------------------------------
NAVY = "#0d0a0a"
NAVY_2 = "#1a1212"
GOLD = "#C9A84C"
GOLD_LIGHT = "#E8C96D"
GOLD_DARK = "#a07830"
CREAM = "#fdf8f5"
CREAM_2 = "#f5ede8"
INK = "#2a2020"
MUTED = "#8a7878"
BORDER = "#ece2dc"
SUCCESS = "#047857"
SUCCESS_BG = "#ecfdf5"
WARN = "#92400e"
WARN_BG = "#fffbeb"
DANGER = "#be123c"
DANGER_BG = "#fff1f2"

SERIF = "Georgia,'Times New Roman',Times,serif"
SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif"

LOW_STOCK_THRESHOLD = 5


# ---------------------------------------------------------------------------
# Email-safe snapshots of domain objects
# ---------------------------------------------------------------------------
# Background tasks run after the request's DB session is closed, so routes
# hand over plain snapshots instead of ORM instances.

@dataclass(frozen=True)
class EmailLine:
    name: str
    quantity: int
    unit_price: Decimal

    @property
    def total(self) -> Decimal:
        return self.unit_price * self.quantity


@dataclass(frozen=True)
class OrderEmail:
    id: int
    customer_name: str
    customer_email: Optional[str]
    customer_phone: str
    customer_address: str
    note: str
    status: OrderStatus
    payment_method: PaymentMethod
    payment_status: PaymentStatus
    items: tuple[EmailLine, ...]
    created_at: datetime
    has_account: bool = False
    transaction_ref: Optional[str] = None
    receipt_image_url: Optional[str] = None
    rejection_reason: Optional[str] = None

    @classmethod
    def from_order(cls, order) -> "OrderEmail":
        return cls(
            id=order.id,
            customer_name=order.customer_name or "",
            customer_email=order.customer_email,
            customer_phone=order.customer_phone or "",
            customer_address=order.customer_address or "",
            note=order.note or "",
            status=order.status,
            payment_method=order.payment_method,
            payment_status=order.payment_status,
            items=tuple(
                EmailLine(i.product_name_snapshot, i.quantity, Decimal(str(i.unit_price))) for i in order.items
            ),
            created_at=order.created_at or datetime.now(timezone.utc),
            has_account=order.created_by_id is not None,
            transaction_ref=order.transaction_ref,
            receipt_image_url=order.receipt_image_url,
            rejection_reason=order.rejection_reason,
        )

    @property
    def total(self) -> Decimal:
        return sum((line.total for line in self.items), Decimal("0"))

    @property
    def item_count(self) -> int:
        return sum(line.quantity for line in self.items)

    @property
    def first_name(self) -> str:
        return (self.customer_name.split() or ["there"])[0]

    @property
    def number(self) -> str:
        return f"#{self.id}"

    @property
    def is_bank(self) -> bool:
        return self.payment_method == PaymentMethod.BANK_TRANSFER


# ---------------------------------------------------------------------------
# Small helpers
# ---------------------------------------------------------------------------

def _e(value: object) -> str:
    """HTML-escape anything that came from a customer or the database."""
    return html.escape(str(value), quote=True)


def money(amount: Decimal | float | int) -> str:
    """'Rs. 4,998' — same format as the storefront."""
    return f"Rs. {Decimal(str(amount)).quantize(Decimal('1')):,}"


def _site(path: str = "") -> str:
    return f"{settings.SITE_URL.rstrip('/')}{path}"


def _from_email() -> str:
    return settings.FROM_EMAIL or settings.SMTP_USERNAME


def _admin_email() -> str:
    return settings.ADMIN_EMAIL or _from_email()


def _whatsapp(text: str = "") -> str:
    url = f"https://wa.me/{settings.STORE_WHATSAPP_NUMBER_1}"
    return f"{url}?text={quote(text)}" if text else url


def _date(value: datetime) -> str:
    return value.strftime("%d %b %Y")


# ---------------------------------------------------------------------------
# Layout
# ---------------------------------------------------------------------------

_HEAD_CSS = """
  body { margin:0; padding:0; width:100% !important; -webkit-text-size-adjust:100%; }
  table { border-collapse:collapse; }
  img { border:0; line-height:100%; outline:none; text-decoration:none; }
  a { color:#7a4f4f; }
  @media only screen and (max-width:620px) {
    .container { width:100% !important; }
    .px { padding-left:22px !important; padding-right:22px !important; }
    .stack { display:block !important; width:100% !important; }
    .stack-gap { padding-top:16px !important; }
    .h1 { font-size:26px !important; line-height:32px !important; }
    .hide-sm { display:none !important; }
  }
"""


def _layout(*, preheader: str, body: str, footer_note: str) -> str:
    year = datetime.now().year
    support = _e(_admin_email())
    return f"""<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>{settings.FROM_NAME}</title>
<style>{_HEAD_CSS}</style>
</head>
<body style="margin:0;padding:0;background-color:{CREAM_2};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:{CREAM_2};">{_e(preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="{CREAM_2}" style="background-color:{CREAM_2};">
<tr><td align="center" style="padding:32px 12px;">
  <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">

    <!-- Brand header -->
    <tr><td bgcolor="{NAVY}" align="center" style="background-color:{NAVY};border-radius:18px 18px 0 0;padding:30px 24px 26px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr>
        <td style="border-top:1px solid {GOLD};border-bottom:1px solid {GOLD};padding:6px 4px 5px;">
          <a href="{_site()}" style="text-decoration:none;font-family:{SERIF};font-size:30px;line-height:34px;letter-spacing:9px;color:{GOLD_LIGHT};font-weight:bold;">&nbsp;OQIRA</a>
        </td>
      </tr></table>
      <div style="font-family:{SANS};font-size:10px;line-height:16px;letter-spacing:3px;text-transform:uppercase;color:#a89494;padding-top:12px;">Skin Care &middot; Jewellery &middot; Apparel</div>
    </td></tr>
    <tr><td bgcolor="{GOLD}" style="background-color:{GOLD};height:3px;line-height:3px;font-size:0;">&nbsp;</td></tr>

    <!-- Body -->
    <tr><td bgcolor="#ffffff" class="px" style="background-color:#ffffff;padding:40px 44px 36px;font-family:{SANS};color:{INK};">
      {body}
    </td></tr>

    <!-- Promise strip -->
    <tr><td bgcolor="{CREAM}" class="px" style="background-color:{CREAM};border-top:1px solid {BORDER};padding:18px 44px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td class="stack" align="center" style="font-family:{SANS};font-size:12px;line-height:18px;color:{MUTED};padding:4px 0;"><b style="color:{INK};">Cash on delivery</b><br>across Pakistan</td>
        <td class="stack" align="center" style="font-family:{SANS};font-size:12px;line-height:18px;color:{MUTED};padding:4px 0;"><b style="color:{INK};">Free delivery</b><br>in 3&ndash;5 working days</td>
        <td class="stack" align="center" style="font-family:{SANS};font-size:12px;line-height:18px;color:{MUTED};padding:4px 0;"><b style="color:{INK};">7-day exchange</b><br>on eligible items</td>
      </tr></table>
    </td></tr>

    <!-- Footer -->
    <tr><td bgcolor="{NAVY}" align="center" class="px" style="background-color:{NAVY};border-radius:0 0 18px 18px;padding:28px 44px 30px;font-family:{SANS};">
      <p style="margin:0 0 14px;font-size:12px;line-height:18px;">
        <a href="{_site('/products')}" style="color:{GOLD_LIGHT};text-decoration:none;font-weight:600;">Shop</a>
        <span style="color:#5a4a4a;">&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="{_site('/products?deals=1')}" style="color:{GOLD_LIGHT};text-decoration:none;font-weight:600;">Deals</a>
        <span style="color:#5a4a4a;">&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="{_site('/account')}" style="color:{GOLD_LIGHT};text-decoration:none;font-weight:600;">My account</a>
        <span style="color:#5a4a4a;">&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="{_whatsapp()}" style="color:{GOLD_LIGHT};text-decoration:none;font-weight:600;">WhatsApp</a>
      </p>
      <p style="margin:0;font-size:12px;line-height:19px;color:#a89494;">
        Questions? Reply to this email, write to <a href="mailto:{support}" style="color:#d9c9c9;">{support}</a><br>
        or call us on {_e(settings.SUPPORT_PHONE)}.
      </p>
      <p style="margin:16px 0 0;font-size:11px;line-height:17px;color:#6f5f5f;">{footer_note}<br>&copy; {year} {settings.FROM_NAME} &middot; Pakistan</p>
    </td></tr>

  </table>
</td></tr>
</table>
</body>
</html>"""


# ---------------------------------------------------------------------------
# Building blocks
# ---------------------------------------------------------------------------

_TONES = {
    "gold": (GOLD, NAVY),
    "success": (SUCCESS, "#ffffff"),
    "warn": ("#d97706", "#ffffff"),
    "danger": (DANGER, "#ffffff"),
    "navy": (NAVY, GOLD_LIGHT),
}


def _hero(*, symbol: str, tone: str, eyebrow: str, title: str, intro: str) -> str:
    bg, fg = _TONES[tone]
    return f"""
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr><td align="center">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
      <td width="56" height="56" align="center" valign="middle" bgcolor="{bg}" style="width:56px;height:56px;background-color:{bg};border-radius:28px;font-family:{SANS};font-size:24px;line-height:56px;color:{fg};font-weight:bold;">{symbol}</td>
    </tr></table>
  </td></tr>
  <tr><td align="center" style="padding-top:20px;font-family:{SANS};font-size:11px;line-height:16px;letter-spacing:3px;text-transform:uppercase;color:{GOLD_DARK};font-weight:bold;">{eyebrow}</td></tr>
  <tr><td align="center" class="h1" style="padding-top:8px;font-family:{SERIF};font-size:30px;line-height:38px;color:{NAVY};font-weight:normal;">{title}</td></tr>
  <tr><td align="center" style="padding:14px 6px 0;font-family:{SANS};font-size:15px;line-height:24px;color:#5a4a4a;">{intro}</td></tr>
</table>"""


def _button(label: str, url: str, *, variant: str = "dark") -> str:
    bg, fg = (NAVY, "#ffffff") if variant == "dark" else (GOLD, NAVY)
    return f"""
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
  <tr><td align="center" bgcolor="{bg}" style="background-color:{bg};border-radius:30px;">
    <a href="{_e(url)}" target="_blank" style="display:inline-block;padding:15px 34px;font-family:{SANS};font-size:14px;line-height:18px;font-weight:bold;letter-spacing:0.5px;color:{fg};text-decoration:none;border-radius:30px;">{label}</a>
  </td></tr>
</table>"""


def _buttons(*buttons: str) -> str:
    cells = "".join(f'<td class="stack" style="padding:6px;">{b}</td>' for b in buttons)
    return f"""
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:30px auto 0;"><tr>{cells}</tr></table>"""


def _section_title(text: str) -> str:
    return (
        f'<p style="margin:34px 0 12px;font-family:{SANS};font-size:11px;line-height:16px;letter-spacing:2.5px;'
        f'text-transform:uppercase;color:{MUTED};font-weight:bold;">{text}</p>'
    )


def _callout(html_text: str, *, tone: str = "info") -> str:
    palette = {
        "info": (CREAM, BORDER, INK),
        "success": (SUCCESS_BG, "#a7f3d0", SUCCESS),
        "warn": (WARN_BG, "#fde68a", WARN),
        "danger": (DANGER_BG, "#fecdd3", DANGER),
    }
    bg, border, fg = palette[tone]
    return f"""
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;">
  <tr><td bgcolor="{bg}" style="background-color:{bg};border:1px solid {border};border-radius:12px;padding:16px 20px;font-family:{SANS};font-size:14px;line-height:22px;color:{fg};">{html_text}</td></tr>
</table>"""


_TRACKER_STEPS = ("Placed", "Confirmed", "Shipped", "Delivered")
_TRACKER_INDEX = {
    OrderStatus.PENDING: 0,
    OrderStatus.CONFIRMED: 1,
    OrderStatus.SHIPPED: 2,
    OrderStatus.DELIVERED: 3,
}


def _tracker(status: OrderStatus) -> str:
    """Segmented progress bar: Placed → Confirmed → Shipped → Delivered."""
    if status == OrderStatus.CANCELLED:
        return ""
    current = _TRACKER_INDEX.get(status, 0)
    cells = []
    for i, label in enumerate(_TRACKER_STEPS):
        done = i <= current
        bar = GOLD if done else BORDER
        color = NAVY if done else "#b3a5a5"
        weight = "bold" if i == current else "normal"
        mark = "&#10003;&nbsp;" if i < current else ""
        cells.append(
            f'<td width="25%" style="padding:0 3px;">'
            f'<div style="height:5px;line-height:5px;font-size:0;background-color:{bar};border-radius:3px;">&nbsp;</div>'
            f'<div style="padding-top:9px;font-family:{SANS};font-size:12px;line-height:16px;color:{color};font-weight:{weight};text-align:center;">{mark}{label}</div>'
            f"</td>"
        )
    return f"""
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px;">
  <tr>{''.join(cells)}</tr>
</table>"""


def _order_summary(order: OrderEmail) -> str:
    rows = "".join(
        f"""
  <tr>
    <td style="padding:14px 0;border-bottom:1px solid {BORDER};font-family:{SANS};font-size:14px;line-height:20px;color:{INK};">
      <b>{_e(line.name)}</b><br><span style="font-size:12px;color:{MUTED};">Qty {line.quantity} &times; {money(line.unit_price)}</span>
    </td>
    <td align="right" valign="top" style="padding:14px 0 14px 12px;border-bottom:1px solid {BORDER};font-family:{SANS};font-size:14px;line-height:20px;color:{NAVY};font-weight:bold;white-space:nowrap;">{money(line.total)}</td>
  </tr>"""
        for line in order.items
    )
    return f"""
{_section_title(f"Order summary &middot; {order.number}")}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  {rows}
  <tr>
    <td style="padding:14px 0 4px;font-family:{SANS};font-size:13px;color:{MUTED};">Subtotal ({order.item_count} item{'s' if order.item_count != 1 else ''})</td>
    <td align="right" style="padding:14px 0 4px;font-family:{SANS};font-size:13px;color:{INK};">{money(order.total)}</td>
  </tr>
  <tr>
    <td style="padding:4px 0 14px;font-family:{SANS};font-size:13px;color:{MUTED};">Delivery</td>
    <td align="right" style="padding:4px 0 14px;font-family:{SANS};font-size:13px;color:{SUCCESS};font-weight:bold;">Free</td>
  </tr>
  <tr>
    <td bgcolor="{NAVY}" style="background-color:{NAVY};border-radius:10px 0 0 10px;padding:14px 18px;font-family:{SANS};font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#bfb0b0;font-weight:bold;">Total</td>
    <td bgcolor="{NAVY}" align="right" style="background-color:{NAVY};border-radius:0 10px 10px 0;padding:14px 18px;font-family:{SERIF};font-size:22px;color:{GOLD_LIGHT};white-space:nowrap;">{money(order.total)}</td>
  </tr>
</table>"""


_PAYMENT_STATUS_TEXT = {
    PaymentStatus.UNPAID: "Awaiting payment",
    PaymentStatus.PENDING_VERIFICATION: "Verifying transfer",
    PaymentStatus.PAID: "Paid",
}


def _details(order: OrderEmail) -> str:
    if order.is_bank:
        payment = f"Bank transfer<br><span style=\"color:{MUTED};\">{_PAYMENT_STATUS_TEXT[order.payment_status]}</span>"
    else:
        cod_note = {
            OrderStatus.DELIVERED: "Paid on delivery",
            OrderStatus.CANCELLED: "Nothing to pay",
        }.get(order.status, f"Pay {money(order.total)} on arrival")
        payment = f"Cash on delivery<br><span style=\"color:{MUTED};\">{cod_note}</span>"
    contact = _e(order.customer_phone or "—")
    if order.customer_email:
        contact += f"<br>{_e(order.customer_email)}"
    cell = f"font-family:{SANS};font-size:14px;line-height:22px;color:{INK};"
    label = (
        f"font-family:{SANS};font-size:11px;line-height:16px;letter-spacing:2px;text-transform:uppercase;"
        f"color:{MUTED};font-weight:bold;padding-bottom:6px"
    )
    return f"""
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:30px;">
  <tr>
    <td class="stack" width="50%" valign="top" style="padding-right:12px;">
      <div style="{label}">Delivering to</div>
      <div style="{cell}"><b>{_e(order.customer_name)}</b><br>{_e(order.customer_address or '—')}<br>{contact}</div>
    </td>
    <td class="stack stack-gap" width="50%" valign="top" style="padding-left:12px;">
      <div style="{label}">Payment</div>
      <div style="{cell}">{payment}</div>
      <div style="{label};padding-top:14px;">Order date</div>
      <div style="{cell}">{_date(order.created_at)}</div>
    </td>
  </tr>
</table>"""


def _bank_accounts(order: OrderEmail) -> str:
    accounts = [
        (settings.BANK_NAME, settings.BANK_ACCOUNT_TITLE, settings.BANK_ACCOUNT_NUMBER, settings.BANK_IBAN),
        (settings.BANK2_NAME, settings.BANK2_ACCOUNT_TITLE, settings.BANK2_ACCOUNT_NUMBER, settings.BANK2_IBAN),
    ]
    blocks = []
    for name, title, number, iban in accounts:
        if not number:
            continue
        iban_row = (
            f'<tr><td style="padding-top:8px;font-family:{SANS};font-size:12px;color:#a89494;">IBAN</td></tr>'
            f'<tr><td style="font-family:Consolas,Menlo,monospace;font-size:14px;color:{GOLD_LIGHT};font-weight:bold;">{_e(iban)}</td></tr>'
            if iban
            else ""
        )
        blocks.append(
            f"""
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;">
  <tr><td bgcolor="{NAVY}" style="background-color:{NAVY};border-radius:12px;padding:18px 22px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="font-family:{SERIF};font-size:17px;color:#ffffff;padding-bottom:10px;">{_e(name)}</td></tr>
      <tr><td style="font-family:{SANS};font-size:12px;color:#a89494;">Account title</td></tr>
      <tr><td style="font-family:{SANS};font-size:14px;color:#ffffff;font-weight:bold;">{_e(title)}</td></tr>
      <tr><td style="padding-top:8px;font-family:{SANS};font-size:12px;color:#a89494;">Account number</td></tr>
      <tr><td style="font-family:Consolas,Menlo,monospace;font-size:15px;color:{GOLD_LIGHT};font-weight:bold;">{_e(number)}</td></tr>
      {iban_row}
    </table>
  </td></tr>
</table>"""
        )
    return f"""
{_section_title(f"Transfer {money(order.total)} to either account")}
{''.join(blocks)}
<p style="margin:14px 0 0;font-family:{SANS};font-size:13px;line-height:20px;color:{MUTED};">
  Use <b style="color:{INK};">{order.number}</b> as the payment reference, then confirm the transfer on the checkout page
  or send your receipt to us on WhatsApp.
</p>"""


def _rating_row(order: OrderEmail) -> str:
    stars = "".join(
        f'<td style="padding:0 3px;"><a href="{_e(_whatsapp(f"My rating for order {order.number}: {n}/5 stars. "))}" '
        f'style="display:inline-block;width:44px;height:44px;line-height:44px;border-radius:22px;background-color:{CREAM};'
        f'border:1px solid {BORDER};font-size:22px;color:{GOLD};text-decoration:none;text-align:center;">&#9733;</a>'
        f'<div style="font-family:{SANS};font-size:11px;color:{MUTED};text-align:center;padding-top:4px;">{n}</div></td>'
        for n in range(1, 6)
    )
    return f"""
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:30px;">
  <tr><td bgcolor="{CREAM}" align="center" style="background-color:{CREAM};border-radius:14px;padding:24px 16px;">
    <div style="font-family:{SERIF};font-size:20px;color:{NAVY};">How did we do?</div>
    <div style="font-family:{SANS};font-size:13px;line-height:20px;color:{MUTED};padding:6px 0 14px;">Tap a star to rate your order &mdash; it takes two seconds and helps us a lot.</div>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr>{stars}</tr></table>
  </td></tr>
</table>"""


def _help_block(order: OrderEmail) -> str:
    return f"""
<p style="margin:32px 0 0;padding-top:22px;border-top:1px solid {BORDER};font-family:{SANS};font-size:13px;line-height:21px;color:{MUTED};text-align:center;">
  Need help with order {order.number}? Simply reply to this email or
  <a href="{_e(_whatsapp(f'Hi OQIRA, I have a question about order {order.number}.'))}" style="color:#7a4f4f;font-weight:bold;">message us on WhatsApp</a>.
</p>"""


# ---------------------------------------------------------------------------
# Customer order emails
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class _Copy:
    subject: str
    preheader: str
    symbol: str
    tone: str
    eyebrow: str
    title: str
    intro: str
    text_intro: str


def _order_copy(order: OrderEmail, kind: str) -> _Copy:
    n, name, total = order.number, _e(order.first_name), money(order.total)
    copies = {
        "received": _Copy(
            subject=f"We've received your order {n}",
            preheader=f"Thank you, {order.first_name}! Your order {n} for {total} is in. We'll call to confirm delivery.",
            symbol="&#10003;", tone="gold", eyebrow="Order received",
            title=f"Thank you, {name}!",
            intro=f"Your order <b>{n}</b> is in. Our team will call you shortly to confirm it, and we'll email you again the moment it ships. Please keep <b>{total}</b> ready for the courier.",
            text_intro=f"Your order {n} is in. We'll call you shortly to confirm it and email you when it ships. Please keep {total} ready for the courier.",
        ),
        "awaiting_payment": _Copy(
            subject=f"Complete your payment for order {n}",
            preheader=f"Your order {n} is reserved. Transfer {total} to confirm it.",
            symbol="&#9203;", tone="warn", eyebrow="Payment pending",
            title="Your order is reserved",
            intro=f"Thanks, {name}! To confirm order <b>{n}</b>, please transfer <b>{total}</b> to one of the accounts below. We'll start packing as soon as the payment is verified.",
            text_intro=f"To confirm order {n}, please transfer {total} to one of our accounts below. We'll start packing as soon as the payment is verified.",
        ),
        "transfer_received": _Copy(
            subject=f"Payment received for order {n} — verifying now",
            preheader=f"We've got your transfer details for {n}. Verification usually takes a few hours.",
            symbol="&#8987;", tone="gold", eyebrow="Verifying payment",
            title="We've got your transfer details",
            intro=f"Thanks, {name}. We're matching your transfer of <b>{total}</b> with our bank statement. This usually takes a few hours during business hours &mdash; we'll email you as soon as it's confirmed.",
            text_intro=f"We're matching your transfer of {total} with our bank statement. This usually takes a few hours — we'll email you as soon as it's confirmed.",
        ),
        "payment_confirmed": _Copy(
            subject=f"Payment confirmed — order {n} is being prepared",
            preheader=f"Your payment of {total} is verified. Order {n} is now being packed.",
            symbol="&#10003;", tone="success", eyebrow="Payment confirmed",
            title="Payment verified, thank you!",
            intro=f"Great news, {name} &mdash; your payment of <b>{total}</b> for order <b>{n}</b> has been verified. We're packing your order now and will let you know when it ships.",
            text_intro=f"Your payment of {total} for order {n} has been verified. We're packing your order now and will let you know when it ships.",
        ),
        "payment_rejected": _Copy(
            subject=f"Action needed: we couldn't verify payment for order {n}",
            preheader=f"We couldn't match your transfer for {n}. Here's how to fix it.",
            symbol="!", tone="danger", eyebrow="Payment not verified",
            title="We couldn't verify your payment",
            intro=f"Sorry, {name} &mdash; we weren't able to match your transfer for order <b>{n}</b> with our bank statement. Your order is still reserved; please check the details below or send us your receipt on WhatsApp.",
            text_intro=f"We weren't able to match your transfer for order {n}. Your order is still reserved — please check the details below or send us your receipt on WhatsApp.",
        ),
        "confirmed": _Copy(
            subject=f"Your order {n} is confirmed",
            preheader=f"Order {n} is confirmed and being packed with care.",
            symbol="&#10003;", tone="success", eyebrow="Order confirmed",
            title="Your order is confirmed",
            intro=f"Good news, {name}! Order <b>{n}</b> is confirmed and is being packed with care. We'll email you again when it's handed to the courier.",
            text_intro=f"Order {n} is confirmed and being packed. We'll email you again when it's handed to the courier.",
        ),
        "shipped": _Copy(
            subject=f"Your order {n} is on its way",
            preheader=f"Order {n} has shipped and should arrive within 3–5 working days.",
            symbol="&#10148;", tone="navy", eyebrow="Shipped",
            title="Your order is on its way",
            intro=f"{name}, order <b>{n}</b> has left our studio and should reach you within <b>3&ndash;5 working days</b>. The courier will call before delivery"
            + (f" &mdash; please keep <b>{total}</b> ready." if not order.is_bank else "."),
            text_intro=f"Order {n} has shipped and should reach you within 3–5 working days. The courier will call before delivery"
            + (f" — please keep {total} ready." if not order.is_bank else "."),
        ),
        "delivered": _Copy(
            subject=f"Delivered: order {n} — how did we do?",
            preheader="Your OQIRA order has arrived. We'd love to hear what you think.",
            symbol="&#9733;", tone="gold", eyebrow="Delivered",
            title=f"Enjoy your order, {name}!",
            intro=f"Order <b>{n}</b> has been delivered. We hope you love it as much as we loved packing it. If anything isn't perfect, you can exchange eligible items within <b>7 days</b>.",
            text_intro=f"Order {n} has been delivered. We hope you love it! If anything isn't perfect, you can exchange eligible items within 7 days.",
        ),
        "cancelled": _Copy(
            subject=f"Your order {n} has been cancelled",
            preheader=f"Order {n} has been cancelled. Here are the details.",
            symbol="&#10005;", tone="danger", eyebrow="Order cancelled",
            title="Your order has been cancelled",
            intro=f"Hi {name}, order <b>{n}</b> has been cancelled. If you didn't request this or have already paid, please contact us and we'll sort it out right away.",
            text_intro=f"Order {n} has been cancelled. If you didn't request this or have already paid, please contact us and we'll sort it out right away.",
        ),
    }
    return copies[kind]


def _kind_for_status(order: OrderEmail) -> str:
    """The email that describes where an order currently stands."""
    if order.status == OrderStatus.CANCELLED:
        return "cancelled"
    if order.status == OrderStatus.DELIVERED:
        return "delivered"
    if order.status == OrderStatus.SHIPPED:
        return "shipped"
    if order.is_bank and order.payment_status == PaymentStatus.UNPAID:
        return "payment_rejected" if order.rejection_reason else "awaiting_payment"
    if order.is_bank and order.payment_status == PaymentStatus.PENDING_VERIFICATION:
        return "transfer_received"
    if order.status == OrderStatus.CONFIRMED:
        return "confirmed"
    return "received"


def render_order_email(order: OrderEmail, kind: str) -> tuple[str, str, str]:
    """Returns (subject, html, text) for a customer-facing order email."""
    copy = _order_copy(order, kind)

    blocks = [_hero(symbol=copy.symbol, tone=copy.tone, eyebrow=copy.eyebrow, title=copy.title, intro=copy.intro)]
    if kind != "cancelled":
        blocks.append(_tracker(order.status))

    if kind == "payment_rejected" and order.rejection_reason:
        blocks.append(_callout(f"<b>Reason:</b> {_e(order.rejection_reason)}", tone="danger"))
    if kind in ("awaiting_payment", "payment_rejected"):
        blocks.append(_bank_accounts(order))
    if kind == "delivered":
        blocks.append(_rating_row(order))

    cta_primary = (
        _button("View my order", _site("/account"))
        if order.has_account
        else _button("Continue shopping", _site("/products"))
    )
    if kind in ("awaiting_payment", "payment_rejected"):
        cta_secondary = _button(
            "Send receipt on WhatsApp",
            _whatsapp(f"Hi OQIRA, here is my payment receipt for order {order.number}."),
            variant="gold",
        )
        blocks.append(_buttons(cta_secondary, cta_primary))
    elif kind == "delivered":
        blocks.append(_buttons(_button("Shop new arrivals", _site("/products"), variant="gold")))
    else:
        blocks.append(_buttons(cta_primary))

    blocks.append(_order_summary(order))
    blocks.append(_details(order))
    if order.note:
        blocks.append(_callout(f"<b>Your note:</b> {_e(order.note)}"))
    blocks.append(_help_block(order))

    html_body = _layout(
        preheader=copy.preheader,
        body="".join(blocks),
        footer_note=f"You're receiving this because you placed order {order.number} at {settings.FROM_NAME}.",
    )
    return copy.subject, html_body, _order_text(order, copy, kind)


def _order_text(order: OrderEmail, copy: _Copy, kind: str) -> str:
    lines = [f"{settings.FROM_NAME}", "", f"Hi {order.first_name},", "", copy.text_intro, ""]
    if kind == "payment_rejected" and order.rejection_reason:
        lines += [f"Reason: {order.rejection_reason}", ""]
    if kind in ("awaiting_payment", "payment_rejected"):
        lines.append(f"Transfer {money(order.total)} to either account (reference: {order.number}):")
        for name, title, number, iban in (
            (settings.BANK_NAME, settings.BANK_ACCOUNT_TITLE, settings.BANK_ACCOUNT_NUMBER, settings.BANK_IBAN),
            (settings.BANK2_NAME, settings.BANK2_ACCOUNT_TITLE, settings.BANK2_ACCOUNT_NUMBER, settings.BANK2_IBAN),
        ):
            if number:
                lines.append(f"  {name} — {title} — {number}" + (f" — IBAN {iban}" if iban else ""))
        lines.append("")
    lines.append(f"ORDER {order.number} ({_date(order.created_at)})")
    for line in order.items:
        lines.append(f"  {line.quantity} x {line.name} — {money(line.total)}")
    lines += [
        "  Delivery — Free",
        f"  TOTAL — {money(order.total)}",
        "",
        f"Delivering to: {order.customer_name}, {order.customer_address}",
        f"Payment: {'Bank transfer' if order.is_bank else 'Cash on delivery'}",
        "",
    ]
    if kind == "delivered":
        lines += [f"Rate your order: {_whatsapp(f'My rating for order {order.number}: ')}", ""]
    lines += [
        f"Questions? Reply to this email or WhatsApp us: {_whatsapp()}",
        f"Shop: {_site('/products')}",
        "",
        f"— Team {settings.FROM_NAME}",
    ]
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Admin emails
# ---------------------------------------------------------------------------

def _admin_order_email(order: OrderEmail, *, transfer: bool) -> tuple[str, str, str]:
    method = "Bank transfer" if order.is_bank else "Cash on delivery"
    if transfer:
        subject = f"Verify payment · order {order.number} · {money(order.total)}"
        eyebrow, title, tone, symbol = "Action required", "Bank transfer to verify", "warn", "!"
        intro = (
            f"<b>{_e(order.customer_name)}</b> says they've transferred <b>{money(order.total)}</b> for order "
            f"<b>{order.number}</b>. Check your bank statement, then confirm or reject it in the admin panel."
        )
    else:
        subject = f"New order {order.number} · {money(order.total)} · {method}"
        eyebrow, title, tone, symbol = "New order", f"Order {order.number}", "gold", "&#10003;"
        intro = (
            f"<b>{_e(order.customer_name)}</b> just placed an order for <b>{money(order.total)}</b> "
            f"({order.item_count} item{'s' if order.item_count != 1 else ''}) &middot; {method}."
        )

    extra = ""
    if transfer:
        ref = _e(order.transaction_ref) if order.transaction_ref else "<i>not provided</i>"
        receipt = (
            f'<a href="{_e(order.receipt_image_url)}" style="color:#7a4f4f;font-weight:bold;">View receipt</a>'
            if order.receipt_image_url
            else "<i>not uploaded</i>"
        )
        extra = _callout(f"<b>Transaction ref:</b> {ref}<br><b>Receipt:</b> {receipt}", tone="warn")

    phone = order.customer_phone.lstrip("0")
    call_url = f"tel:{order.customer_phone}" if order.customer_phone else _site("/admin/orders")
    wa_url = f"https://wa.me/92{phone}" if phone else _whatsapp()
    body = (
        _hero(symbol=symbol, tone=tone, eyebrow=eyebrow, title=title, intro=intro)
        + extra
        + _buttons(
            _button("Open in admin", _site("/admin/orders")),
            _button("WhatsApp customer", wa_url, variant="gold"),
        )
        + _order_summary(order)
        + _details(order)
        + (_callout(f"<b>Customer note:</b> {_e(order.note)}") if order.note else "")
    )
    preheader = f"{order.customer_name} · {money(order.total)} · {method}"
    html_body = _layout(preheader=preheader, body=body,
                        footer_note="Store notification — sent to the OQIRA admin inbox.")
    lines = [
        subject, "",
        f"Customer: {order.customer_name}",
        f"Phone: {order.customer_phone} ({call_url})",
        f"Email: {order.customer_email or '—'}",
        f"Address: {order.customer_address}",
        f"Payment: {method} — {_PAYMENT_STATUS_TEXT[order.payment_status]}",
    ]
    if transfer:
        lines.append(f"Transaction ref: {order.transaction_ref or '—'}")
    lines.append("")
    lines += [f"{line.quantity} x {line.name} — {money(line.total)}" for line in order.items]
    lines += [f"TOTAL — {money(order.total)}", "", f"Admin: {_site('/admin/orders')}"]
    return subject, html_body, "\n".join(lines)


# ---------------------------------------------------------------------------
# Delivery
# ---------------------------------------------------------------------------

def _deliver(msg: EmailMessage) -> None:
    context = ssl.create_default_context()
    timeout = settings.SMTP_TIMEOUT_SECONDS
    if settings.SMTP_PORT == 465:
        with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=timeout, context=context) as smtp:
            smtp.login(settings.SMTP_USERNAME, settings.smtp_password_clean)
            smtp.send_message(msg)
    else:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=timeout) as smtp:
            smtp.ehlo()
            smtp.starttls(context=context)
            smtp.ehlo()
            smtp.login(settings.SMTP_USERNAME, settings.smtp_password_clean)
            smtp.send_message(msg)


def send_email(
    to: str | Iterable[str],
    subject: str,
    html_body: str,
    text_body: str,
    *,
    reply_to: Optional[str] = None,
    raise_on_error: bool = False,
) -> bool:
    """Sends one multipart (text + HTML) email. Returns True when handed to SMTP."""
    recipients = [to] if isinstance(to, str) else list(to)
    recipients = [r for r in recipients if r]
    if not recipients:
        return False
    if not settings.smtp_enabled:
        logger.info("SMTP not configured — skipped email %r to %s", subject, recipients)
        return False

    sender = _from_email()
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = formataddr((settings.FROM_NAME, sender))
    msg["To"] = ", ".join(recipients)
    msg["Reply-To"] = reply_to or _admin_email()
    msg["Date"] = formatdate(localtime=True)
    msg["Message-ID"] = make_msgid(domain=sender.split("@")[-1] or None)
    msg.set_content(text_body)
    msg.add_alternative(html_body, subtype="html")

    try:
        _deliver(msg)
    except Exception:
        logger.exception("Failed to send email %r to %s", subject, recipients)
        if raise_on_error:
            raise
        return False
    logger.info("Email sent to %s: %s", recipients, subject)
    return True


def _send_to_customer(order: OrderEmail, kind: str) -> None:
    if not order.customer_email:
        return
    subject, html_body, text = render_order_email(order, kind)
    send_email(order.customer_email, subject, html_body, text)


def _send_to_admin(subject: str, html_body: str, text: str, *, reply_to: Optional[str] = None) -> None:
    send_email(_admin_email(), subject, html_body, text, reply_to=reply_to)


# ---------------------------------------------------------------------------
# Public API — call these from routes via BackgroundTasks.add_task(...)
# ---------------------------------------------------------------------------

def notify_order_placed(order: OrderEmail) -> None:
    """Customer: order received / payment instructions. Admin: new-order alert."""
    _send_to_customer(order, "awaiting_payment" if order.is_bank else "received")
    _send_to_admin(*_admin_order_email(order, transfer=False), reply_to=order.customer_email)


def notify_transfer_submitted(order: OrderEmail) -> None:
    """Customer: we're verifying. Admin: please verify."""
    _send_to_customer(order, "transfer_received")
    _send_to_admin(*_admin_order_email(order, transfer=True), reply_to=order.customer_email)


def notify_payment_verified(order: OrderEmail) -> None:
    _send_to_customer(order, "payment_confirmed" if order.payment_status == PaymentStatus.PAID else "payment_rejected")


_STATUS_KINDS = {
    OrderStatus.CONFIRMED: "confirmed",
    OrderStatus.SHIPPED: "shipped",
    OrderStatus.DELIVERED: "delivered",
    OrderStatus.CANCELLED: "cancelled",
}


def notify_status_changed(order: OrderEmail) -> None:
    """Follow-up email when an admin moves the order along."""
    kind = _STATUS_KINDS.get(order.status)
    if kind:
        _send_to_customer(order, kind)


def send_order_follow_up(order: OrderEmail) -> bool:
    """Admin-triggered: (re)send the email matching the order's current state —
    e.g. a payment reminder for an unpaid bank transfer."""
    if not order.customer_email:
        return False
    subject, html_body, text = render_order_email(order, _kind_for_status(order))
    return send_email(order.customer_email, subject, html_body, text, raise_on_error=True)


def send_welcome_email(full_name: str, email: str) -> None:
    first = (full_name.split() or ["there"])[0]
    perks = "".join(
        f"""<tr>
      <td width="34" valign="top" style="padding:10px 0;"><div style="width:26px;height:26px;line-height:26px;border-radius:13px;background-color:{CREAM_2};color:{GOLD_DARK};font-family:{SANS};font-size:13px;text-align:center;font-weight:bold;">{icon}</div></td>
      <td style="padding:10px 0;font-family:{SANS};font-size:14px;line-height:21px;color:{INK};"><b>{title}</b><br><span style="color:{MUTED};">{desc}</span></td>
    </tr>"""
        for icon, title, desc in (
            ("&#10003;", "Track every order", "See status updates for all your orders in one place."),
            ("&#9829;", "Save your favourites", "Heart the pieces you love and come back to them anytime."),
            ("&#9889;", "Faster checkout", "Your details are filled in for you next time."),
            ("&#9733;", "First to know", "New arrivals and member-only deals land in your inbox first."),
        )
    )
    body = (
        _hero(
            symbol="&#9733;", tone="navy", eyebrow="Welcome to OQIRA",
            title=f"It's lovely to meet you, {_e(first)}",
            intro="Your account is ready. Premium skin care, jewellery, apparel and baby essentials &mdash; handpicked for quality and delivered to your door with cash on delivery.",
        )
        + f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:26px;">{perks}</table>'
        + _buttons(_button("Start shopping", _site("/products"), variant="gold"), _button("My account", _site("/account")))
    )
    html_body = _layout(
        preheader="Your OQIRA account is ready — track orders, save favourites and check out faster.",
        body=body,
        footer_note=f"You're receiving this because an account was created for {_e(email)}.",
    )
    text = "\n".join([
        f"Welcome to {settings.FROM_NAME}, {first}!", "",
        "Your account is ready. With it you can track every order, save favourites and check out faster.", "",
        f"Start shopping: {_site('/products')}",
        f"My account: {_site('/account')}", "",
        f"— Team {settings.FROM_NAME}",
    ])
    send_email(email, f"Welcome to {settings.FROM_NAME}, {first}", html_body, text)


def send_low_stock_alert(product_name: str, remaining_stock: int) -> None:
    sold_out = remaining_stock <= 0
    title = "Sold out" if sold_out else f"Only {remaining_stock} left"
    body = (
        _hero(
            symbol="!", tone="danger" if sold_out else "warn", eyebrow="Inventory alert", title=_e(product_name),
            intro=(
                f"This product is now <b>{title.lower()}</b>"
                + (" and hidden from shoppers' carts." if sold_out else f" (alert threshold: {LOW_STOCK_THRESHOLD}).")
                + " Restock it in the admin panel to keep orders coming."
            ),
        )
        + _buttons(_button("Update stock", _site("/admin/products")))
    )
    html_body = _layout(preheader=f"{product_name}: {title}", body=body,
                        footer_note="Store notification — sent to the OQIRA admin inbox.")
    text = f"Inventory alert: {product_name} — {title}.\nUpdate stock: {_site('/admin/products')}"
    _send_to_admin(f"Low stock: {product_name} ({title.lower()})", html_body, text)


def send_test_email(to: str) -> None:
    """Admin 'send test email' — raises on SMTP failure so the panel can show why."""
    body = (
        _hero(
            symbol="&#10003;", tone="success", eyebrow="Email is working",
            title="Your store email is set up",
            intro=(
                f"This test was sent from <b>{_e(_from_email())}</b> via {_e(settings.SMTP_HOST)}:{settings.SMTP_PORT}. "
                "Customers will now receive order confirmations and status follow-ups, and you'll get an alert for every new order."
            ),
        )
        + _callout(
            "<b>What gets sent automatically</b><br>"
            "&bull; Order received / payment instructions<br>"
            "&bull; Transfer received &rarr; payment confirmed or rejected<br>"
            "&bull; Confirmed, shipped, delivered (with rating request) and cancelled<br>"
            "&bull; Welcome email for new accounts<br>"
            "&bull; Admin alerts: new orders, transfers to verify, low stock"
        )
    )
    html_body = _layout(preheader="Your OQIRA store email is configured correctly.", body=body,
                        footer_note="Test message from the OQIRA admin panel.")
    send_email(to, f"{settings.FROM_NAME} email is working", html_body,
               "Your OQIRA store email is configured correctly.", raise_on_error=True)


def should_alert_low_stock(previous: int, current: int) -> bool:
    """Alert once when stock crosses the threshold, and again when it sells out."""
    return (previous > LOW_STOCK_THRESHOLD >= current) or (previous > 0 >= current)
