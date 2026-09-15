"""
Chat route — rule-based assistant for OKIRA store.

The previous OpenAI implementation used an expired API key and was causing
500 errors. This replaces it with a fast, zero-cost rule-based chatbot that
covers the most common customer questions without any external API dependency.
"""
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/chat", tags=["Chat"])


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


# ---------------------------------------------------------------------------
# Simple keyword-based response engine
# ---------------------------------------------------------------------------

_RULES: list[tuple[list[str], str]] = [
    # Delivery
    (["deliver", "shipping", "ship", "how long", "days", "when"],
     "We deliver nationwide across Pakistan within **3–5 working days**. Once your order is confirmed and payment is verified, it will be dispatched promptly."),

    # Payment methods
    (["payment", "pay", "how to pay", "method"],
     "We offer two payment methods:\n\n1. **Cash on Delivery (COD)** — Pay when your package arrives.\n2. **Manual Bank Transfer** — Transfer to our Mashriq Bank account, upload your receipt, and we'll verify it within a few hours."),

    # Bank transfer details
    (["bank", "transfer", "meezan", "account", "iban"],
     "Our bank details are:\n\n- **Bank:** Mashriq Bank\n- **Account Title:** Muhammad Ahmad\n- **Account Number:** 089010046367\n- **IBAN:** PK45MSHQ0000089010046367\n\nAfter transferring, please upload your receipt screenshot at checkout."),

    # Return / exchange
    (["return", "exchange", "refund", "replace"],
     "We accept returns on **unused apparel and jewellery within 7 days** of delivery. Skin care items cannot be returned once opened for hygiene reasons. Please contact us with your order number to initiate a return."),

    # Products / categories
    (["product", "sell", "what", "category", "jewellery", "jewelry", "skin", "care", "suit", "baby", "apparel"],
     "OKIRA offers a curated selection of:\n\n- 💎 **Premium Jewellery** — Elegant pieces for every occasion\n- 🌿 **Skin Care** — Nourishing premium formulations\n- 👔 **Luxury Apparel** — Tailored suits & premium wear\n- 🍼 **Baby Essentials** — Soft, comfortable, beautifully crafted items"),

    # Order status / tracking
    (["order", "status", "track", "where", "my order"],
     "After placing your order, you will receive a confirmation email. For **Bank Transfer** orders, the status updates once payment is verified by our team. For any order queries, please contact us directly."),

    # Contact
    (["contact", "reach", "email", "phone", "help", "support"],
     "You can reach us by email at **ahmadmasood171717@gmail.com**. Our team responds within a few hours during business hours (Mon–Sat, 9am–8pm PKT)."),

    # Pricing / discount
    (["price", "discount", "offer", "sale", "cost", "cheap"],
     "We regularly offer discounts on our products. Check the storefront for the latest prices and special badges like 'Sale' or 'Bestseller'. All prices are listed in Pakistani Rupees (Rs.)"),

    # Greeting
    (["hi", "hello", "hey", "salam", "assalam", "good morning", "good evening"],
     "Hello! 👋 Welcome to **OKIRA**. How can I help you today? You can ask me about our products, delivery, payment methods, or returns."),
]


def _get_reply(message: str) -> str:
    msg_lower = message.lower()
    for keywords, response in _RULES:
        if any(kw in msg_lower for kw in keywords):
            return response
    return (
        "Thank you for reaching out to OKIRA! 😊\n\n"
        "I can help you with information about our **products**, **delivery**, **payment methods**, and **returns**. "
        "Could you please rephrase your question? Or feel free to contact us at "
        "+923021735137 for direct assistance."
    )


@router.post("", response_model=ChatResponse)
async def chat_with_assistant(request: ChatRequest) -> ChatResponse:
    reply = _get_reply(request.message.strip())
    return ChatResponse(reply=reply)
