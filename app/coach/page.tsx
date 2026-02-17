'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Send, Loader2, Bot, User, BookOpen } from 'lucide-react';
import { getAllStudyContent } from '@/app/lib/study-content';
import { chatWithCoach } from '@/app/lib/gemini';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your SAFe study coach. Ask me anything about the SAFe 6.0 Scrum Master certification—roles, events, artifacts, or practices. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [studyContext, setStudyContext] = useState('');
  const [hasContent, setHasContent] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    getAllStudyContent().then((content) => {
      setStudyContext(content);
      setHasContent(!!content.trim());
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setInput('');
    setMessages((m) => [...m, { role: 'user', content: trimmed }]);
    setLoading(true);

    try {
      const reply = await chatWithCoach(trimmed, studyContext);
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: "Sorry, I couldn't connect. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 text-gray-900 flex flex-col">
      <div className="p-4 border-b border-indigo-100 bg-white/80">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold text-indigo-700 flex items-center gap-2">
            <Bot className="w-5 h-5" />
            AI Coach
          </h1>
          <Link href="/upload" className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700">
            <BookOpen className="w-4 h-4" />
            {hasContent ? 'Materials' : 'Upload'}
          </Link>
        </div>
      </div>

      {hasContent && (
        <div className="max-w-3xl mx-auto px-4 pt-2">
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2 text-xs text-indigo-700 flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5" />
            Using your uploaded study materials as context
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto max-w-3xl w-full mx-auto px-4 py-6">
        <div className="space-y-6">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-indigo-600' : 'bg-indigo-100'
                }`}
              >
                {msg.role === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-indigo-600" />
                )}
              </div>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border border-gray-100 shadow-sm'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
                <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
              </div>
            </motion.div>
          )}
        </div>
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-indigo-100 bg-white/80 backdrop-blur p-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about SAFe..."
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              Send
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
