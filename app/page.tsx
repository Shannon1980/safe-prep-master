'use client';

import { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Brain, MessageSquare, Zap, CheckCircle, XCircle, ChevronLeft, Award } from 'lucide-react';

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "safe-prep-master",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase only if config is present
const hasConfig = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const app = (hasConfig && getApps().length === 0) ? initializeApp(firebaseConfig) : (getApps().length > 0 ? getApps()[0] : null);
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

// --- Mock Data ---
const LESSON_1_QUIZ = [
  {
    id: 1,
    question: "The Agile Manifesto states that we value 'Responding to change' over what?",
    options: ["Following a plan", "Customer collaboration", "Working software", "Detailed documentation"],
    answer: 0
  },
  {
    id: 2,
    question: "Agile is principally about ________, not just practices.",
    options: ["Speed", "Mindset", "Efficiency", "Planning"],
    answer: 1
  },
  {
    id: 3,
    question: "What is the primary goal of the Scrum of Scrums event?",
    options: ["To review each team's progress", "To review the ART's progress toward PI Objectives", "To focus on ART process improvement", "To demo Features"],
    answer: 1
  },
  {
    id: 4,
    question: "An Iteration follows which cycle according to SAFe?",
    options: ["Build-Measure-Learn", "Plan-Do-Check-Adjust (PDCA)", "Design-Code-Test-Deploy", "Ideate-Prototype-Test"],
    answer: 1
  },
  {
    id: 5,
    question: "Who owns the Team Backlog and is responsible for prioritizing the 'What'?",
    options: ["Scrum Master", "RTE", "Product Owner", "The Team"],
    answer: 2
  }
];

