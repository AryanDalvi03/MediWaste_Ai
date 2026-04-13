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
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input.trim();
    setMessages((m) => [...m, { role: 'user', text }]);
    setInput('');
    
    try {
      const res = await fetch('http://localhost:8002/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text }),
      });
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      setMessages((m) => [...m, { role: 'bot', text: data.reply }]);
    } catch (error) {
      setMessages((m) => [...m, { role: 'bot', text: 'Error connecting to the MediWaste RAG AI Assistant. Please ensure it is running on port 8002.' }]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-slide-up h-[calc(100vh-10rem)] flex flex-col glass-card rounded-2xl overflow-hidden neon-border">
      <div className="p-6 flex items-center gap-4 shrink-0 border-b border-border/20" style={{ background: 'hsla(220,20%,10%,0.8)' }}>
        <div className="gradient-teal p-2.5 rounded-xl neon-glow-sm">
          <Bot className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-extrabold text-lg tracking-tight text-foreground">Compliance Assistant</h3>
          <p className="text-[10px] font-display font-bold text-primary/80 uppercase tracking-widest mt-0.5 neon-text-subtle">Neural Knowledge Engine v4.0</p>
        </div>
      </div>

      <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar bg-radial-glow">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium ${
              m.role === 'user'
                ? 'gradient-teal text-primary-foreground rounded-tr-sm neon-glow-sm'
                : 'glass-card text-foreground rounded-tl-sm'
            }`}>
              {m.text}
            </div>
          </motion.div>
        ))}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-border/20 flex gap-3 shrink-0" style={{ background: 'hsla(220,20%,10%,0.6)' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Query clinical protocols or safety manuals..."
          className="flex-1 glass-input rounded-xl px-5 py-3 text-sm font-medium focus:outline-none text-foreground placeholder:text-muted-foreground/50"
        />
        <button type="submit" className="gradient-teal text-primary-foreground p-3 rounded-xl neon-glow-sm hover:neon-glow transition-all">
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default AIAssistant;
