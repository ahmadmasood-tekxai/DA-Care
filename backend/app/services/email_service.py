"""
Email notification service for OKIRA store.
Uses aiosmtplib with Gmail SMTP (TLS on port 587).
All templates are inline HTML — no external template files needed.
"""
import asyncio
import logging
import os
from decimal import Decimal
from typing import Optional

import aiosmtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

logger = logging.getLogger("okira.email")

# ---------------------------------------------------------------------------
# SMTP Configuration (from environment / .env)
# ---------------------------------------------------------------------------
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "Ahmad")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "feda qvam kqed xkrc")
FROM_EMAIL = os.getenv("FROM_EMAIL", "ahmadmasood171717@gmail.com")
FROM_NAME = os.getenv("FROM_NAME", "OKIRA")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "ahmadmasood171717@gmail.com")


def _base_template(title: str, body_html: str) -> str:
    """Wraps content in a premium branded HTML email shell."""
    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>{title}</title>
</head>
<body style="margin:0;padding:0;background:#f5f0ed;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0ed;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 30px rgba(0,0,0,0.08);">

          <!-- HEADER BANNER -->
          <tr>
            <td style="background:linear-gradient(135deg,#000000 0%,#2a1f1f 50%,#5C4E4E 100%);padding:40px 40px 30px;text-align:center;">
              <div style="display:inline-block;background:rgba(209,208,208,0.15);border:1px solid rgba(209,208,208,0.3);border-radius:50px;padding:6px 20px;margin-bottom:20px;">
                <span style="color:#D1D0D0;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">Premium Store</span>
              </div>
              <h1 style="margin:0;color:#ffffff;font-size:38px;font-weight:300;letter-spacing:4px;text-transform:uppercase;">OKIRA</h1>
              <p style="margin:8px 0 0;color:#988686;font-size:13px;letter-spacing:2px;text-transform:uppercase;">Skin Care · Jewellery · Apparel</p>
              <div style="width:60px;height:2px;background:linear-gradient(90deg,transparent,#D1D0D0,transparent);margin:20px auto 0;"></div>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:40px;">
              {body_html}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#000000;padding:30px 40px;text-align:center;">
              <p style="margin:0;color:#988686;font-size:12px;letter-spacing:1px;">
                © 2024 OKIRA · Premium Lifestyle Store
              </p>
              <p style="margin:8px 0 0;color:#5C4E4E;font-size:11px;">
                Questions? Email us at <a href="mailto:{ADMIN_EMAIL}" style="color:#D1D0D0;text-decoration:none;">{ADMIN_EMAIL}</a>
              </p>
              <div style="margin-top:16px;display:flex;justify-content:center;gap:12px;">
                <div style="width:6px;height:6px;background:#5C4E4E;border-radius:50%;display:inline-block;margin:0 4px;"></div>
                <div style="width:6px;height:6px;background:#988686;border-radius:50%;display:inline-block;margin:0 4px;"></div>
                <div style="width:6px;height:6px;background:#D1D0D0;border-radius:50%;display:inline-block;margin:0 4px;"></div>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


def _items_table_html(items: list) -> str:
    rows = ""
    for item in items:
        rows += f"""
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #f0ebe8;color:#333;font-size:14px;">{item['name']}</td>
          <td style="padding:12px 0;border-bottom:1px solid #f0ebe8;color:#666;font-size:14px;text-align:center;">x{item['qty']}</td>
          <td style="padding:12px 0;border-bottom:1px solid #f0ebe8;color:#000;font-size:14px;text-align:right;font-weight:600;">Rs. {item['price']}</td>
        </tr>"""
    return f"""
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
      <tr>
        <th style="padding:8px 0;border-bottom:2px solid #000;color:#000;font-size:11px;text-align:left;letter-spacing:2px;text-transform:uppercase;">Product</th>
        <th style="padding:8px 0;border-bottom:2px solid #000;color:#000;font-size:11px;text-align:center;letter-spacing:2px;text-transform:uppercase;">Qty</th>
        <th style="padding:8px 0;border-bottom:2px solid #000;color:#000;font-size:11px;text-align:right;letter-spacing:2px;text-transform:uppercase;">Total</th>
      </tr>
      {rows}
    </table>"""


def _info_row(label: str, value: str, highlight: bool = False) -> str:
    val_style = "color:#000;font-weight:700;font-size:15px;" if highlight else "color:#333;font-size:14px;"
    return f"""
    <tr>
      <td style="padding:8px 0;color:#988686;font-size:12px;letter-spacing:1px;text-transform:uppercase;width:40%;">{label}</td>
      <td style="padding:8px 0;{val_style}">{value}</td>
    </tr>"""


