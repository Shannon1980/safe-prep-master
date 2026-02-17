'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, Brain, Zap, Upload, Target, GraduationCap } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';

export default function Home() {
  const { user, isConfigured } = useAuth();

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 text-gray-900 font-sans">
      {/* ── Hero ── */}
      <section className="max-w-4xl mx-auto mt-16 text-center px-4">
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

          {!user && isConfigured && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-10 text-yellow-800 text-sm inline-block">
              Sign in with Google to save your progress across devices.
            </div>
          )}

          {/* 3 Primary CTAs */}
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              href="/exam"
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2"
            >
              <Target className="w-5 h-5" />
              Simulate Real Exam
            </Link>
            <Link
              href="/quiz/lesson"
              className="px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              <GraduationCap className="w-5 h-5" />
              Lesson Quizzes
            </Link>
            <Link
              href="/quiz"
              className="px-8 py-4 bg-white text-gray-700 text-lg font-semibold rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Practice Quiz
            </Link>
          </div>
        </motion.div>

        {/* ── Feature Cards ── */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-24 text-left pb-20">
          <Link href="/exam">
            <FeatureCard
              icon={<Target className="w-8 h-8 text-indigo-500" />}
              title="Exam Simulation"
              desc="45 questions, 90 minutes, domain-weighted — just like the real SSM 6.0 exam."
            />
          </Link>
          <Link href="/quiz/lesson">
            <FeatureCard
              icon={<GraduationCap className="w-8 h-8 text-emerald-500" />}
              title="Lesson Quizzes"
              desc="Study lesson by lesson with section breakdown and targeted study recommendations."
            />
          </Link>
          <Link href="/quiz">
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-yellow-500" />}
              title="Practice Quizzes"
              desc="Quick 10-question quizzes or AI-generated from your uploaded materials."
            />
          </Link>
          <Link href="/flashcards">
            <FeatureCard
              icon={<BookOpen className="w-8 h-8 text-blue-500" />}
              title="Smart Flashcards"
              desc="Review 55 key terms across all lessons with spaced repetition."
            />
          </Link>
          <Link href="/upload">
            <FeatureCard
              icon={<Upload className="w-8 h-8 text-green-500" />}
              title="Upload Materials"
              desc="Upload study notes to power custom AI quizzes and coaching."
            />
          </Link>
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 h-full flex flex-col justify-center items-center text-center">
            <Brain className="w-10 h-10 text-purple-500 mb-3" />
            <h3 className="text-xl font-bold mb-2">AI Coach</h3>
            <p className="text-gray-600 text-sm">
              Always available — click the chat bubble in the bottom-right corner to ask anything about SAFe 6.0.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 h-full block hover:border-indigo-200">
      <div className="mb-4 bg-gray-50 w-14 h-14 rounded-xl flex items-center justify-center">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{desc}</p>
    </div>
  );
}
