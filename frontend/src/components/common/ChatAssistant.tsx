import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Bot, MessageCircle, Send, X } from 'lucide-react';
import clsx from 'clsx';

import { apiClient } from '@/api/client';
import { STORE_NAME, WHATSAPP_NUMBER_1 } from '@/constants';
import { buildWhatsAppLink } from '@/utils/format';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_QUESTIONS = ['Delivery time?', 'Payment methods', 'Return policy', 'Bank details'];

/** Renders the bot's lightweight markdown: **bold** and line breaks. */
function renderRich(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className="font-semibold text-navy">{part.slice(2, -2)}</strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  );
}

export function ChatAssistant() {
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Hi! I'm the ${STORE_NAME} assistant. Ask me about delivery, payments, returns or our products.` },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isLoading]);

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen]);

  // Back-office screens don't need the bubble.
  if (pathname.startsWith('/admin')) return null;

  const send = async (text: string) => {
    const message = text.trim();
    if (!message || isLoading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    setIsLoading(true);
    try {
      const { data } = await apiClient.post<{ reply: string }>('/chat', { message });
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Sorry, I couldn't connect just now. Please try again, or message us on **WhatsApp** for a quick reply." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={clsx(
          'fixed bottom-4 right-4 z-[75] flex h-14 w-14 items-center justify-center rounded-full bg-navy text-gold-light shadow-lift ring-1 ring-gold/30 transition-all duration-300 hover:scale-105 sm:bottom-6 sm:right-6',
          isOpen && 'pointer-events-none scale-0 opacity-0',
          pathname.startsWith('/products/') && 'max-lg:bottom-24'
        )}
        aria-label="Open chat support"
        aria-expanded={isOpen}
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      <div
        role="dialog"
        aria-label="Chat support"
        aria-hidden={!isOpen}
        className={clsx(
          'fixed inset-x-0 bottom-0 z-[95] flex h-[85vh] origin-bottom-right flex-col overflow-hidden rounded-t-3xl bg-white shadow-lift transition-all duration-300 ease-out-expo sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-[560px] sm:max-h-[calc(100vh-3rem)] sm:w-[380px] sm:rounded-3xl',
          isOpen ? 'scale-100 opacity-100' : 'pointer-events-none invisible scale-95 opacity-0'
        )}
      >
        <header className="flex items-center justify-between bg-navy px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/15 text-gold-light">
              <Bot className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">{STORE_NAME} Support</p>
              <p className="flex items-center gap-1.5 text-[11px] text-white/60">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Replies instantly
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="rounded-full p-2 transition-colors hover:bg-white/10" aria-label="Close chat">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto bg-cream/60 p-4 scrollbar-thin" aria-live="polite">
          <div className="flex flex-col gap-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={clsx('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div
                  className={clsx(
                    'max-w-[85%] whitespace-pre-line px-4 py-2.5 text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'rounded-2xl rounded-br-md bg-navy text-white'
                      : 'rounded-2xl rounded-bl-md border border-navy/[.07] bg-white text-navy-soft shadow-soft'
                  )}
                >
                  {msg.role === 'assistant' ? renderRich(msg.content) : msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start" aria-label="Assistant is typing">
                <div className="flex gap-1.5 rounded-2xl rounded-bl-md border border-navy/[.07] bg-white px-4 py-3.5 shadow-soft">
                  {[0, 150, 300].map((d) => (
                    <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-pink-deep/50" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            )}

            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="rounded-full border border-gold/40 bg-white px-3 py-1.5 text-xs font-medium text-navy transition-colors hover:border-gold hover:bg-gold/10"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>
        </div>

        <div className="pb-safe border-t border-navy/[.07] bg-white px-4 pt-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2"
          >
            <label htmlFor="chat-input" className="sr-only">Message</label>
            <input
              id="chat-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question…"
              autoComplete="off"
              className="h-11 flex-1 rounded-full border border-navy/10 bg-cream/60 px-4 text-sm text-navy outline-none transition-colors focus:border-gold focus:bg-white focus:ring-2 focus:ring-gold/20"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy text-white transition-colors hover:bg-pink-deep disabled:opacity-40"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <a
            href={buildWhatsAppLink(WHATSAPP_NUMBER_1)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block text-center text-[11px] font-medium text-navy-soft/70 hover:text-navy"
          >
            Prefer a human? Chat on WhatsApp
          </a>
        </div>
      </div>
    </>
  );
}
