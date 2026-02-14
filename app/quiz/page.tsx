'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Check, X, Sparkles, Loader2 } from 'lucide-react';
import { QUIZ_QUESTIONS } from '@/data/quiz-questions';

export default function QuizPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  const question = QUIZ_QUESTIONS[currentIndex];
  const isLastQuestion = currentIndex === QUIZ_QUESTIONS.length - 1;

  const handleSelectAnswer = (index: number) => {
    if (answered) return;
    setSelectedAnswer(index);
    setAnswered(true);
    setShowResult(true);
    if (index === question.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    setAnswered(false);
    setShowExplanation(false);
    setExplanation('');
    if (isLastQuestion) return;
    setCurrentIndex((i) => i + 1);
  };

  const handleGetExplanation = async () => {
    setLoadingExplanation(true);
    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.question,
          options: question.options,
          correctIndex: question.correctIndex,
          selectedIndex: selectedAnswer,
        }),
      });
      const data = await res.json();
      setExplanation(data.explanation || 'Unable to generate explanation. Add GEMINI_API_KEY to your .env.local for AI explanations.');
      setShowExplanation(true);
    } catch {
      setExplanation('Unable to generate explanation. Add GEMINI_API_KEY to your .env.local for AI explanations.');
      setShowExplanation(true);
    } finally {
      setLoadingExplanation(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswered(false);
    setShowExplanation(false);
    setExplanation('');
  };

  if (isLastQuestion && answered) {
    const percentage = Math.round((score / QUIZ_QUESTIONS.length) * 100);
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 text-gray-900">
        <header className="p-6 max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </header>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto px-6 py-12 text-center"
        >
          <h1 className="text-4xl font-bold mb-4">Quiz Complete!</h1>
          <p className="text-xl text-gray-600 mb-8">
            You got <span className="font-bold text-indigo-600">{score}</span> out of{' '}
            <span className="font-bold">{QUIZ_QUESTIONS.length}</span> correct ({percentage}%)
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={handleRestart}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
            >
              Back to Home
            </Link>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 text-gray-900">
      <header className="p-6 flex justify-between items-center max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700">
          <ArrowLeft className="w-5 h-5" />
          Back
        </Link>
        <span className="text-sm font-medium text-gray-500">
          Question {currentIndex + 1} of {QUIZ_QUESTIONS.length} • Score: {score}
        </span>
      </header>

      <div className="max-w-2xl mx-auto px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-4">
              <span className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-1 rounded">
                {question.topic}
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-8">{question.question}</h2>

            <div className="space-y-3">
              {question.options.map((option, index) => {
                const isCorrect = index === question.correctIndex;
                const isSelected = index === selectedAnswer;
                const showCorrect = answered && isCorrect;
                const showWrong = answered && isSelected && !isCorrect;

                return (
                  <button
                    key={index}
                    onClick={() => handleSelectAnswer(index)}
                    disabled={answered}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      showCorrect
                        ? 'border-green-500 bg-green-50'
                        : showWrong
                          ? 'border-red-500 bg-red-50'
                          : isSelected
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50'
                    } ${answered ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <span className="flex items-center gap-3">
                      {showCorrect && <Check className="w-5 h-5 text-green-600 flex-shrink-0" />}
                      {showWrong && <X className="w-5 h-5 text-red-600 flex-shrink-0" />}
                      <span>{option}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {answered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8"
              >
                <button
                  onClick={handleGetExplanation}
                  disabled={loadingExplanation}
                  className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loadingExplanation ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {loadingExplanation ? 'Getting AI explanation...' : 'Explain with AI'}
                </button>

                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100"
                  >
                    <p className="text-sm font-medium text-indigo-800 mb-2">AI Explanation</p>
                    <p className="text-gray-700">{explanation}</p>
                  </motion.div>
                )}

                <button
                  onClick={handleNext}
                  className="mt-6 w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                >
                  {isLastQuestion ? 'See Results' : 'Next Question'}
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
