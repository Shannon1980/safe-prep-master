'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Brain, MessageSquare, Zap } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 text-gray-900 font-sans">
      <header className="p-6 flex justify-between items-center max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-indigo-700 flex items-center gap-2">
          <Brain className="w-8 h-8" />
          SAFe Prep Master
        </h1>
        <nav className="flex gap-4">
          <button className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg">Login</button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Start Studying</button>
        </nav>
      </header>

      <section className="max-w-4xl mx-auto mt-20 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-5xl font-extrabold mb-6 leading-tight">
            Master the SAFe 6.0 Exam <br /> with <span className="text-indigo-600">AI-Powered</span> Coaching
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Your personal study buddy for the SAFe Scrum Master certification.
            Adaptive quizzes, smart flashcards, and instant explanations.
          </p>
          
          <div className="flex justify-center gap-4">
            <button className="px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Take a Practice Quiz
            </button>
            <button className="px-8 py-4 bg-white text-gray-700 text-lg font-semibold rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-all flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Ask the AI Coach
            </button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mt-24 text-left">
          <FeatureCard 
            icon={<BookOpen className="w-8 h-8 text-blue-500" />}
            title="Smart Flashcards"
            desc="Review key terms like RTE, ART, and WSJF with spaced repetition."
          />
          <FeatureCard 
            icon={<Zap className="w-8 h-8 text-yellow-500" />}
            title="Adaptive Quizzes"
            desc="Questions get harder as you get better. Focus on your weak spots."
          />
          <FeatureCard 
            icon={<Brain className="w-8 h-8 text-purple-500" />}
            title="AI Explanations"
            desc="Don't just get the answer. Get the 'Why' explained like a friend."
          />
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
      <div className="mb-4 bg-gray-50 w-14 h-14 rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{desc}</p>
    </div>
  );
}
