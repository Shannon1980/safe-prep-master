'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Check,
  X,
  Sparkles,
  Loader2,
  Upload,
  BookOpen,
  GraduationCap,
  ChevronLeft,
  Flag,
  CheckCircle,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import { QUIZ_QUESTIONS, type QuizQuestion } from '@/data/quiz-questions';
import { getAllStudyContent } from '@/app/lib/study-content';
import { explainQuestion, generateQuizFromContent, parseExplanation } from '@/app/lib/gemini';
import { saveActivity, type QuestionResult } from '@/app/lib/activity';
import {
  saveSession,
  loadSession,
  clearSession,
  formatTimeSince,
  type PracticeQuizSession,
} from '@/app/lib/session-storage';
import { setPresenceDetail } from '@/app/lib/presence';
import {
  QuestionNavigator,
  BottomNavBar,
  SubmitConfirmModal,
  type QuestionNavState,
} from '@/app/components/quiz-nav';

type Phase = 'select' | 'loading-custom' | 'quiz' | 'results' | 'review';

export default function QuizPage() {
  const [phase, setPhase] = useState<Phase>('select');
  const [quizSource, setQuizSource] = useState<'builtin' | 'custom'>('builtin');
  const [questions, setQuestions] = useState<QuizQuestion[]>(QUIZ_QUESTIONS);
  const [questionStates, setQuestionStates] = useState<QuestionNavState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showNavigator, setShowNavigator] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [hasStudyContent, setHasStudyContent] = useState(false);
  const [generateError, setGenerateError] = useState('');
  const [savedSessionData, setSavedSessionData] = useState<PracticeQuizSession | null>(null);
  const savedRef = useRef(false);

  // Review screen state
  const [reviewExplanations, setReviewExplanations] = useState<Record<number, string>>({});
  const [reviewLoadingIdx, setReviewLoadingIdx] = useState<number | null>(null);

  useEffect(() => {
    getAllStudyContent().then((content) => {
      setHasStudyContent(!!content.trim());
    });
    const session = loadSession<PracticeQuizSession>('practice_quiz');
    if (session && session.questionStates) {
      setSavedSessionData(session);
    } else {
      // Discard old-format sessions
      clearSession('practice_quiz');
    }
  }, []);

  const initQuiz = (qs: QuizQuestion[]) => {
    setQuestions(qs);
    setQuestionStates(qs.map(() => ({ selectedAnswer: null, selectedAnswers: [], flagged: false })));
    setCurrentIndex(0);
    savedRef.current = false;
    setShowNavigator(false);
    setShowSubmitConfirm(false);
    setReviewExplanations({});
    setReviewLoadingIdx(null);
  };

  const startBuiltIn = () => {
    clearSession('practice_quiz');
    setSavedSessionData(null);
    initQuiz(QUIZ_QUESTIONS);
    setQuizSource('builtin');
    setPhase('quiz');
    setPresenceDetail(`Q1/${QUIZ_QUESTIONS.length}`);
  };

  const resumeQuiz = () => {
    if (!savedSessionData) return;
    setQuestions(savedSessionData.questions);
    setQuestionStates(savedSessionData.questionStates);
    setCurrentIndex(savedSessionData.currentIndex);
    setQuizSource(savedSessionData.mode as 'builtin' | 'custom');
    savedRef.current = false;
    setShowNavigator(false);
    setShowSubmitConfirm(false);
    setReviewExplanations({});
    setReviewLoadingIdx(null);
    setSavedSessionData(null);
    clearSession('practice_quiz');
    setPhase('quiz');
    setPresenceDetail(`Q${savedSessionData.currentIndex + 1}/${savedSessionData.questions.length} (Resumed)`);
  };

  const startCustomQuiz = async () => {
    clearSession('practice_quiz');
    setSavedSessionData(null);
    setPhase('loading-custom');
    setGenerateError('');
    try {
      const content = await getAllStudyContent();
      if (!content.trim()) {
        setGenerateError('No study materials found. Upload content first.');
        setPhase('select');
        return;
      }
      const result = await generateQuizFromContent(content, 10);
      if (result.error || !result.questions) {
        setGenerateError(result.error || 'Failed to generate quiz.');
        setPhase('select');
        return;
      }
      initQuiz(result.questions);
      setQuizSource('custom');
      setPhase('quiz');
    } catch {
      setGenerateError('Failed to generate quiz. Please try again.');
      setPhase('select');
    }
  };

  // Auto-save refs
  const questionsRef = useRef(questions);
  const statesRef = useRef(questionStates);
  const indexRef = useRef(currentIndex);
  const quizSourceRef = useRef(quizSource);
  questionsRef.current = questions;
  statesRef.current = questionStates;
  indexRef.current = currentIndex;
  quizSourceRef.current = quizSource;

  const saveCurrentSession = useCallback(() => {
    if (questionsRef.current.length === 0) return;
    saveSession<PracticeQuizSession>({
      type: 'practice_quiz',
      questions: questionsRef.current,
      questionStates: statesRef.current,
      currentIndex: indexRef.current,
      mode: quizSourceRef.current,
      savedAt: Date.now(),
    });
  }, []);

  // Auto-save every 30s + on beforeunload
  useEffect(() => {
    if (phase !== 'quiz') return;
    const interval = setInterval(saveCurrentSession, 30_000);
    const handleUnload = () => saveCurrentSession();
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [phase, saveCurrentSession]);

  const handleSaveAndExit = () => {
    saveCurrentSession();
    setPhase('select');
    const session = loadSession<PracticeQuizSession>('practice_quiz');
    if (session) setSavedSessionData(session);
  };

  // Update presence when navigating
  useEffect(() => {
    if (phase === 'quiz' && questions.length > 0) {
      const answered = questionStates.filter(s => s.selectedAnswers.length > 0).length;
      setPresenceDetail(`Q${currentIndex + 1}/${questions.length} (${answered} answered)`);
    }
  }, [phase, currentIndex, questions.length, questionStates]);

  // Navigation
  const goToQuestion = (index: number) => {
    setCurrentIndex(index);
    setShowNavigator(false);
  };
  const goNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex((i) => i + 1);
  };
  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const selectAnswer = (index: number) => {
    setQuestionStates((prev) => {
      const next = [...prev];
      next[currentIndex] = { ...next[currentIndex], selectedAnswer: index, selectedAnswers: [index] };
      return next;
    });
  };

  const toggleFlag = () => {
    setQuestionStates((prev) => {
      const next = [...prev];
      next[currentIndex] = { ...next[currentIndex], flagged: !next[currentIndex].flagged };
      return next;
    });
  };

  const handleSubmit = () => {
    setShowSubmitConfirm(false);
    clearSession('practice_quiz');
    setPhase('results');
  };

  // Save results to Firestore
  useEffect(() => {
    if (phase !== 'results' || savedRef.current || questions.length === 0) return;
    savedRef.current = true;

    const score = questions.reduce(
      (acc, q, i) => acc + (questionStates[i].selectedAnswer === q.correctIndex ? 1 : 0),
      0
    );
    const percentage = Math.round((score / questions.length) * 100);

    const missedQuestions: QuestionResult[] = questions
      .map((q, i) => {
        if (questionStates[i].selectedAnswer === q.correctIndex) return null;
        return {
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          selectedIndex: questionStates[i].selectedAnswer,
          isCorrect: false,
        };
      })
      .filter(Boolean) as QuestionResult[];

    saveActivity({
      type: 'practice_quiz',
      score,
      total: questions.length,
      percentage,
      quizMode: quizSource,
      missedQuestions: missedQuestions.length > 0 ? missedQuestions : undefined,
    });
  }, [phase, questions, questionStates, quizSource]);

  // Computed values
  const answeredCount = questionStates.filter((s) => s.selectedAnswers.length > 0).length;
  const flaggedCount = questionStates.filter((s) => s.flagged).length;
  const unansweredCount = questions.length - answeredCount;

  // AI Explanation for review
  const handleGetReviewExplanation = async (qIdx: number) => {
    if (reviewExplanations[qIdx] !== undefined) return;
    setReviewLoadingIdx(qIdx);
    try {
      const q = questions[qIdx];
      const result = await explainQuestion(
        q.question,
        q.options,
        q.correctIndex,
        questionStates[qIdx].selectedAnswer
      );
      setReviewExplanations((prev) => ({ ...prev, [qIdx]: result }));
    } catch {
      setReviewExplanations((prev) => ({ ...prev, [qIdx]: 'Unable to generate explanation. Please try again.' }));
    } finally {
      setReviewLoadingIdx(null);
    }
  };

  // ── SELECT SCREEN ──
  if (phase === 'select' || phase === 'loading-custom') {
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
                  {savedSessionData.questionStates.filter(s => s.selectedAnswers.length > 0).length} answered
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
                disabled={phase === 'loading-custom'}
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
                disabled={!hasStudyContent || phase === 'loading-custom'}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-left hover:border-indigo-300 hover:shadow-md transition-all disabled:opacity-50 relative"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    {phase === 'loading-custom' ? (
                      <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                    ) : (
                      <Sparkles className="w-6 h-6 text-purple-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">
                      AI-Generated from Your Materials
                      {phase === 'loading-custom' && (
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

  // ── RESULTS SCREEN ──
  if (phase === 'results') {
    const score = questions.reduce(
      (acc, q, i) => acc + (questionStates[i].selectedAnswer === q.correctIndex ? 1 : 0),
      0
    );
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
          {quizSource === 'custom' && (
            <p className="text-sm text-purple-600 mb-8">Generated from your study materials</p>
          )}
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => setPhase('review')}
              className="px-6 py-3 bg-white text-indigo-700 rounded-xl font-semibold border border-indigo-200 hover:bg-indigo-50 transition-colors inline-flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Review Answers
            </button>
            <button
              onClick={() => {
                if (quizSource === 'custom') {
                  startCustomQuiz();
                } else {
                  initQuiz(QUIZ_QUESTIONS);
                  setQuizSource('builtin');
                  setPhase('quiz');
                }
              }}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              {quizSource === 'custom' ? 'Generate New Quiz' : 'Try Again'}
            </button>
            <button
              onClick={() => setPhase('select')}
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

  // ── REVIEW SCREEN ──
  if (phase === 'review') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 text-gray-900">
        <div className="p-4 border-b border-gray-200 bg-white/80 backdrop-blur sticky top-0 z-10">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <button onClick={() => setPhase('results')} className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              <ChevronLeft className="w-5 h-5" /> Back to Results
            </button>
            <h1 className="font-bold">Answer Review</h1>
            <div />
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-4">
          {questions.map((q, i) => {
            const state = questionStates[i];
            const isCorrect = state.selectedAnswer === q.correctIndex;
            const hasExplanation = reviewExplanations[i] !== undefined;
            return (
              <div key={i} className={`rounded-xl p-5 border ${isCorrect ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}>
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{i + 1}</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm mb-1">{q.question}</p>
                    <span className="text-xs text-indigo-500">{q.topic}</span>
                  </div>
                  {isCorrect ? <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /> : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
                </div>
                <div className="space-y-1.5 ml-8">
                  {q.options.map((opt, oi) => {
                    const isCorrectOpt = oi === q.correctIndex;
                    const isSelectedOpt = oi === state.selectedAnswer;
                    return (
                      <div
                        key={oi}
                        className={`text-sm px-3 py-2 rounded-lg ${
                          isCorrectOpt
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : isSelectedOpt && !isCorrectOpt
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : 'bg-gray-50 text-gray-500'
                        }`}
                      >
                        {opt}
                        {isCorrectOpt && <span className="ml-2 text-xs opacity-70">(correct)</span>}
                        {isSelectedOpt && !isCorrectOpt && <span className="ml-2 text-xs opacity-70">(your answer)</span>}
                        {state.selectedAnswer === null && isCorrectOpt && <span className="ml-2 text-xs text-amber-600">(unanswered)</span>}
                      </div>
                    );
                  })}
                </div>
                {/* AI Explanation */}
                <div className="ml-8 mt-3">
                  {!hasExplanation && (
                    <button
                      onClick={() => handleGetReviewExplanation(i)}
                      disabled={reviewLoadingIdx === i}
                      className="flex items-center gap-2 px-3 py-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors text-sm disabled:opacity-50"
                    >
                      {reviewLoadingIdx === i ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      {reviewLoadingIdx === i ? 'Getting explanation...' : 'Explain with AI'}
                    </button>
                  )}
                  {hasExplanation && (
                    <div className="mt-2 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                      <p className="text-xs font-medium text-indigo-800 mb-1">AI Explanation</p>
                      <div className="text-gray-700 text-sm whitespace-pre-wrap">
                        {parseExplanation(reviewExplanations[i]).segments.map((seg, si) =>
                          seg.type === 'bold' ? (
                            <strong key={si} className="font-semibold text-gray-900">{seg.value}</strong>
                          ) : seg.type === 'link' ? (
                            <a key={si} href={seg.href} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline hover:text-indigo-800 break-all">{seg.value}</a>
                          ) : (
                            <span key={si}>{seg.value}</span>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    );
  }

  // ── QUIZ IN PROGRESS ──
  const question = questions[currentIndex];
  const state = questionStates[currentIndex];
  if (!question || !state) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 text-gray-900 flex flex-col">
      {/* Top Bar */}
      <header className="bg-white/80 backdrop-blur border-b border-gray-200 px-4 py-3 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {answeredCount}/{questions.length} answered
            {flaggedCount > 0 && (
              <span className="ml-2 text-amber-500 inline-flex items-center gap-1">
                <Flag className="w-3.5 h-3.5" /> {flaggedCount}
              </span>
            )}
          </span>
          {quizSource === 'custom' && (
            <span className="text-xs text-purple-600 font-medium">AI Generated</span>
          )}
          <button
            onClick={() => setShowNavigator(!showNavigator)}
            className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Q {currentIndex + 1}/{questions.length}
          </button>
        </div>
        {/* Progress Bar */}
        <div className="max-w-3xl mx-auto mt-2">
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${(answeredCount / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </header>

      {/* Question Navigator Overlay */}
      <QuestionNavigator
        open={showNavigator}
        totalQuestions={questions.length}
        questionStates={questionStates}
        currentIndex={currentIndex}
        onGoToQuestion={goToQuestion}
        onClose={() => setShowNavigator(false)}
      />

      {/* Submit Confirm Modal */}
      <SubmitConfirmModal
        open={showSubmitConfirm}
        unansweredCount={unansweredCount}
        flaggedCount={flaggedCount}
        onCancel={() => setShowSubmitConfirm(false)}
        onConfirm={handleSubmit}
      />

      {/* Question Content */}
      <div className="flex-1 max-w-2xl w-full mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.15 }}
          >
            {/* Question Header */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2.5 py-1 rounded-full">
                {question.topic}
              </span>
              <button
                onClick={toggleFlag}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  state.flagged
                    ? 'bg-amber-400 text-amber-900'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                <Flag className="w-4 h-4" />
                {state.flagged ? 'Flagged' : 'Flag'}
              </button>
            </div>

            {/* Question */}
            <h2 className="text-xl font-bold mb-6 leading-relaxed">
              <span className="text-indigo-500 mr-2">{currentIndex + 1}.</span>
              {question.question}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {question.options.map((option, index) => {
                const isSelected = state.selectedAnswer === index;
                const letter = String.fromCharCode(65 + index);
                return (
                  <button
                    key={index}
                    onClick={() => selectAnswer(index)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        isSelected ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {letter}
                      </span>
                      <span className="text-sm">{option}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <BottomNavBar
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        onPrev={goPrev}
        onNext={goNext}
        onSubmit={() => setShowSubmitConfirm(true)}
        onSaveAndExit={handleSaveAndExit}
      />
    </main>
  );
}