async def _send(to_email: str, subject: str, html: str) -> None:
    """Send a single HTML email via SMTP TLS."""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{FROM_NAME} <{FROM_EMAIL}>"
    msg["To"] = to_email
    msg.attach(MIMEText(html, "html"))

    try:
        await aiosmtplib.send(
            msg,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            username=SMTP_USERNAME,
            password=SMTP_PASSWORD,
            start_tls=True,
        )
        logger.info(f"Email sent to {to_email}: {subject}")
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")


async def send_cod_order_email(
    order_id: int,
    customer_name: str,
    customer_phone: str,
    customer_address: str,
    items: list,
    total: Decimal,
) -> None:
    """Notify admin of a new Cash-on-Delivery order."""
    items_html = _items_table_html(items)
    body = f"""
    <div style="margin-bottom:24px;">
      <div style="background:linear-gradient(135deg,#000,#2a1f1f);border-radius:12px;padding:20px 24px;margin-bottom:24px;">
        <p style="margin:0;color:#D1D0D0;font-size:11px;letter-spacing:2px;text-transform:uppercase;">New Order Received</p>
        <h2 style="margin:8px 0 0;color:#ffffff;font-size:28px;font-weight:300;">Order #{order_id}</h2>
        <span style="display:inline-block;margin-top:10px;background:#5C4E4E;color:#D1D0D0;padding:4px 14px;border-radius:20px;font-size:12px;letter-spacing:1px;">💵 Cash on Delivery</span>
      </div>

      <h3 style="color:#000;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;">Customer Details</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f7;border-radius:10px;padding:16px;">
        {_info_row("Name", customer_name)}
        {_info_row("Phone", customer_phone)}
        {_info_row("Address", customer_address or "—")}
      </table>
    </div>

    <h3 style="color:#000;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin:24px 0 12px;">Order Items</h3>
    {items_html}

    <div style="background:#000;border-radius:10px;padding:16px 20px;margin-top:24px;text-align:right;">
      <span style="color:#988686;font-size:12px;letter-spacing:1px;text-transform:uppercase;">Total Amount</span>
      <div style="color:#ffffff;font-size:28px;font-weight:700;margin-top:4px;">Rs. {total}</div>
    </div>

    <p style="margin-top:24px;color:#666;font-size:13px;line-height:1.6;">
      Please confirm this order and arrange delivery to the customer as soon as possible.
    </p>
    """

    subject = f"🛍️ New COD Order #{order_id} — OKIRA"
    await _send(ADMIN_EMAIL, subject, _base_template(subject, body))


async def send_bank_transfer_pending_email(
    order_id: int,
    customer_name: str,
    customer_phone: str,
    customer_address: str,
    items: list,
    total: Decimal,
    transaction_ref: Optional[str],
    receipt_image_url: Optional[str],
) -> None:
    """Notify admin that a customer has made a bank transfer and it needs verification."""
    items_html = _items_table_html(items)
    ref_html = f"<strong style='color:#000;'>{transaction_ref}</strong>" if transaction_ref else "<em style='color:#999;'>Not provided</em>"
    receipt_html = (
        f"<a href='{receipt_image_url}' style='color:#5C4E4E;font-weight:600;'>View Receipt →</a>"
        if receipt_image_url
        else "<em style='color:#999;'>Not uploaded</em>"
    )
    body = f"""
    <div style="margin-bottom:24px;">
      <div style="background:linear-gradient(135deg,#5C4E4E,#988686);border-radius:12px;padding:20px 24px;margin-bottom:24px;">
        <p style="margin:0;color:#f0ebe8;font-size:11px;letter-spacing:2px;text-transform:uppercase;">⏳ Payment Verification Required</p>
        <h2 style="margin:8px 0 0;color:#ffffff;font-size:28px;font-weight:300;">Order #{order_id}</h2>
        <span style="display:inline-block;margin-top:10px;background:rgba(0,0,0,0.3);color:#D1D0D0;padding:4px 14px;border-radius:20px;font-size:12px;letter-spacing:1px;">🏦 Bank Transfer</span>
      </div>

      <div style="background:#fff8e8;border:1px solid #e8d5a0;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0;color:#8a6d1e;font-size:13px;font-weight:600;">⚠️ Action Required</p>
        <p style="margin:8px 0 0;color:#8a6d1e;font-size:13px;">A customer has marked their bank transfer as complete. Please verify the payment in your bank account and confirm or reject below.</p>
      </div>

      <h3 style="color:#000;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;">Customer Details</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f7;border-radius:10px;padding:16px;">
        {_info_row("Name", customer_name)}
        {_info_row("Phone", customer_phone)}
        {_info_row("Address", customer_address or "—")}
        {_info_row("Transaction Ref", ref_html)}
        {_info_row("Receipt", receipt_html)}
      </table>
    </div>

    <h3 style="color:#000;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin:24px 0 12px;">Order Items</h3>
    {items_html}

    <div style="background:#000;border-radius:10px;padding:16px 20px;margin-top:24px;text-align:right;">
      <span style="color:#988686;font-size:12px;letter-spacing:1px;text-transform:uppercase;">Total Amount</span>
      <div style="color:#ffffff;font-size:28px;font-weight:700;margin-top:4px;">Rs. {total}</div>
    </div>

    <p style="margin-top:24px;color:#666;font-size:13px;line-height:1.6;">
      Log in to the admin panel to confirm or reject this payment.
    </p>
    """

    subject = f"🏦 Bank Transfer Pending Verification — Order #{order_id} — OKIRA"
    await _send(ADMIN_EMAIL, subject, _base_template(subject, body))


