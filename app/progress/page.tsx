'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Target,
  GraduationCap,
  Zap,
  Trophy,
  XCircle,
  Clock,
  BarChart3,
  TrendingUp,
  Loader2,
  LogIn,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertTriangle,
  Play,
} from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { getMyActivity, type ActivityRecord } from '@/app/lib/activity';
import {
  loadSession,
  formatTimeSince,
  type ExamSession,
  type LessonQuizSession,
  type PracticeQuizSession,
} from '@/app/lib/session-storage';
import { LESSONS } from '@/data/lesson-config';

// ── Helpers ──

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d);
}

function formatDateShort(d: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(d);
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function formatTimeMinSec(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function timeAgo(d: Date): string {
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDateShort(d);
}

// ── Component ──

interface SavedSessions {
  exam: ExamSession | null;
  lessonQuiz: LessonQuizSession | null;
  practiceQuiz: PracticeQuizSession | null;
}

export default function ProgressPage() {
  const { user, loading: authLoading, isConfigured, login } = useAuth();
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savedSessions, setSavedSessions] = useState<SavedSessions>({
    exam: null,
    lessonQuiz: null,
    practiceQuiz: null,
  });

  useEffect(() => {
    // Load saved in-progress sessions from localStorage
    setSavedSessions({
      exam: loadSession<ExamSession>('exam'),
      lessonQuiz: loadSession<LessonQuizSession>('lesson_quiz'),
      practiceQuiz: loadSession<PracticeQuizSession>('practice_quiz'),
    });

    if (!user) {
      setLoading(false);
      return;
    }
    getMyActivity(300).then((data) => {
      setActivities(data);
      setLoading(false);
    });
  }, [user]);

  const hasAnySavedSession =
    savedSessions.exam || savedSessions.lessonQuiz || savedSessions.practiceQuiz;

  const exams = useMemo(() => activities.filter((a) => a.type === 'exam'), [activities]);
  const lessonQuizzes = useMemo(() => activities.filter((a) => a.type === 'lesson_quiz'), [activities]);
  const practiceQuizzes = useMemo(() => activities.filter((a) => a.type === 'practice_quiz'), [activities]);

  const bestExamScore = useMemo(() => {
    if (exams.length === 0) return 0;
    return Math.max(...exams.map((e) => e.percentage));
  }, [exams]);

  const avgExamScore = useMemo(() => {
    if (exams.length === 0) return 0;
    return Math.round(exams.reduce((s, e) => s + e.percentage, 0) / exams.length);
  }, [exams]);

  const examPassRate = useMemo(() => {
    if (exams.length === 0) return 0;
    return Math.round((exams.filter((e) => e.passed).length / exams.length) * 100);
  }, [exams]);

  const avgLessonScore = useMemo(() => {
    if (lessonQuizzes.length === 0) return 0;
    return Math.round(lessonQuizzes.reduce((s, q) => s + q.percentage, 0) / lessonQuizzes.length);
  }, [lessonQuizzes]);

  // Streak: consecutive days with activity
  const streak = useMemo(() => {
    if (activities.length === 0) return 0;
    const days = new Set(
      activities.map((a) => {
        const d = a.createdAt instanceof Date ? a.createdAt : new Date();
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      })
    );
    let count = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (days.has(key)) {
        count++;
      } else if (i > 0) {
        break;
      }
    }
    return count;
  }, [activities]);

  // Lesson progress map
  const lessonProgress = useMemo(() => {
    const map = new Map<number, { title: string; attempts: number; best: number; avg: number }>();
    for (const q of lessonQuizzes) {
      if (q.lessonId == null) continue;
      const existing = map.get(q.lessonId);
      if (!existing) {
        map.set(q.lessonId, {
          title: q.lessonTitle || `Lesson ${q.lessonId}`,
          attempts: 1,
          best: q.percentage,
          avg: q.percentage,
        });
      } else {
        existing.attempts++;
        existing.best = Math.max(existing.best, q.percentage);
        existing.avg = Math.round(
          (existing.avg * (existing.attempts - 1) + q.percentage) / existing.attempts
        );
      }
    }
    return Array.from(map.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => a.id - b.id);
  }, [lessonQuizzes]);

  // ── Guards ──

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-indigo-50">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-700 mb-2">Track Your Progress</h1>
          <p className="text-gray-500 mb-6">
            Sign in to save your exam and quiz results and track your improvement over time.
          </p>
          {isConfigured && (
            <button
              onClick={login}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              <LogIn className="w-5 h-5" />
              Sign in with Google
            </button>
          )}
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading your progress...</p>
        </div>
      </main>
    );
  }

  // ── Render ──

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 text-gray-900">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Progress</h1>
          <p className="text-gray-500 mt-1">
            Track your exam simulations, quizzes, and study journey.
          </p>
        </div>

        {activities.length === 0 && !hasAnySavedSession ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center"
          >
            <TrendingUp className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-700 mb-2">No activity yet</h2>
            <p className="text-gray-500 mb-6">
              Complete an exam simulation or quiz to start tracking your progress.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link
                href="/exam"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
              >
                <Target className="w-4 h-4" />
                Start Exam Sim
              </Link>
              <Link
                href="/quiz/lesson"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <GraduationCap className="w-4 h-4" />
                Lesson Quizzes
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {/* ── In Progress ── */}
            {hasAnySavedSession && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Play className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-bold">In Progress</h2>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                    {[savedSessions.exam, savedSessions.lessonQuiz, savedSessions.practiceQuiz].filter(Boolean).length}
                  </span>
                </div>
                <div className="space-y-3">
                  {savedSessions.exam && (
                    <InProgressCard
                      title="Exam Simulation"
                      icon={Target}
                      color="purple"
                      href="/exam"
                      savedAt={savedSessions.exam.savedAt}
                      details={[
                        `${savedSessions.exam.questionStates.filter(s => s.selectedAnswers.length > 0).length}/${savedSessions.exam.questions.length} answered`,
                        `${formatTimeMinSec(savedSessions.exam.timeRemaining)} remaining`,
                        `On question ${savedSessions.exam.currentIndex + 1}`,
                      ]}
                    />
                  )}
                  {savedSessions.lessonQuiz && (() => {
                    const lesson = LESSONS.find(l => l.id === savedSessions.lessonQuiz!.lessonId);
                    return (
                      <InProgressCard
                        title={`Lesson ${savedSessions.lessonQuiz.lessonId}: ${lesson?.shortTitle || 'Quiz'}`}
                        icon={GraduationCap}
                        color="emerald"
                        href="/quiz/lesson"
                        savedAt={savedSessions.lessonQuiz.savedAt}
                        details={[
                          `${savedSessions.lessonQuiz.answerStates.filter(s => s.answered).length}/${savedSessions.lessonQuiz.questions.length} answered`,
                          `On question ${savedSessions.lessonQuiz.currentIndex + 1}`,
                        ]}
                      />
                    );
                  })()}
                  {savedSessions.practiceQuiz && (
                    <InProgressCard
                      title={`${savedSessions.practiceQuiz.mode === 'custom' ? 'AI-Generated' : 'Built-in'} Practice Quiz`}
                      icon={Zap}
                      color="blue"
                      href="/quiz"
                      savedAt={savedSessions.practiceQuiz.savedAt}
                      details={[
                        `Question ${savedSessions.practiceQuiz.currentIndex + 1}/${savedSessions.practiceQuiz.questions.length}`,
                        `Score: ${savedSessions.practiceQuiz.score}`,
                      ]}
                    />
                  )}
                </div>
              </div>
            )}

            {/* ── Overview Stats ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard
                label="Exam Attempts"
                value={exams.length}
                sub={exams.length > 0 ? `${examPassRate}% pass rate` : undefined}
                icon={Target}
                color="purple"
              />
              <StatCard
                label="Best Exam"
                value={exams.length > 0 ? `${bestExamScore}%` : '–'}
                sub={exams.length > 0 ? `Avg ${avgExamScore}%` : undefined}
                icon={Trophy}
                color="green"
              />
              <StatCard
                label="Lesson Quizzes"
                value={lessonQuizzes.length}
                sub={lessonQuizzes.length > 0 ? `Avg ${avgLessonScore}%` : undefined}
                icon={GraduationCap}
                color="emerald"
              />
              <StatCard
                label="Study Streak"
                value={`${streak} day${streak !== 1 ? 's' : ''}`}
                sub={`${activities.length} total activities`}
                icon={TrendingUp}
                color="indigo"
              />
            </div>

            {/* ── Exam History ── */}
            {exams.length > 0 && (
              <Section title="Exam Simulations" icon={Target} count={exams.length}>
                <div className="space-y-3">
                  {exams.map((exam) => {
                    const date = exam.createdAt instanceof Date ? exam.createdAt : new Date();
                    const expanded = expandedId === exam.id;
                    return (
                      <div
                        key={exam.id}
                        className="bg-white rounded-xl border border-gray-100 overflow-hidden"
                      >
                        <button
                          onClick={() => setExpandedId(expanded ? null : (exam.id ?? null))}
                          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                exam.passed ? 'bg-green-100' : 'bg-red-50'
                              }`}
                            >
                              {exam.passed ? (
                                <Trophy className="w-5 h-5 text-green-600" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-sm">
                                {exam.passed ? 'Passed' : 'Not Passed'} —{' '}
                                <span
                                  className={
                                    exam.passed ? 'text-green-600' : 'text-red-500'
                                  }
                                >
                                  {exam.percentage}%
                                </span>
                              </p>
                              <p className="text-xs text-gray-400">
                                {exam.score}/{exam.total} correct
                                {exam.timeTakenSeconds
                                  ? ` · ${formatDuration(exam.timeTakenSeconds)}`
                                  : ''}
                                {' · '}
                                {timeAgo(date)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 hidden sm:inline">
                              {formatDate(date)}
                            </span>
                            {expanded ? (
                              <ChevronUp className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </button>

                        {expanded && exam.domainBreakdown && (
                          <div className="border-t border-gray-100 bg-gray-50 px-4 py-4">
                            <p className="text-xs font-semibold text-gray-500 mb-3">
                              Domain Breakdown
                            </p>
                            <div className="space-y-2.5">
                              {Object.entries(exam.domainBreakdown).map(
                                ([domain, { correct, total }]) => {
                                  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
                                  return (
                                    <div key={domain}>
                                      <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-700">{domain}</span>
                                        <span className="font-medium">
                                          {pct}%{' '}
                                          <span className="text-gray-400">
                                            ({correct}/{total})
                                          </span>
                                        </span>
                                      </div>
                                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                          className={`h-full rounded-full ${
                                            pct >= 73
                                              ? 'bg-green-500'
                                              : pct >= 50
                                                ? 'bg-yellow-500'
                                                : 'bg-red-500'
                                          }`}
                                          style={{ width: `${pct}%` }}
                                        />
                                      </div>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Section>
            )}

            {/* ── Lesson Quiz Progress ── */}
            {lessonProgress.length > 0 && (
              <Section
                title="Lesson Quiz Progress"
                icon={GraduationCap}
                count={lessonQuizzes.length}
              >
                <div className="space-y-3">
                  {lessonProgress.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="bg-white rounded-xl border border-gray-100 p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold text-sm">
                            Lesson {lesson.id}: {lesson.title}
                          </p>
                          <p className="text-xs text-gray-400">
                            {lesson.attempts} attempt{lesson.attempts !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-indigo-600">{lesson.best}% best</p>
                          <p className="text-xs text-gray-400">{lesson.avg}% avg</p>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            lesson.best >= 73
                              ? 'bg-green-500'
                              : lesson.best >= 50
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                          }`}
                          style={{ width: `${lesson.best}%` }}
                        />
                      </div>
                    </div>
                  ))}

                  {/* Recent lesson quiz attempts */}
                  <p className="text-xs font-semibold text-gray-500 mt-4 mb-2">Recent Attempts</p>
                  {lessonQuizzes.slice(0, 8).map((q) => {
                    const date = q.createdAt instanceof Date ? q.createdAt : new Date();
                    return (
                      <div
                        key={q.id}
                        className="bg-white rounded-lg border border-gray-100 px-4 py-3 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              q.percentage >= 70 ? 'bg-green-50' : 'bg-amber-50'
                            }`}
                          >
                            {q.percentage >= 70 ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {q.lessonTitle || `Lesson ${q.lessonId}`}
                            </p>
                            <p className="text-xs text-gray-400">
                              {q.score}/{q.total} · {timeAgo(date)}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-sm font-bold ${
                            q.percentage >= 70 ? 'text-green-600' : 'text-amber-600'
                          }`}
                        >
                          {q.percentage}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Section>
            )}

            {/* ── Practice Quiz History ── */}
            {practiceQuizzes.length > 0 && (
              <Section title="Practice Quizzes" icon={Zap} count={practiceQuizzes.length}>
                <div className="space-y-2">
                  {practiceQuizzes.slice(0, 10).map((q) => {
                    const date = q.createdAt instanceof Date ? q.createdAt : new Date();
                    return (
                      <div
                        key={q.id}
                        className="bg-white rounded-lg border border-gray-100 px-4 py-3 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Zap className="w-4 h-4 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {q.quizMode === 'custom' ? 'AI-Generated' : 'Built-in'} Quiz
                            </p>
                            <p className="text-xs text-gray-400">
                              {q.score}/{q.total} · {timeAgo(date)}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-sm font-bold ${
                            q.percentage >= 70 ? 'text-green-600' : 'text-amber-600'
                          }`}
                        >
                          {q.percentage}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Section>
            )}

            {/* ── Full Timeline ── */}
            <Section title="All Activity" icon={Clock} count={activities.length}>
              <div className="space-y-2">
                {activities.slice(0, 20).map((a) => {
                  const date = a.createdAt instanceof Date ? a.createdAt : new Date();
                  const typeConfig = {
                    exam: { label: 'Exam Sim', color: 'bg-purple-100 text-purple-700', icon: Target },
                    lesson_quiz: { label: 'Lesson Quiz', color: 'bg-emerald-100 text-emerald-700', icon: GraduationCap },
                    practice_quiz: { label: 'Practice Quiz', color: 'bg-blue-100 text-blue-700', icon: Zap },
                    flashcard_session: { label: 'Flashcards', color: 'bg-yellow-100 text-yellow-700', icon: BarChart3 },
                  }[a.type];
                  return (
                    <div
                      key={a.id}
                      className="bg-white rounded-lg border border-gray-100 px-4 py-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeConfig.color}`}
                        >
                          {typeConfig.label}
                        </span>
                        <span className="text-sm text-gray-700">
                          {a.score}/{a.total}
                          {a.lessonTitle ? ` · ${a.lessonTitle}` : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-sm font-bold ${
                            a.percentage >= 70 ? 'text-green-600' : 'text-amber-600'
                          }`}
                        >
                          {a.percentage}%
                        </span>
                        <span className="text-xs text-gray-400 hidden sm:inline">
                          {formatDate(date)}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {activities.length > 20 && (
                  <p className="text-center text-xs text-gray-400 py-2">
                    Showing 20 of {activities.length} activities
                  </p>
                )}
              </div>
            </Section>
          </motion.div>
        )}
      </div>
    </main>
  );
}

// ── Sub-components ──

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: typeof Target;
  color: string;
}) {
  const colors: Record<string, string> = {
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors[color] || colors.indigo}`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  count,
  children,
}: {
  title: string;
  icon: typeof Target;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-gray-400" />
        <h2 className="text-lg font-bold">{title}</h2>
        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
          {count}
        </span>
      </div>
      {children}
    </div>
  );
}

function InProgressCard({
  title,
  icon: Icon,
  color,
  href,
  savedAt,
  details,
}: {
  title: string;
  icon: typeof Target;
  color: string;
  href: string;
  savedAt: number;
  details: string[];
}) {
  const colorMap: Record<string, { bg: string; icon: string; badge: string }> = {
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', badge: 'bg-amber-100 text-amber-700' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', badge: 'bg-amber-100 text-amber-700' },
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', badge: 'bg-amber-100 text-amber-700' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <Link
      href={href}
      className="bg-white rounded-xl border-2 border-amber-200 p-4 flex items-center gap-4 hover:border-amber-300 hover:shadow-sm transition-all group block"
    >
      <div className={`w-10 h-10 ${c.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${c.icon}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="font-semibold text-sm text-gray-900">{title}</p>
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${c.badge}`}>
            In Progress
          </span>
        </div>
        <p className="text-xs text-gray-500">
          {details.join(' · ')} · Saved {formatTimeSince(savedAt)}
        </p>
      </div>
      <div className="flex items-center gap-1 text-indigo-600 group-hover:text-indigo-700 flex-shrink-0">
        <span className="text-sm font-medium">Resume</span>
        <Play className="w-4 h-4" />
      </div>
    </Link>
  );
}
