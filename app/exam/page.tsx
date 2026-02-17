'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Flag,
  CheckCircle,
  XCircle,
  SkipForward,
  BarChart3,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Trophy,
  Target,
} from 'lucide-react';
import {
  selectExamQuestions,
  EXAM_CONFIG,
  type ExamQuestion,
  type ExamDomain,
} from '@/data/exam-questions';

type ExamPhase = 'intro' | 'exam' | 'review' | 'results';

interface QuestionState {
  selectedAnswer: number | null;
  selectedAnswers: number[];
  flagged: boolean;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function ExamPage() {
  const [phase, setPhase] = useState<ExamPhase>('intro');
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [questionStates, setQuestionStates] = useState<QuestionState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(EXAM_CONFIG.timeLimitMinutes * 60);
  const [showNavigator, setShowNavigator] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startExam = useCallback(() => {
    const selected = selectExamQuestions(EXAM_CONFIG.totalQuestions);
    setQuestions(selected);
    setQuestionStates(selected.map(() => ({ selectedAnswer: null, selectedAnswers: [], flagged: false })));
    setCurrentIndex(0);
    setTimeRemaining(EXAM_CONFIG.timeLimitMinutes * 60);
    setPhase('exam');
  }, []);

  // Timer
  useEffect(() => {
    if (phase !== 'exam') return;
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setPhase('results');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  const selectAnswer = (index: number) => {
    const q = questions[currentIndex];
    setQuestionStates((prev) => {
      const next = [...prev];
      if (q.multiSelect) {
        const current = [...next[currentIndex].selectedAnswers];
        const pos = current.indexOf(index);
        if (pos !== -1) {
          current.splice(pos, 1);
        } else if (current.length < q.multiSelect) {
          current.push(index);
        }
        next[currentIndex] = { ...next[currentIndex], selectedAnswers: current, selectedAnswer: current[0] ?? null };
      } else {
        next[currentIndex] = { ...next[currentIndex], selectedAnswer: index, selectedAnswers: [index] };
      }
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

  const handleSubmit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('results');
    setShowSubmitConfirm(false);
  };

  const answeredCount = questionStates.filter((s) => s.selectedAnswers.length > 0).length;
  const flaggedCount = questionStates.filter((s) => s.flagged).length;
  const unansweredCount = questions.length - answeredCount;
  const timeWarning = timeRemaining < 300;

  const isQuestionCorrect = (q: ExamQuestion, state: QuestionState): boolean => {
    if (q.multiSelect && q.correctIndices) {
      const selected = [...state.selectedAnswers].sort();
      const correct = [...q.correctIndices].sort();
      return selected.length === correct.length && selected.every((v, i) => v === correct[i]);
    }
    return state.selectedAnswer === q.correctIndex;
  };

  // ── INTRO SCREEN ──
  if (phase === 'intro') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950 text-white">
        <header className="p-6 max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-indigo-300 hover:text-indigo-200">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </header>
        <div className="max-w-2xl mx-auto px-6 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Target className="w-10 h-10" />
              </div>
              <h1 className="text-4xl font-bold mb-3">SAFe Scrum Master 6.0</h1>
              <h2 className="text-xl text-indigo-300">Certification Exam Simulation</h2>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 mb-8 space-y-4">
              <h3 className="font-bold text-lg mb-4">Exam Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-indigo-300 text-sm">Questions</p>
                  <p className="text-2xl font-bold">{EXAM_CONFIG.totalQuestions}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-indigo-300 text-sm">Time Limit</p>
                  <p className="text-2xl font-bold">{EXAM_CONFIG.timeLimitMinutes} min</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-indigo-300 text-sm">Passing Score</p>
                  <p className="text-2xl font-bold">{EXAM_CONFIG.passingPercentage}%</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-indigo-300 text-sm">Format</p>
                  <p className="text-2xl font-bold">Single &amp; Multi</p>
                  <p className="text-xs text-indigo-300 mt-1">Some questions require multiple answers</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 mb-8">
              <h3 className="font-bold text-lg mb-3">Exam Domains</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span>Introducing Scrum in SAFe</span><span className="text-indigo-300">22–28%</span></div>
                <div className="flex justify-between"><span>Defining the SM/TC Role</span><span className="text-indigo-300">26–30%</span></div>
                <div className="flex justify-between"><span>Supporting Team Events</span><span className="text-indigo-300">17–21%</span></div>
                <div className="flex justify-between"><span>Supporting ART Events</span><span className="text-indigo-300">25–29%</span></div>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-8 text-sm text-amber-200">
              <p className="font-semibold mb-1">Simulation Rules</p>
              <ul className="space-y-1 text-amber-200/80">
                <li>- The timer starts immediately when you begin</li>
                <li>- You can skip and return to questions</li>
                <li>- Flag questions to review later</li>
                <li>- The exam auto-submits when time runs out</li>
              </ul>
            </div>

            <button
              onClick={startExam}
              className="w-full py-4 bg-indigo-600 text-white text-lg font-bold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Start Exam
            </button>
          </motion.div>
        </div>
      </main>
    );
  }

  // ── RESULTS SCREEN ──
  if (phase === 'results') {
    const score = questions.reduce((acc, q, i) => {
      return acc + (isQuestionCorrect(q, questionStates[i]) ? 1 : 0);
    }, 0);
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= EXAM_CONFIG.passingPercentage;
    const timeTaken = EXAM_CONFIG.timeLimitMinutes * 60 - timeRemaining;

    // Domain breakdown
    const domainResults = new Map<ExamDomain, { correct: number; total: number }>();
    questions.forEach((q, i) => {
      const result = domainResults.get(q.domain) || { correct: 0, total: 0 };
      result.total++;
      if (isQuestionCorrect(q, questionStates[i])) result.correct++;
      domainResults.set(q.domain, result);
    });

    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950 text-white">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            {/* Score Header */}
            <div className="text-center mb-10">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${passed ? 'bg-green-600' : 'bg-red-600'}`}>
                {passed ? <Trophy className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
              </div>
              <h1 className="text-4xl font-bold mb-2">{passed ? 'Congratulations!' : 'Keep Studying'}</h1>
              <p className="text-xl text-indigo-300">
                {passed ? 'You passed the exam simulation!' : `You need ${EXAM_CONFIG.passingPercentage}% to pass. Keep going!`}
              </p>
            </div>

            {/* Score Summary */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold">{percentage}%</p>
                <p className="text-sm text-indigo-300">Score</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold">{score}/{questions.length}</p>
                <p className="text-sm text-indigo-300">Correct</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold">{formatTime(timeTaken)}</p>
                <p className="text-sm text-indigo-300">Time Used</p>
              </div>
            </div>

            {/* Pass/Fail Bar */}
            <div className="bg-white/10 rounded-xl p-4 mb-8">
              <div className="flex justify-between text-sm mb-2">
                <span>Your Score: {percentage}%</span>
                <span>Passing: {EXAM_CONFIG.passingPercentage}%</span>
              </div>
              <div className="h-4 bg-white/10 rounded-full overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all ${passed ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${percentage}%` }}
                />
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-yellow-400"
                  style={{ left: `${EXAM_CONFIG.passingPercentage}%` }}
                />
              </div>
            </div>

            {/* Domain Breakdown */}
            <div className="bg-white/10 rounded-xl p-6 mb-8">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Domain Breakdown
              </h3>
              <div className="space-y-4">
                {Array.from(domainResults.entries()).map(([domain, result]) => {
                  const pct = Math.round((result.correct / result.total) * 100);
                  const domainPassed = pct >= EXAM_CONFIG.passingPercentage;
                  return (
                    <div key={domain}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{domain}</span>
                        <span className={domainPassed ? 'text-green-400' : 'text-red-400'}>
                          {result.correct}/{result.total} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${domainPassed ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() => setPhase('review')}
                className="flex-1 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Review Answers
              </button>
              <button
                onClick={startExam}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Retake Exam
              </button>
              <Link
                href="/"
                className="flex-1 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Home
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  // ── REVIEW SCREEN ──
  if (phase === 'review') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950 text-white">
        <header className="p-4 border-b border-white/10 bg-white/5 backdrop-blur sticky top-0 z-10">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button onClick={() => setPhase('results')} className="inline-flex items-center gap-2 text-indigo-300 hover:text-indigo-200">
              <ArrowLeft className="w-5 h-5" /> Back to Results
            </button>
            <h1 className="font-bold">Answer Review</h1>
            <div />
          </div>
        </header>
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
          {questions.map((q, i) => {
            const qState = questionStates[i];
            const isCorrect = isQuestionCorrect(q, qState);
            const wasAnswered = qState.selectedAnswers.length > 0;
            const correctSet = new Set(q.correctIndices ?? [q.correctIndex]);
            const selectedSet = new Set(qState.selectedAnswers);
            return (
              <div key={q.id} className={`bg-white/5 rounded-xl p-5 border ${isCorrect ? 'border-green-500/30' : 'border-red-500/30'}`}>
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-xs font-mono bg-white/10 px-2 py-1 rounded">{i + 1}</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm mb-1">{q.question}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-indigo-400">{q.domain}</span>
                      {q.multiSelect && <span className="text-xs bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded">Select {q.multiSelect}</span>}
                    </div>
                  </div>
                  {isCorrect ? <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" /> : <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />}
                </div>
                <div className="space-y-1.5 ml-8">
                  {q.options.map((opt, oi) => {
                    const isCorrectOpt = correctSet.has(oi);
                    const isSelectedOpt = selectedSet.has(oi);
                    return (
                      <div
                        key={oi}
                        className={`text-sm px-3 py-2 rounded-lg ${
                          isCorrectOpt
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : isSelectedOpt && !isCorrectOpt
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : 'bg-white/5 text-white/60'
                        }`}
                      >
                        {opt}
                        {isCorrectOpt && <span className="ml-2 text-xs">(correct)</span>}
                        {isSelectedOpt && !isCorrectOpt && <span className="ml-2 text-xs">(your answer)</span>}
                        {!wasAnswered && isCorrectOpt && <span className="ml-2 text-xs text-yellow-400">(unanswered)</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    );
  }

  // ── EXAM IN PROGRESS ──
  const question = questions[currentIndex];
  const state = questionStates[currentIndex];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950 text-white flex flex-col">
      {/* Top Bar */}
      <header className="bg-white/5 backdrop-blur border-b border-white/10 px-4 py-3 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Timer */}
          <div className={`flex items-center gap-2 font-mono text-lg ${timeWarning ? 'text-red-400 animate-pulse' : 'text-white'}`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeRemaining)}
          </div>

          {/* Progress */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-indigo-300">
              {answeredCount}/{questions.length} answered
            </span>
            {flaggedCount > 0 && (
              <span className="text-sm text-amber-400 flex items-center gap-1">
                <Flag className="w-3.5 h-3.5" /> {flaggedCount}
              </span>
            )}
          </div>

          {/* Nav Toggle */}
          <button
            onClick={() => setShowNavigator(!showNavigator)}
            className="px-3 py-1.5 bg-white/10 rounded-lg text-sm hover:bg-white/20 transition-colors"
          >
            Q {currentIndex + 1}/{questions.length}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mt-2">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${(answeredCount / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </header>

      {/* Question Navigator Overlay */}
      <AnimatePresence>
        {showNavigator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 flex items-center justify-center p-4"
            onClick={() => setShowNavigator(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-800 rounded-2xl p-6 max-w-lg w-full max-h-[70vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-bold mb-4">Question Navigator</h3>
              <div className="flex gap-2 mb-4 text-xs">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-indigo-500" /> Answered</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-white/20" /> Unanswered</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500" /> Flagged</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded ring-2 ring-indigo-400 bg-transparent" /> Current</span>
              </div>
              <div className="grid grid-cols-9 gap-2">
                {questions.map((_, i) => {
                  const qs = questionStates[i];
                  const isCurrent = i === currentIndex;
                  const isAnswered = qs.selectedAnswers.length > 0;
                  const isFlagged = qs.flagged;
                  return (
                    <button
                      key={i}
                      onClick={() => goToQuestion(i)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        isCurrent
                          ? 'ring-2 ring-indigo-400 bg-indigo-600'
                          : isFlagged
                            ? 'bg-amber-500 text-black'
                            : isAnswered
                              ? 'bg-indigo-500'
                              : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 text-sm text-indigo-300">
                {unansweredCount > 0 && (
                  <p>{unansweredCount} question{unansweredCount > 1 ? 's' : ''} unanswered</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Confirmation */}
      <AnimatePresence>
        {showSubmitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 flex items-center justify-center p-4"
            onClick={() => setShowSubmitConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-slate-800 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-bold text-lg mb-3">Submit Exam?</h3>
              {unansweredCount > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4 text-sm text-amber-200 flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>You have {unansweredCount} unanswered question{unansweredCount > 1 ? 's' : ''}. Unanswered questions are marked incorrect.</span>
                </div>
              )}
              {flaggedCount > 0 && (
                <p className="text-sm text-indigo-300 mb-4">
                  You have {flaggedCount} flagged question{flaggedCount > 1 ? 's' : ''} to review.
                </p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubmitConfirm(false)}
                  className="flex-1 py-2.5 bg-white/10 rounded-xl font-medium hover:bg-white/20 transition-colors"
                >
                  Continue Exam
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-2.5 bg-indigo-600 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                >
                  Submit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question Content */}
      <div className="flex-1 max-w-3xl w-full mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.15 }}
          >
            {/* Question Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs text-indigo-400 bg-indigo-500/20 px-2.5 py-1 rounded-full">
                  {question.domain}
                </span>
              </div>
              <button
                onClick={toggleFlag}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  state.flagged
                    ? 'bg-amber-500 text-black'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                <Flag className="w-4 h-4" />
                {state.flagged ? 'Flagged' : 'Flag'}
              </button>
            </div>

            {/* Question */}
            <h2 className="text-xl font-bold mb-4 leading-relaxed">
              <span className="text-indigo-400 mr-2">{currentIndex + 1}.</span>
              {question.question}
            </h2>

            {question.multiSelect && (
              <p className="text-sm text-indigo-300 mb-6 bg-indigo-500/10 px-3 py-2 rounded-lg inline-block">
                Select {question.multiSelect} answer{question.multiSelect > 1 ? 's' : ''} — {state.selectedAnswers.length}/{question.multiSelect} selected
              </p>
            )}

            {/* Options */}
            <div className="space-y-3">
              {question.options.map((option, oi) => {
                const isSelected = question.multiSelect ? state.selectedAnswers.includes(oi) : state.selectedAnswer === oi;
                const letter = String.fromCharCode(65 + oi);
                const isMaxed = question.multiSelect ? state.selectedAnswers.length >= question.multiSelect && !isSelected : false;
                return (
                  <button
                    key={oi}
                    onClick={() => selectAnswer(oi)}
                    disabled={isMaxed}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/20'
                        : isMaxed
                          ? 'border-white/5 bg-white/[0.02] opacity-50 cursor-not-allowed'
                          : 'border-white/10 bg-white/5 hover:border-indigo-500/50 hover:bg-white/10'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      {question.multiSelect ? (
                        <span className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold flex-shrink-0 border-2 ${
                          isSelected ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-transparent border-white/30 text-white/60'
                        }`}>
                          {isSelected ? '✓' : letter}
                        </span>
                      ) : (
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                          isSelected ? 'bg-indigo-500 text-white' : 'bg-white/10 text-white/60'
                        }`}>
                          {letter}
                        </span>
                      )}
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
      <div className="border-t border-white/10 bg-white/5 backdrop-blur px-4 py-4 sticky bottom-0">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 rounded-xl font-medium hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          <div className="flex gap-2">
            {state.selectedAnswers.length === 0 && currentIndex < questions.length - 1 && (
              <button
                onClick={goNext}
                className="flex items-center gap-1.5 px-3 py-2.5 text-amber-400 hover:bg-white/10 rounded-xl text-sm transition-colors"
              >
                <SkipForward className="w-4 h-4" />
                Skip
              </button>
            )}
            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
            >
              Submit Exam
            </button>
          </div>

          <button
            onClick={goNext}
            disabled={currentIndex === questions.length - 1}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </main>
  );
}