const FLASHCARDS = [
  { term: "RTE", definition: "Release Train Engineer: The Chief Scrum Master for the Agile Release Train (ART)." },
  { term: "ART", definition: "Agile Release Train: A long-lived team of Agile teams that incremental delivers value." },
  { term: "WSJF", definition: "Weighted Shortest Job First: A prioritization model used to sequence jobs by cost of delay and job size." },
  { term: "PI Planning", definition: "Program Increment Planning: A cadence-based event that serves as the heartbeat of the ART." }
];

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'home' | 'quiz' | 'flashcards' | 'results'>('home');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

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
    if (!auth || !db) return alert("Firebase not configured. Please add API keys to .env.local");
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const userRef = doc(db, 'users', result.user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: result.user.email,
          displayName: result.user.displayName,
          progress: { lessonsCompleted: [], quizScores: {} },
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const submitQuiz = async (finalScore: number) => {
    if (user && db) {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        "progress.lessonsCompleted": arrayUnion("Lesson 1"),
        [`progress.quizScores.Lesson1`]: finalScore
      });
    }
    setView('results');
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-indigo-50">Loading Bob's Brain...</div>;

  return (
    <main className="min-h-screen bg-indigo-50 font-sans text-gray-900">
      {/* Header */}
      <header className="p-4 bg-white border-b border-indigo-100 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
          <Brain className="w-6 h-6 text-indigo-600" />
          <h1 className="text-xl font-bold text-indigo-700 hidden md:block">SAFe Prep Master</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600">Hi, {user.displayName?.split(' ')[0]}</span>
              <button onClick={() => auth?.signOut()} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Logout</button>
            </div>
          ) : (
            <button onClick={handleLogin} className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition-all">Login</button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <section className="text-center py-12">
                <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">Master the SAFe 6.0 Exam</h2>
                <p className="text-lg text-gray-600 mb-10 max-w-xl mx-auto">Your AI-powered study companion for the Scrum Master certification. Track your progress, take quizzes, and master the material.</p>
                
                {!user && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-10 text-yellow-800 text-sm inline-block">
                    🔒 Login with Google to save your progress.
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-indigo-50 hover:shadow-md transition-shadow">
                    <Zap className="w-10 h-10 text-yellow-500 mb-4 mx-auto" />
                    <h3 className="text-xl font-bold mb-2">Lesson 1: Intro</h3>
                    <p className="text-sm text-gray-500 mb-6">Learn the basics of Scrum in the Scaled Agile Framework.</p>
                    <button 
                      onClick={() => setView('quiz')}
                      className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                    >
                      Start Quiz
                    </button>
                  </div>

                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-indigo-50 hover:shadow-md transition-shadow">
                    <BookOpen className="w-10 h-10 text-blue-500 mb-4 mx-auto" />
                    <h3 className="text-xl font-bold mb-2">Flashcards</h3>
                    <p className="text-sm text-gray-500 mb-6">Quick-fire review of terms like WSJF, ART, and RTE.</p>
                    <button 
                      onClick={() => setView('flashcards')}
                      className="w-full py-4 border-2 border-indigo-100 text-indigo-600 font-bold rounded-2xl hover:bg-indigo-50 transition-all"
                    >
                      Open Deck
                    </button>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {view === 'quiz' && (
            <motion.div key="quiz" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white p-8 rounded-3xl shadow-sm border border-indigo-50">
               <div className="flex justify-between items-center mb-8">
                 <button onClick={() => setView('home')} className="flex items-center gap-1 text-gray-400 hover:text-indigo-600 transition-colors">
                   <ChevronLeft className="w-4 h-4" /> Back
                 </button>
                 <span className="text-sm font-bold text-indigo-300">Question {currentQuestion + 1} of {LESSON_1_QUIZ.length}</span>
               </div>

               <h2 className="text-2xl font-bold mb-8 leading-snug">{LESSON_1_QUIZ[currentQuestion].question}</h2>
               
               <div className="space-y-3">
                 {LESSON_1_QUIZ[currentQuestion].options.map((opt, idx) => (
                   <button 
                    key={idx}
                    onClick={() => {
                      if (idx === LESSON_1_QUIZ[currentQuestion].answer) setScore(s => s + 1);
                      if (currentQuestion < LESSON_1_QUIZ.length - 1) {
                        setCurrentQuestion(c => c + 1);
                      } else {
                        submitQuiz(score + (idx === LESSON_1_QUIZ[currentQuestion].answer ? 1 : 0));
                      }
                    }}
                    className="w-full text-left p-5 rounded-2xl border-2 border-gray-50 hover:border-indigo-200 hover:bg-indigo-50 transition-all font-medium"
                   >
                     {opt}
                   </button>
                 ))}
               </div>
            </motion.div>
          )}

          {view === 'results' && (
            <motion.div key="results" className="text-center py-12 bg-white rounded-3xl shadow-sm border border-indigo-50">
              <Award className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
              <h2 className="text-3xl font-extrabold mb-2">Quiz Complete!</h2>
              <p className="text-gray-500 mb-8">Great job reviewing Lesson 1.</p>
              <div className="text-6xl font-black text-indigo-600 mb-10">{Math.round((score / LESSON_1_QUIZ.length) * 100)}%</div>
              <button onClick={() => { setView('home'); setCurrentQuestion(0); setScore(0); }} className="px-10 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all">Back to Dashboard</button>
            </motion.div>
          )}

          {view === 'flashcards' && (
            <motion.div key="flashcards" className="space-y-6">
              <button onClick={() => setView('home')} className="flex items-center gap-1 text-gray-400 hover:text-indigo-600 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <div className="grid gap-4">
                {FLASHCARDS.map((card, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl border border-indigo-50 shadow-sm">
                    <h4 className="text-indigo-600 font-black text-xl mb-1">{card.term}</h4>
                    <p className="text-gray-600 leading-relaxed">{card.definition}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <footer className="mt-20 py-10 text-center text-gray-300 text-xs border-t border-indigo-50">
        {!hasConfig && <p className="text-red-300 mb-2">⚠️ Firebase Keys Missing (Developer Mode)</p>}
        <p>Proactive Employee System • Built by Bob 🤖</p>
      </footer>
    </main>
  );
}
