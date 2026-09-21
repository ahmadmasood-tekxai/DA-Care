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
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
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

      const reply = response.data.reply;
      
      // Simulate chunked streaming response
      setIsStreaming(true);
      let currentText = '';
      const chunks = reply.split(''); // stream char by char
      
      for (let i = 0; i < chunks.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 20)); // typing speed
        currentText += chunks[i];
        setStreamingMessage(currentText);
        scrollToBottom();
      }
      
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      setStreamingMessage('');
      setIsStreaming(false);

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
        className={`fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-navy to-pink-deep text-white shadow-2xl shadow-pink-deep/30 transition-all duration-300 hover:scale-110 hover:shadow-pink-deep/50 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        aria-label="Open Chat Support"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-6 right-6 z-50 flex h-[500px] max-h-[80vh] w-[350px] flex-col overflow-hidden rounded-3xl glass shadow-2xl transition-all duration-500 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-navy to-navy/90 px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-deep/30">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="block font-display text-sm font-semibold tracking-wide">Support Assistant</span>
              <span className="block text-[10px] text-pink-pale">Typically replies instantly</span>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="rounded-full p-1.5 hover:bg-white/10 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin bg-cream/50 p-5 backdrop-blur-sm">
          <div className="flex flex-col gap-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-2.5 text-sm shadow-sm ${msg.role === 'user' ? 'bg-navy text-white rounded-2xl rounded-tr-sm' : 'bg-white border border-white/50 text-navy-soft rounded-2xl rounded-tl-sm'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {/* Streaming Message block */}
            {isStreaming && streamingMessage && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white border border-white/50 px-4 py-2.5 text-sm text-navy-soft shadow-sm">
                  {streamingMessage}
                  <span className="ml-1 inline-block h-3 w-1.5 animate-pulse bg-pink-deep"></span>
                </div>
              </div>
            )}
            
            {isLoading && !isStreaming && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white border border-white/50 px-4 py-3 text-sm shadow-sm">
                  <div className="flex gap-1.5">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-pink-deep/40"></span>
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-pink-deep/40" style={{ animationDelay: '150ms' }}></span>
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-pink-deep/40" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-navy/5 bg-white/80 backdrop-blur-md p-4">
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
              placeholder="Ask about products, delivery..."
              className="flex-1 rounded-full border border-navy/10 bg-cream/50 px-4 py-2.5 text-sm text-navy outline-none transition-all focus:border-pink-deep focus:bg-white focus:ring-2 focus:ring-pink-deep/20"
              disabled={isLoading || isStreaming}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading || isStreaming}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-white transition-all hover:scale-105 hover:bg-pink-deep hover:shadow-md disabled:pointer-events-none disabled:opacity-40"
            >
              <Send className="h-4 w-4 ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
