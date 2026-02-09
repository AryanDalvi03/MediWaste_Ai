import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Send } from 'lucide-react';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: 'MediWaste AI v4.0 is online. How can I assist with clinical compliance today?' },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input.trim();
    setMessages((m) => [...m, { role: 'user', text }]);
    setInput('');
    setTimeout(() => {
      let reply = 'I am checking hospital compliance guidelines for your query...';
      if (text.toLowerCase().includes('needle'))
        reply = 'Protocol: Dispose in Red Sharps bin. Never recap. If an injury occurred, use the SOS Protocol immediately.';
      if (text.toLowerCase().includes('glove'))
        reply = 'Gloves should be disposed in Yellow Clinical Bin. Standard infectious waste procedure applies.';
      setMessages((m) => [...m, { role: 'bot', text: reply }]);
    }, 800);
  };

  return (
    <div className="max-w-3xl mx-auto animate-slide-up h-[calc(100vh-10rem)] flex flex-col bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="gradient-dark text-primary-foreground p-6 flex items-center gap-4 shrink-0">
        <div className="gradient-teal p-2.5 rounded-xl">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-extrabold text-lg tracking-tight">Compliance Assistant</h3>
          <p className="text-xs font-bold text-primary/80 uppercase tracking-wider mt-0.5">Neural Knowledge Engine v4.0</p>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-muted/20 custom-scrollbar">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium shadow-sm ${
              m.role === 'user'
                ? 'gradient-teal text-primary-foreground rounded-tr-sm'
                : 'bg-card text-foreground rounded-tl-sm border border-border'
            }`}>
              {m.text}
            </div>
          </motion.div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 bg-card border-t border-border flex gap-3 shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Query clinical protocols or safety manuals..."
          className="flex-1 bg-muted/50 border border-border rounded-xl px-5 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
        />
        <button type="submit" className="gradient-teal text-primary-foreground p-3 rounded-xl shadow-lg hover:opacity-90 transition-opacity">
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default AIAssistant;