async def send_payment_confirmed_email(
    customer_email: Optional[str],
    order_id: int,
    customer_name: str,
    total: Decimal,
) -> None:
    """Notify customer (if email provided) that their payment has been confirmed."""
    if not customer_email:
        return
    body = f"""
    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:80px;height:80px;background:linear-gradient(135deg,#000,#5C4E4E);border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:36px;">✓</span>
      </div>
      <h2 style="color:#000;font-size:26px;font-weight:300;letter-spacing:2px;margin:0;">Payment Confirmed!</h2>
      <p style="color:#988686;font-size:14px;margin-top:8px;">Order #{order_id}</p>
    </div>
    <p style="color:#333;font-size:14px;line-height:1.7;text-align:center;">
      Dear <strong>{customer_name}</strong>, your bank transfer of <strong>Rs. {total}</strong> has been verified and confirmed. Your order is now being processed for dispatch.
    </p>
    <div style="margin-top:32px;background:#faf8f7;border-radius:10px;padding:20px;text-align:center;">
      <p style="margin:0;color:#666;font-size:13px;">Need help? Contact us at <a href="mailto:{ADMIN_EMAIL}" style="color:#5C4E4E;font-weight:600;">{ADMIN_EMAIL}</a></p>
    </div>
    """
    subject = f"✅ Payment Confirmed — Order #{order_id} — OKIRA"
    await _send(customer_email, subject, _base_template(subject, body))


async def send_low_stock_email(product_name: str, remaining_stock: int, product_id: int) -> None:
    """Sends an email to the admin when a product's stock is critically low."""
    body = f"""
    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:80px;height:80px;background:linear-gradient(135deg,#e74c3c,#c0392b);border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:36px;color:#fff;">!</span>
      </div>
      <h2 style="color:#000;font-size:26px;font-weight:300;letter-spacing:2px;margin:0;">Low Stock Warning</h2>
    </div>
    <p style="color:#333;font-size:14px;line-height:1.7;text-align:center;">
      The following product has reached critically low inventory levels:
    </p>
    <div style="margin-top:20px;padding:20px;background:#faf8f7;border-left:4px solid #e74c3c;text-align:left;">
      <h3 style="margin:0 0 10px 0;color:#22304F;font-size:18px;">{product_name}</h3>
      <p style="margin:0;font-size:16px;">Remaining Stock: <strong style="color:#e74c3c;">{remaining_stock}</strong></p>
    </div>
    <p style="margin-top:30px;color:#666;font-size:13px;text-align:center;">
      Please log in to the admin panel to update your inventory before this item goes out of stock.
    </p>
    """
    subject = f"⚠️ CRITICAL STOCK ALERT: {product_name} is running low! — OKIRA"
    await _send(ADMIN_EMAIL, subject, _base_template(subject, body))


def fire_and_forget(coro) -> None:
    """Schedule a coroutine to run without blocking the request."""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            loop.create_task(coro)
        else:
            loop.run_until_complete(coro)
    except Exception as e:
        logger.error(f"fire_and_forget error: {e}")
