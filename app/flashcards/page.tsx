'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight, RotateCcw } from 'lucide-react';
import { FLASHCARDS, type Flashcard } from '@/data/flashcards';

const STORAGE_KEY = 'safe-prep-flashcard-progress';

function getStoredProgress(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveProgress(progress: Record<string, number>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export default function FlashcardsPage() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [showReviewAgain, setShowReviewAgain] = useState(false);

  useEffect(() => {
    const shuffled = [...FLASHCARDS].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setProgress(getStoredProgress());
  }, []);

  const currentCard = cards[currentIndex];
  const isLastCard = currentIndex === cards.length - 1;

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleGotIt = () => {
    if (!currentCard) return;
    const newProgress = {
      ...progress,
      [currentCard.id]: (progress[currentCard.id] || 0) + 1,
    };
    setProgress(newProgress);
    saveProgress(newProgress);
    if (isLastCard) {
      setShowReviewAgain(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setIsFlipped(false);
    }
  };

  const handleReviewAgain = () => {
    const toReview = cards.filter((c) => (progress[c.id] || 0) < 2);
    if (toReview.length === 0) {
      setCards([...FLASHCARDS].sort(() => Math.random() - 0.5));
      setProgress({});
    } else {
      setCards(toReview.sort(() => Math.random() - 0.5));
    }
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowReviewAgain(false);
  };

  if (cards.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading flashcards...</div>
      </main>
    );
  }

  if (showReviewAgain) {
    const mastered = cards.filter((c) => (progress[c.id] || 0) >= 2).length;
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 text-gray-900">
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <h1 className="text-2xl font-bold mb-4">Session Complete!</h1>
            <p className="text-gray-600 mb-6">
              You reviewed all {cards.length} cards. {mastered > 0 && `${mastered} marked as mastered.`}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={handleReviewAgain}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Review Again
              </button>
              <Link
                href="/"
                className="px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
              >
                Home
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 text-gray-900">
      <div className="p-4 flex justify-between items-center max-w-3xl mx-auto">
        <h1 className="text-lg font-bold text-indigo-700">Smart Flashcards</h1>
        <span className="text-sm font-medium text-gray-500">
          Card {currentIndex + 1} of {cards.length}
        </span>
      </div>

      <div className="max-w-xl mx-auto px-6 py-8">
        <div
          className="cursor-pointer h-64"
          onClick={handleFlip}
          style={{ perspective: '1000px' }}
        >
          <motion.div
            className="relative w-full h-full"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.5 }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div
              className="absolute inset-0 bg-white rounded-2xl shadow-lg border border-gray-100 p-8 flex flex-col items-center justify-center"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(0deg)' }}
            >
              <span className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-1 rounded mb-4">
                {currentCard.category}
              </span>
              <h2 className="text-2xl font-bold text-center">{currentCard.term}</h2>
              <p className="text-sm text-gray-500 mt-4">Tap to flip</p>
            </div>
            <div
              className="absolute inset-0 bg-indigo-50 rounded-2xl shadow-lg border border-indigo-100 p-8 flex flex-col items-center justify-center"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <span className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-1 rounded mb-4">
                {currentCard.category}
              </span>
              <p className="text-gray-700 text-center">{currentCard.definition}</p>
              <p className="text-sm text-gray-500 mt-4">Tap to flip back</p>
            </div>
          </motion.div>
        </div>

        <div className="mt-8 flex gap-4">
          <button
            onClick={() => {
              const next = [...cards];
              const [removed] = next.splice(currentIndex, 1);
              next.push(removed);
              setCards(next);
              setIsFlipped(false);
              if (currentIndex === cards.length - 1) setCurrentIndex(currentIndex - 1);
            }}
            className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Review Again
          </button>
          <button
            onClick={handleGotIt}
            className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            Got it!
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </main>
  );
}
