'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Check, X, Sparkles, Loader2, Upload, BookOpen, GraduationCap, ChevronLeft } from 'lucide-react';
import { QUIZ_QUESTIONS, type QuizQuestion } from '@/data/quiz-questions';
import { getAllStudyContent } from '@/app/lib/study-content';
import { explainQuestion, generateQuizFromContent } from '@/app/lib/gemini';
import { saveActivity } from '@/app/lib/activity';
import {
  saveSession,
  loadSession,
  clearSession,
  formatTimeSince,
  type PracticeQuizSession,
} from '@/app/lib/session-storage';

type QuizMode = 'select' | 'builtin' | 'custom' | 'loading-custom';

export default function QuizPage() {
  const [mode, setMode] = useState<QuizMode>('select');
  const [questions, setQuestions] = useState<QuizQuestion[]>(QUIZ_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [hasStudyContent, setHasStudyContent] = useState(false);
  const [generateError, setGenerateError] = useState('');
  const [savedSessionData, setSavedSessionData] = useState<PracticeQuizSession | null>(null);
  const savedRef = useRef(false);

  useEffect(() => {
    getAllStudyContent().then((content) => {
      setHasStudyContent(!!content.trim());
    });
    const session = loadSession<PracticeQuizSession>('practice_quiz');
    if (session) setSavedSessionData(session);
  }, []);

  const startBuiltIn = () => {
    clearSession('practice_quiz');
    setSavedSessionData(null);
    setQuestions(QUIZ_QUESTIONS);
    setMode('builtin');
    resetQuiz();
  };

  const resumeQuiz = () => {
    if (!savedSessionData) return;
    setQuestions(savedSessionData.questions);
    setCurrentIndex(savedSessionData.currentIndex);
    setScore(savedSessionData.score);
    setMode(savedSessionData.mode as QuizMode);
    setSelectedAnswer(null);
    setShowResult(false);
    setAnswered(false);
    setShowExplanation(false);
    setExplanation('');
    savedRef.current = false;
    setSavedSessionData(null);
    clearSession('practice_quiz');
  };

  const handleSaveAndExit = () => {
    if (questions.length === 0) return;
    saveSession<PracticeQuizSession>({
      type: 'practice_quiz',
      questions,
      currentIndex,
      score,
      mode,
      savedAt: Date.now(),
    });
    setMode('select');
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswered(false);
    const session = loadSession<PracticeQuizSession>('practice_quiz');
    if (session) setSavedSessionData(session);
  };

  const startCustomQuiz = async () => {
    clearSession('practice_quiz');
    setSavedSessionData(null);
    setMode('loading-custom');
    setGenerateError('');
    try {
      const content = await getAllStudyContent();
      if (!content.trim()) {
        setGenerateError('No study materials found. Upload content first.');
        setMode('select');
        return;
      }
      const result = await generateQuizFromContent(content, 10);
      if (result.error || !result.questions) {
        setGenerateError(result.error || 'Failed to generate quiz.');
        setMode('select');
        return;
      }
      setQuestions(result.questions);
      setMode('custom');
      resetQuiz();
    } catch {
      setGenerateError('Failed to generate quiz. Please try again.');
      setMode('select');
    }
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswered(false);
    setShowExplanation(false);
    setExplanation('');
    savedRef.current = false;
  };

  const question = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  // Save results to Firestore when quiz completes
  useEffect(() => {
    if (!(isLastQuestion && answered) || savedRef.current || questions.length === 0) return;
    savedRef.current = true;
    clearSession('practice_quiz');

    const percentage = Math.round((score / questions.length) * 100);
    saveActivity({
      type: 'practice_quiz',
      score,
      total: questions.length,
      percentage,
      quizMode: mode,
    });
  }, [isLastQuestion, answered, score, questions, mode]);

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
      const result = await explainQuestion(
        question.question,
        question.options,
        question.correctIndex,
        selectedAnswer
      );
      setExplanation(result);
      setShowExplanation(true);
    } catch {
      setExplanation('Unable to generate explanation. Please try again.');
      setShowExplanation(true);
    } finally {
      setLoadingExplanation(false);
    }
  };

  const handleRestart = () => {
    if (mode === 'custom') {
      startCustomQuiz();
    } else {
      resetQuiz();
    }
  };

  // Mode selection screen
  if (mode === 'select' || mode === 'loading-custom') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 text-gray-900">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold mb-2 text-center">Practice Quiz</h1>
            <p className="text-gray-600 text-center mb-10">Choose your quiz type</p>

            {savedSessionData && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-indigo-800">Resume Saved Quiz</h3>
                  <span className="text-xs text-indigo-500">Saved {formatTimeSince(savedSessionData.savedAt)}</span>
                </div>
                <p className="text-sm text-indigo-600 mb-3">
                  {savedSessionData.mode === 'custom' ? 'AI-Generated' : 'Built-in'} Quiz &bull;{' '}
                  Question {savedSessionData.currentIndex + 1}/{savedSessionData.questions.length} &bull;{' '}
                  Score: {savedSessionData.score}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={resumeQuiz}
                    className="flex-1 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
                  >
                    Resume Quiz
                  </button>
                  <button
                    onClick={() => { clearSession('practice_quiz'); setSavedSessionData(null); }}
                    className="px-4 py-2.5 bg-white text-gray-600 font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    Discard
                  </button>
                </div>
              </div>
            )}

            {generateError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700">
                {generateError}
              </div>
            )}

            <div className="grid gap-4">
              <Link
                href="/quiz/lesson"
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-left hover:border-indigo-300 hover:shadow-md transition-all block"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Lesson Quizzes</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Test by lesson with detailed section-by-section results and study recommendations
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">6 lessons</span>
                      <span className="text-xs text-gray-400">Includes all question banks</span>
                    </div>
                  </div>
                </div>
              </Link>

              <button
                onClick={startBuiltIn}
                disabled={mode === 'loading-custom'}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-left hover:border-indigo-300 hover:shadow-md transition-all disabled:opacity-50"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-indigo-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">SAFe Built-in Quiz</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {QUIZ_QUESTIONS.length} curated questions covering SAFe 6.0 Scrum Master fundamentals
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={startCustomQuiz}
                disabled={!hasStudyContent || mode === 'loading-custom'}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-left hover:border-indigo-300 hover:shadow-md transition-all disabled:opacity-50 relative"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    {mode === 'loading-custom' ? (
                      <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                    ) : (
                      <Sparkles className="w-6 h-6 text-purple-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">
                      AI-Generated from Your Materials
                      {mode === 'loading-custom' && (
                        <span className="text-sm font-normal text-purple-600 ml-2">Generating...</span>
                      )}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {hasStudyContent
                        ? 'Generate 10 custom questions from your uploaded study materials using AI'
                        : 'Upload study materials first to generate custom quizzes'}
                    </p>
                    {!hasStudyContent && (
                      <Link
                        href="/upload"
                        className="inline-flex items-center gap-1.5 mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Upload Materials
                      </Link>
                    )}
                  </div>
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  // Results screen
  if (isLastQuestion && answered) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 text-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto px-6 py-12 text-center"
        >
          <h1 className="text-4xl font-bold mb-4">Quiz Complete!</h1>
          <p className="text-xl text-gray-600 mb-2">
            You got <span className="font-bold text-indigo-600">{score}</span> out of{' '}
            <span className="font-bold">{questions.length}</span> correct ({percentage}%)
          </p>
          {mode === 'custom' && (
            <p className="text-sm text-purple-600 mb-8">Generated from your study materials</p>
          )}
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={handleRestart}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              {mode === 'custom' ? 'Generate New Quiz' : 'Try Again'}
            </button>
            <button
              onClick={() => setMode('select')}
              className="px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Change Quiz Type
            </button>
            <Link
              href="/"
              className="px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
            >
              Home
            </Link>
          </div>
        </motion.div>
      </main>
    );
  }

  // Quiz in progress
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 text-gray-900">
      <div className="p-4 flex justify-between items-center max-w-3xl mx-auto">
        <button
          onClick={handleSaveAndExit}
          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Save &amp; Exit
        </button>
        <span className="text-sm font-medium text-gray-500">
          {currentIndex + 1}/{questions.length} &bull; Score: {score}/{currentIndex + (answered ? 1 : 0)}{' '}
          ({currentIndex + (answered ? 1 : 0) > 0 ? Math.round((score / (currentIndex + (answered ? 1 : 0))) * 100) : 0}%)
          {mode === 'custom' && (
            <span className="ml-2 text-purple-600">(AI Generated)</span>
          )}
        </span>
      </div>

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
