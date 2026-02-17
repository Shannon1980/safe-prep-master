'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Check,
  X,
  Sparkles,
  Loader2,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RotateCcw,
  Eye,
  EyeOff,
  Lightbulb,
  Layers,
} from 'lucide-react';
import {
  LESSONS,
  getLessonQuestions,
  getSectionQuestions,
  getSectionQuestionCount,
  type LessonConfig,
  type LessonSection,
  type LessonQuizQuestion,
} from '@/data/lesson-config';
import { explainQuestion } from '@/app/lib/gemini';
import { saveActivity } from '@/app/lib/activity';
import { getFullLessonPool } from '@/app/lib/question-bank';
import {
  saveSession,
  loadSession,
  clearSession,
  formatTimeSince,
  type LessonQuizSession,
} from '@/app/lib/session-storage';

type Phase = 'select' | 'sections' | 'quiz' | 'results';

interface AnswerState {
  selectedAnswer: number | null;
  selectedAnswers: number[];
  answered: boolean;
}

interface SectionResult {
  sectionId: string;
  sectionName: string;
  correct: number;
  total: number;
  percentage: number;
  studyTips: string[];
  questions: {
    question: LessonQuizQuestion;
    answer: AnswerState;
    isCorrect: boolean;
  }[];
}

function isAnswerCorrect(q: LessonQuizQuestion, state: AnswerState): boolean {
  if (q.multiSelect && q.correctIndices) {
    const selected = [...state.selectedAnswers].sort();
    const correct = [...q.correctIndices].sort();
    return (
      selected.length === correct.length &&
      selected.every((v, i) => v === correct[i])
    );
  }
  return state.selectedAnswer === q.correctIndex;
}

