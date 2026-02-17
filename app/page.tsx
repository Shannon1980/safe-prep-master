'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, Brain, MessageSquare, Zap, Upload } from 'lucide-react';
import { signInWithPopup, onAuthStateChanged, type User } from 'firebase/auth';
import { getFirebaseAuth, GoogleAuthProvider, hasFirebaseConfig } from '@/app/lib/firebase';

const auth = getFirebaseAuth();
const hasConfig = hasFirebaseConfig;

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    if (!auth) return alert('Firebase not configured. Add API keys to .env.local');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-indigo-50">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 text-gray-900 font-sans">
      <header className="p-6 flex justify-between items-center max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-indigo-700 flex items-center gap-2">
          <Brain className="w-8 h-8" />
          SAFe Prep Master
        </h1>
        <nav className="flex gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600">Hi, {user.displayName?.split(' ')[0]}</span>
              <button onClick={() => auth?.signOut()} className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg">
                Logout
              </button>
            </div>
          ) : hasConfig ? (
            <button onClick={handleLogin} className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg">
              Login
            </button>
          ) : null}
          <Link href="/quiz" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Start Studying
          </Link>
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

          {!user && hasConfig && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-10 text-yellow-800 text-sm inline-block">
              Login with Google to save your progress.
            </div>
          )}

          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              href="/quiz"
              className="px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Take a Practice Quiz
            </Link>
            <Link
              href="/coach"
              className="px-8 py-4 bg-white text-gray-700 text-lg font-semibold rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <MessageSquare className="w-5 h-5" />
              Ask the AI Coach
            </Link>
            <Link
              href="/flashcards"
              className="px-8 py-4 bg-white text-gray-700 text-lg font-semibold rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              Smart Flashcards
            </Link>
            <Link
              href="/upload"
              className="px-8 py-4 bg-white text-gray-700 text-lg font-semibold rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Upload Materials
            </Link>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-24 text-left">
          <Link href="/flashcards">
            <FeatureCard
              icon={<BookOpen className="w-8 h-8 text-blue-500" />}
              title="Smart Flashcards"
              desc="Review key terms like RTE, ART, and WSJF with spaced repetition."
            />
          </Link>
          <Link href="/quiz">
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-yellow-500" />}
              title="Adaptive Quizzes"
              desc="Questions get harder as you get better. Focus on your weak spots."
            />
          </Link>
          <Link href="/coach">
            <FeatureCard
              icon={<Brain className="w-8 h-8 text-purple-500" />}
              title="AI Explanations"
              desc="Don't just get the answer. Get the 'Why' explained like a friend."
            />
          </Link>
          <Link href="/upload">
            <FeatureCard
              icon={<Upload className="w-8 h-8 text-green-500" />}
              title="Upload Materials"
              desc="Upload your study notes to power custom AI quizzes and coaching."
            />
          </Link>
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
