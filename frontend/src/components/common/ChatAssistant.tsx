import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import axios from 'axios';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your OQIRA support assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // In a real app, API_URL from environment would be used
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'https://okira-backend.vercel.app/api/v1'}/chat`, {
        message: userMessage
      });

      setMessages((prev) => [...prev, { role: 'assistant', content: response.data.reply }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I am having trouble connecting right now. Please try again later or contact us on WhatsApp.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-navy text-white shadow-xl transition-transform hover:scale-110 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        aria-label="Open Chat Support"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-6 right-6 z-50 flex h-[500px] max-h-[80vh] w-[350px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 ${isOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-10 opacity-0'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-navy px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-pink-pale" />
            <span className="font-display font-semibold">Support Assistant</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="rounded-full p-1 hover:bg-white/20">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto bg-cream-2 p-4">
          <div className="flex flex-col gap-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${msg.role === 'user' ? 'bg-pink-deep text-white rounded-tr-sm' : 'bg-white text-navy rounded-tl-sm'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-sm shadow-sm">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-navy/40"></span>
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-navy/40" style={{ animationDelay: '150ms' }}></span>
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-navy/40" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-navy/10 bg-white p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-full border border-navy/20 bg-cream-2 px-4 py-2 text-sm text-navy outline-none focus:border-pink-deep focus:ring-1 focus:ring-pink-deep"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-white transition-colors hover:bg-pink-deep disabled:opacity-50"
            >
              <Send className="h-4 w-4 ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