export default function LessonQuizPage() {
  const [phase, setPhase] = useState<Phase>('select');
  const [selectedLesson, setSelectedLesson] = useState<LessonConfig | null>(null);
  const [questions, setQuestions] = useState<LessonQuizQuestion[]>([]);
  const [answerStates, setAnswerStates] = useState<AnswerState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [savedSessionData, setSavedSessionData] = useState<LessonQuizSession | null>(null);
  const [selectedSection, setSelectedSection] = useState<LessonSection | null>(null);
  const [isSectionQuiz, setIsSectionQuiz] = useState(false);
  const [lessonPoolCache, setLessonPoolCache] = useState<Record<number, LessonQuizQuestion[]>>({});

  const savedRef = useRef(false);

  // Check for saved session on mount
  useEffect(() => {
    const session = loadSession<LessonQuizSession>('lesson_quiz');
    if (session) setSavedSessionData(session);
  }, []);

  const fetchLessonPool = useCallback(async (lessonId: number): Promise<LessonQuizQuestion[]> => {
    if (lessonPoolCache[lessonId]) return lessonPoolCache[lessonId];
    const pool = await getFullLessonPool(lessonId);
    setLessonPoolCache(prev => ({ ...prev, [lessonId]: pool }));
    return pool;
  }, [lessonPoolCache]);

  const openLessonSections = useCallback((lesson: LessonConfig) => {
    setSelectedLesson(lesson);
    setPhase('sections');
    fetchLessonPool(lesson.id);
  }, [fetchLessonPool]);

  const startFullLesson = useCallback(async (lesson: LessonConfig) => {
    clearSession('lesson_quiz');
    setSavedSessionData(null);
    const pool = await fetchLessonPool(lesson.id);
    const qs = pool.sort(() => Math.random() - 0.5);
    setSelectedLesson(lesson);
    setSelectedSection(null);
    setIsSectionQuiz(false);
    setQuestions(qs);
    setAnswerStates(qs.map(() => ({ selectedAnswer: null, selectedAnswers: [], answered: false })));
    setCurrentIndex(0);
    setShowExplanation(false);
    setExplanation('');
    setShowReview(false);
    savedRef.current = false;
    setPhase('quiz');
  }, [fetchLessonPool]);

  const startSectionQuiz = useCallback(async (lesson: LessonConfig, section: LessonSection) => {
    clearSession('lesson_quiz');
    setSavedSessionData(null);
    const pool = await fetchLessonPool(lesson.id);
    const qs = getSectionQuestions(lesson.id, section.id, pool);
    if (qs.length === 0) return;
    setSelectedLesson(lesson);
    setSelectedSection(section);
    setIsSectionQuiz(true);
    setQuestions(qs);
    setAnswerStates(qs.map(() => ({ selectedAnswer: null, selectedAnswers: [], answered: false })));
    setCurrentIndex(0);
    setShowExplanation(false);
    setExplanation('');
    setShowReview(false);
    savedRef.current = false;
    setPhase('quiz');
  }, [fetchLessonPool]);

  // Keep legacy startLesson for resume functionality
  const startLesson = useCallback((lesson: LessonConfig) => {
    startFullLesson(lesson);
  }, [startFullLesson]);

  const resumeLesson = useCallback(() => {
    if (!savedSessionData) return;
    const lesson = LESSONS.find(l => l.id === savedSessionData.lessonId) || null;
    setSelectedLesson(lesson);
    setQuestions(savedSessionData.questions);
    setAnswerStates(savedSessionData.answerStates);
    setCurrentIndex(savedSessionData.currentIndex);
    setShowExplanation(false);
    setExplanation('');
    setShowReview(false);
    savedRef.current = false;
    setSavedSessionData(null);
    clearSession('lesson_quiz');
    setPhase('quiz');
  }, [savedSessionData]);

  const handleSaveAndExit = useCallback(() => {
    if (!selectedLesson || questions.length === 0) return;
    saveSession<LessonQuizSession>({
      type: 'lesson_quiz',
      lessonId: selectedLesson.id,
      questions,
      answerStates,
      currentIndex,
      savedAt: Date.now(),
    });
    setPhase('select');
    const session = loadSession<LessonQuizSession>('lesson_quiz');
    if (session) setSavedSessionData(session);
  }, [selectedLesson, questions, answerStates, currentIndex]);

  const question = questions[currentIndex];
  const currentState = answerStates[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const score = useMemo(() => {
    if (phase !== 'results') return 0;
    return questions.reduce(
      (acc, q, i) => acc + (isAnswerCorrect(q, answerStates[i]) ? 1 : 0),
      0
    );
  }, [phase, questions, answerStates]);

  const sectionResults = useMemo((): SectionResult[] => {
    if (phase !== 'results' || !selectedLesson) return [];

    const resultMap = new Map<string, SectionResult>();

    for (const section of selectedLesson.sections) {
      resultMap.set(section.id, {
        sectionId: section.id,
        sectionName: section.name,
        correct: 0,
        total: 0,
        percentage: 0,
        studyTips: section.studyTips,
        questions: [],
      });
    }

    questions.forEach((q, i) => {
      let result = resultMap.get(q.section);
      if (!result) {
        const sec = selectedLesson.sections.find((s) => s.id === q.section);
        result = {
          sectionId: q.section,
          sectionName: sec?.name || q.section,
          correct: 0,
          total: 0,
          percentage: 0,
          studyTips: sec?.studyTips || [],
          questions: [],
        };
        resultMap.set(q.section, result);
      }
      const correct = isAnswerCorrect(q, answerStates[i]);
      result.total++;
      if (correct) result.correct++;
      result.questions.push({ question: q, answer: answerStates[i], isCorrect: correct });
    });

    const results = Array.from(resultMap.values()).filter((r) => r.total > 0);
    for (const r of results) {
      r.percentage = Math.round((r.correct / r.total) * 100);
    }
    return results;
  }, [phase, selectedLesson, questions, answerStates]);

  // Save results to Firestore
  useEffect(() => {
    if (phase !== 'results' || savedRef.current || !selectedLesson || questions.length === 0) return;
    savedRef.current = true;
    clearSession('lesson_quiz');

    const percentage = Math.round((score / questions.length) * 100);
    saveActivity({
      type: 'lesson_quiz',
      score,
      total: questions.length,
      percentage,
      lessonId: selectedLesson.id,
      lessonTitle: isSectionQuiz && selectedSection
        ? `${selectedLesson.title} — ${selectedSection.name}`
        : selectedLesson.title,
      sectionBreakdown: sectionResults.map((r) => ({
        section: r.sectionName,
        correct: r.correct,
        total: r.total,
        percentage: r.percentage,
      })),
    });
  }, [phase, score, questions, selectedLesson, sectionResults]);

  const handleSelect = (index: number) => {
    if (currentState.answered) return;
    const q = question;
    setAnswerStates((prev) => {
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

  const handleConfirm = () => {
    setAnswerStates((prev) => {
      const next = [...prev];
      next[currentIndex] = { ...next[currentIndex], answered: true };
      return next;
    });
    setShowExplanation(false);
    setExplanation('');
  };

  const handleNext = () => {
    setShowExplanation(false);
    setExplanation('');
    if (isLastQuestion) {
      setPhase('results');
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleGetExplanation = async () => {
    setLoadingExplanation(true);
    try {
      const result = await explainQuestion(
        question.question,
        question.options,
        question.correctIndex,
        currentState.selectedAnswer
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

  // ── LESSON SELECTION ──
  if (phase === 'select') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 text-gray-900">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold mb-2 text-center">Lesson Quizzes</h1>
            <p className="text-gray-600 text-center mb-10">
              Test your knowledge lesson by lesson. Get detailed feedback on which sections need more study.
            </p>

            {savedSessionData && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-indigo-800">Resume Saved Quiz</h3>
                  <span className="text-xs text-indigo-500">Saved {formatTimeSince(savedSessionData.savedAt)}</span>
                </div>
                <p className="text-sm text-indigo-600 mb-3">
                  Lesson {savedSessionData.lessonId} &bull;{' '}
                  {savedSessionData.answerStates.filter(s => s.answered).length}/{savedSessionData.questions.length} answered &bull;{' '}
                  Question {savedSessionData.currentIndex + 1}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={resumeLesson}
                    className="flex-1 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
                  >
                    Resume Quiz
                  </button>
                  <button
                    onClick={() => { clearSession('lesson_quiz'); setSavedSessionData(null); }}
                    className="px-4 py-2.5 bg-white text-gray-600 font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    Discard
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {LESSONS.map((lesson) => {
                const count = lessonPoolCache[lesson.id]?.length ?? getLessonQuestions(lesson.id).length;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => openLessonSections(lesson)}
                    className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-left hover:border-indigo-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-indigo-600">{lesson.id}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg">{lesson.title}</h3>
                        <p className="text-gray-500 text-sm mt-0.5">{lesson.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span>{count} questions</span>
                          <span>{lesson.sections.length} sections</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  // ── SECTION SELECTION ──
  if (phase === 'sections' && selectedLesson) {
    const totalCount = lessonPoolCache[selectedLesson.id]?.length ?? getLessonQuestions(selectedLesson.id).length;
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 text-gray-900">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <button
              onClick={() => setPhase('select')}
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6 text-sm font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              All Lessons
            </button>

            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-indigo-600">{selectedLesson.id}</span>
              </div>
              <h1 className="text-2xl font-bold">{selectedLesson.title}</h1>
              <p className="text-gray-500 text-sm mt-1">{selectedLesson.description}</p>
            </div>

            {/* Full Lesson Quiz */}
            <button
              onClick={() => startFullLesson(selectedLesson)}
              className="w-full bg-indigo-600 text-white rounded-2xl p-5 text-left hover:bg-indigo-700 transition-all mb-6 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">Full Lesson Quiz</h3>
                  <p className="text-indigo-200 text-sm mt-0.5">
                    All {totalCount} questions across all sections
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-indigo-300 group-hover:text-white transition-colors flex-shrink-0" />
              </div>
            </button>

            {/* Section Quizzes */}
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-bold">Section Quizzes</h2>
              <span className="text-xs text-gray-400">Max 10 questions each</span>
            </div>
            <div className="space-y-3">
              {selectedLesson.sections.map((section) => {
                const sectionTotal = getSectionQuestionCount(selectedLesson.id, section.id, lessonPoolCache[selectedLesson.id]);
                const quizCount = Math.min(sectionTotal, 10);
                return (
                  <button
                    key={section.id}
                    onClick={() => startSectionQuiz(selectedLesson, section)}
                    disabled={sectionTotal === 0}
                    className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-left hover:border-indigo-300 hover:shadow-md transition-all group disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Layers className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold">{section.name}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {quizCount} question{quizCount !== 1 ? 's' : ''}
                          {sectionTotal > 10 && ` (from ${sectionTotal} available)`}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  // ── RESULTS ──
  if (phase === 'results' && selectedLesson) {
    const percentage = Math.round((score / questions.length) * 100);
    const weakSections = sectionResults.filter((r) => r.percentage < 70);
    const strongSections = sectionResults.filter((r) => r.percentage >= 70);

    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 text-gray-900">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <button
            onClick={() => setPhase('sections')}
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Lesson {selectedLesson.id}
          </button>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            {/* Overall Score */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-1">
                {isSectionQuiz && selectedSection
                  ? selectedSection.name
                  : `Lesson ${selectedLesson.id}: ${selectedLesson.shortTitle}`}
              </h1>
              <p className="text-gray-500 mb-6">
                {isSectionQuiz ? 'Section Quiz Complete' : 'Quiz Complete'}
              </p>
              <div className="inline-flex items-center gap-6 bg-white rounded-2xl shadow-sm border border-gray-100 px-8 py-5">
                <div>
                  <p className="text-4xl font-bold text-indigo-600">{percentage}%</p>
                  <p className="text-sm text-gray-500">Overall Score</p>
                </div>
                <div className="w-px h-12 bg-gray-200" />
                <div>
                  <p className="text-4xl font-bold">
                    {score}/{questions.length}
                  </p>
                  <p className="text-sm text-gray-500">Correct</p>
                </div>
              </div>
            </div>

            {/* Section Breakdown */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                Section Breakdown
              </h2>
              <div className="space-y-4">
                {sectionResults.map((r) => {
                  const isWeak = r.percentage < 70;
                  return (
                    <div key={r.sectionId}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium">{r.sectionName}</span>
                        <span className={isWeak ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                          {r.correct}/{r.total} ({r.percentage}%)
                        </span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isWeak ? 'bg-red-400' : 'bg-green-400'}`}
                          style={{ width: `${r.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Areas to Study */}
            {weakSections.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-red-800">
                  <AlertTriangle className="w-5 h-5" />
                  Areas to Focus On
                </h2>
                <div className="space-y-5">
                  {weakSections.map((r) => (
                    <div key={r.sectionId}>
                      <h3 className="font-semibold text-red-800 mb-2">
                        {r.sectionName}{' '}
                        <span className="text-sm font-normal text-red-600">({r.percentage}%)</span>
                      </h3>
                      <ul className="space-y-1.5">
                        {r.studyTips.map((tip, i) => (
                          <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                            <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strong Areas */}
            {strongSections.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
                <h2 className="font-bold text-lg mb-3 flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-5 h-5" />
                  Strong Areas
                </h2>
                <div className="flex flex-wrap gap-2">
                  {strongSections.map((r) => (
                    <span
                      key={r.sectionId}
                      className="px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                    >
                      {r.sectionName} ({r.percentage}%)
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Review Questions Toggle */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <button
                onClick={() => setShowReview(!showReview)}
                className="w-full flex items-center justify-between font-bold text-lg"
              >
                <span className="flex items-center gap-2">
                  {showReview ? <EyeOff className="w-5 h-5 text-indigo-500" /> : <Eye className="w-5 h-5 text-indigo-500" />}
                  Review All Questions
                </span>
                <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${showReview ? 'rotate-90' : ''}`} />
              </button>

              <AnimatePresence>
                {showReview && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-6 space-y-4">
                      {sectionResults.map((section) => (
                        <div key={section.sectionId}>
                          <h3 className="font-semibold text-indigo-700 text-sm mb-3 uppercase tracking-wide">
                            {section.sectionName} — {section.correct}/{section.total}
                          </h3>
                          <div className="space-y-3 mb-6">
                            {section.questions.map(({ question: q, answer, isCorrect: correct }) => {
                              const correctSet = new Set(q.correctIndices ?? [q.correctIndex]);
                              const selectedSet = new Set(answer.selectedAnswers);
                              return (
                                <div
                                  key={q.id}
                                  className={`rounded-xl p-4 border ${correct ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}
                                >
                                  <div className="flex items-start gap-2 mb-2">
                                    {correct ? (
                                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    ) : (
                                      <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                    )}
                                    <p className="text-sm font-medium">{q.question}</p>
                                  </div>
                                  <div className="ml-6 space-y-1">
                                    {q.options.map((opt, oi) => {
                                      const isCorrectOpt = correctSet.has(oi);
                                      const isSelectedOpt = selectedSet.has(oi);
                                      if (!isCorrectOpt && !isSelectedOpt) return null;
                                      return (
                                        <div
                                          key={oi}
                                          className={`text-xs px-2.5 py-1.5 rounded-md ${
                                            isCorrectOpt
                                              ? 'bg-green-100 text-green-800'
                                              : 'bg-red-100 text-red-800'
                                          }`}
                                        >
                                          {opt}
                                          {isCorrectOpt && <span className="ml-1 opacity-70">(correct)</span>}
                                          {isSelectedOpt && !isCorrectOpt && (
                                            <span className="ml-1 opacity-70">(your answer)</span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() =>
                  isSectionQuiz && selectedSection
                    ? startSectionQuiz(selectedLesson, selectedSection)
                    : startFullLesson(selectedLesson)
                }
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                {isSectionQuiz ? 'Retake Section' : `Retake Lesson ${selectedLesson.id}`}
              </button>
              <button
                onClick={() => setPhase('sections')}
                className="flex-1 py-3 bg-white text-gray-700 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <Layers className="w-5 h-5" />
                {isSectionQuiz ? 'Other Sections' : 'Section Quizzes'}
              </button>
              <button
                onClick={() => setPhase('select')}
                className="flex-1 py-3 bg-white text-gray-700 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <BookOpen className="w-5 h-5" />
                Other Lessons
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  // ── QUIZ IN PROGRESS ──
  if (!question || !currentState) return null;

  const answered = currentState.answered;
  const isCorrect = answered ? isAnswerCorrect(question, currentState) : false;
  const answeredCount = answerStates.filter((s) => s.answered).length;
  const hasSelection = question.multiSelect
    ? currentState.selectedAnswers.length === question.multiSelect
    : currentState.selectedAnswer !== null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 text-gray-900">
      <div className="p-4 flex justify-between items-center max-w-3xl mx-auto">
        <button
          onClick={handleSaveAndExit}
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Save &amp; Exit
        </button>
        <span className="text-sm font-medium text-gray-500">
          {currentIndex + 1} of {questions.length} &bull; Score:{' '}
          {(() => {
            const correct = answerStates.reduce((acc, s, i) => acc + (s.answered && isAnswerCorrect(questions[i], s) ? 1 : 0), 0);
            const pct = answeredCount > 0 ? Math.round((correct / answeredCount) * 100) : 0;
            return `${correct}/${answeredCount} (${pct}%)`;
          })()}
        </span>
      </div>

      {/* Progress bar */}
      <div className="max-w-3xl mx-auto px-6 mb-4">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-xs font-medium text-indigo-600">
            {isSectionQuiz && selectedSection
              ? `Lesson ${selectedLesson?.id} — ${selectedSection.name}`
              : `Lesson ${selectedLesson?.id}: ${selectedLesson?.shortTitle}`}
          </span>
          <span className="text-xs text-gray-400">
            {Math.round(((currentIndex + 1) / questions.length) * 100)}%
          </span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
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
            {/* Section badge */}
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2.5 py-1 rounded-full">
                {selectedLesson?.sections.find((s) => s.id === question.section)?.name || question.section}
              </span>
              {question.multiSelect && (
                <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2.5 py-1 rounded-full">
                  Select {question.multiSelect}
                </span>
              )}
            </div>

            {/* Question */}
            <h2 className="text-xl font-bold mb-6 leading-relaxed">{question.question}</h2>

            {/* Multi-select counter */}
            {question.multiSelect && !answered && (
              <p className="text-sm text-indigo-500 mb-4">
                {currentState.selectedAnswers.length}/{question.multiSelect} selected
              </p>
            )}

            {/* Options */}
            <div className="space-y-3">
              {question.options.map((option, oi) => {
                const isSelected = question.multiSelect
                  ? currentState.selectedAnswers.includes(oi)
                  : currentState.selectedAnswer === oi;
                const correctSet = new Set(question.correctIndices ?? [question.correctIndex]);
                const isCorrectOpt = correctSet.has(oi);
                const showCorrectHighlight = answered && isCorrectOpt;
                const showWrongHighlight = answered && isSelected && !isCorrectOpt;
                const isMaxed =
                  !answered &&
                  question.multiSelect
                    ? currentState.selectedAnswers.length >= question.multiSelect && !isSelected
                    : false;

                return (
                  <button
                    key={oi}
                    onClick={() => handleSelect(oi)}
                    disabled={answered || isMaxed}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      showCorrectHighlight
                        ? 'border-green-500 bg-green-50'
                        : showWrongHighlight
                          ? 'border-red-500 bg-red-50'
                          : isSelected && !answered
                            ? 'border-indigo-500 bg-indigo-50'
                            : isMaxed
                              ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                              : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50'
                    } ${answered ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <span className="flex items-center gap-3">
                      {showCorrectHighlight && <Check className="w-5 h-5 text-green-600 flex-shrink-0" />}
                      {showWrongHighlight && <X className="w-5 h-5 text-red-600 flex-shrink-0" />}
                      {question.multiSelect && !answered && (
                        <span
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center text-xs flex-shrink-0 ${
                            isSelected ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-gray-300'
                          }`}
                        >
                          {isSelected ? '✓' : ''}
                        </span>
                      )}
                      <span className="text-sm">{option}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Confirm / Feedback / Next */}
            {!answered && hasSelection && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                <button
                  onClick={handleConfirm}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Confirm Answer
                </button>
              </motion.div>
            )}

            {answered && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                <div
                  className={`p-3 rounded-xl text-sm font-medium mb-4 ${
                    isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {isCorrect ? 'Correct!' : 'Incorrect — see the correct answer highlighted in green above.'}
                </div>

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
                    <p className="text-gray-700 text-sm">{explanation}</p>
                  </motion.div>
                )}

                <button
                  onClick={handleNext}
                  className="mt-4 w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
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
