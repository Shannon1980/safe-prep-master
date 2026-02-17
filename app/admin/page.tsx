'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  Target,
  GraduationCap,
  Zap,
  Clock,
  TrendingUp,
  Trophy,
  XCircle,
  Loader2,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  ToggleLeft,
  ToggleRight,
  Search,
  Database,
} from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { getAllActivity, isAdmin, type ActivityRecord, type ActivityType } from '@/app/lib/activity';
import { subscribeToPresence, type PresenceRecord } from '@/app/lib/presence';
import {
  fetchAllFirestoreQuestions,
  addFirestoreQuestion,
  updateFirestoreQuestion,
  deleteFirestoreQuestion,
  type FirestoreQuestion,
} from '@/app/lib/question-bank';
import { LESSONS } from '@/data/lesson-config';
import { EXAM_QUESTIONS } from '@/data/exam-questions';
import { QUIZ_QUESTIONS } from '@/data/quiz-questions';

// ── Types ──

interface UserSummary {
  uid: string;
  email: string;
  displayName: string;
  exams: number;
  lessonQuizzes: number;
  practiceQuizzes: number;
  totalActivities: number;
  avgExamScore: number;
  lastActive: Date;
  examsPassed: number;
}

type Tab = 'live' | 'overview' | 'exams' | 'lesson_quizzes' | 'practice_quizzes' | 'users' | 'questions';

const TABS: { id: Tab; label: string; icon: typeof BarChart3 }[] = [
  { id: 'live', label: 'Live', icon: Users },
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'exams', label: 'Exams', icon: Target },
  { id: 'lesson_quizzes', label: 'Lesson Quizzes', icon: GraduationCap },
  { id: 'practice_quizzes', label: 'Practice Quizzes', icon: Zap },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'questions', label: 'Questions', icon: Database },
];

// ── Helpers ──

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d);
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

// ── Component ──

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('live');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<PresenceRecord[]>([]);
  const [firestoreQuestions, setFirestoreQuestions] = useState<FirestoreQuestion[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<FirestoreQuestion | null>(null);
  const [questionFilter, setQuestionFilter] = useState({ lesson: 0, search: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const authorized = isAdmin(user?.email);

  useEffect(() => {
    if (!authorized) return;
    getAllActivity(1000).then((data) => {
      setActivities(data);
      setLoading(false);
    });
  }, [authorized]);

  // Real-time presence subscription
  useEffect(() => {
    if (!authorized) return;
    const unsub = subscribeToPresence((users) => {
      setOnlineUsers(users);
    });
    return () => { unsub?.(); };
  }, [authorized]);

  // Load Firestore questions when tab is active
  const loadFirestoreQuestions = useCallback(async () => {
    setQuestionsLoading(true);
    const qs = await fetchAllFirestoreQuestions();
    setFirestoreQuestions(qs);
    setQuestionsLoading(false);
  }, []);

  useEffect(() => {
    if (authorized && activeTab === 'questions') {
      loadFirestoreQuestions();
    }
  }, [authorized, activeTab, loadFirestoreQuestions]);

  // ── Computed Metrics ──

  const exams = useMemo(() => activities.filter((a) => a.type === 'exam'), [activities]);
  const lessonQuizzes = useMemo(() => activities.filter((a) => a.type === 'lesson_quiz'), [activities]);
  const practiceQuizzes = useMemo(() => activities.filter((a) => a.type === 'practice_quiz'), [activities]);

  const uniqueUsers = useMemo(() => {
    const map = new Map<string, UserSummary>();
    for (const a of activities) {
      let u = map.get(a.uid);
      if (!u) {
        u = {
          uid: a.uid,
          email: a.email,
          displayName: a.displayName,
          exams: 0,
          lessonQuizzes: 0,
          practiceQuizzes: 0,
          totalActivities: 0,
          avgExamScore: 0,
          lastActive: new Date(0),
          examsPassed: 0,
        };
        map.set(a.uid, u);
      }
      u.totalActivities++;
      const d = a.createdAt instanceof Date ? a.createdAt : new Date();
      if (d > u.lastActive) u.lastActive = d;

      if (a.type === 'exam') {
        u.exams++;
        if (a.passed) u.examsPassed++;
      } else if (a.type === 'lesson_quiz') {
        u.lessonQuizzes++;
      } else if (a.type === 'practice_quiz') {
        u.practiceQuizzes++;
      }
    }
    // Compute avg exam score
    for (const u of map.values()) {
      const userExams = activities.filter((a) => a.uid === u.uid && a.type === 'exam');
      if (userExams.length > 0) {
        u.avgExamScore = Math.round(
          userExams.reduce((sum, e) => sum + e.percentage, 0) / userExams.length
        );
      }
    }
    return Array.from(map.values()).sort((a, b) => b.lastActive.getTime() - a.lastActive.getTime());
  }, [activities]);

  const avgExamScore = useMemo(() => {
    if (exams.length === 0) return 0;
    return Math.round(exams.reduce((sum, e) => sum + e.percentage, 0) / exams.length);
  }, [exams]);

  const examPassRate = useMemo(() => {
    if (exams.length === 0) return 0;
    return Math.round((exams.filter((e) => e.passed).length / exams.length) * 100);
  }, [exams]);

  const avgLessonScore = useMemo(() => {
    if (lessonQuizzes.length === 0) return 0;
    return Math.round(lessonQuizzes.reduce((sum, q) => sum + q.percentage, 0) / lessonQuizzes.length);
  }, [lessonQuizzes]);

  const avgPracticeScore = useMemo(() => {
    if (practiceQuizzes.length === 0) return 0;
    return Math.round(practiceQuizzes.reduce((sum, q) => sum + q.percentage, 0) / practiceQuizzes.length);
  }, [practiceQuizzes]);

  // Activity over last 7 days
  const last7Days = useMemo(() => {
    const days: { label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(dayStart.getTime() + 86400000);
      const count = activities.filter((a) => {
        const t = a.createdAt instanceof Date ? a.createdAt : new Date();
        return t >= dayStart && t < dayEnd;
      }).length;
      days.push({ label, count });
    }
    return days;
  }, [activities]);

  const maxDayCount = Math.max(...last7Days.map((d) => d.count), 1);

  // ── Guards ──

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!user || !authorized) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShieldAlert className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-700 mb-2">Admin Access Required</h1>
          <p className="text-gray-500">You don&apos;t have permission to view this page.</p>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading metrics...</p>
        </div>
      </main>
    );
  }

  // ── Render ──

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Monitor user activity across exams, quizzes, and study sessions.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 overflow-x-auto pb-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.id === 'live' ? (
                <>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                  </span>
                  {tab.label}
                  {onlineUsers.length > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      activeTab === 'live' ? 'bg-white/20' : 'bg-green-100 text-green-700'
                    }`}>
                      {onlineUsers.length}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </>
              )}
            </button>
          ))}
        </div>

        {/* ── LIVE TAB ── */}
        {activeTab === 'live' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                  </span>
                  <h3 className="font-semibold text-gray-900">
                    Users Online — {onlineUsers.length}
                  </h3>
                </div>
                <span className="text-xs text-gray-400">Updates in real-time</span>
              </div>

              {onlineUsers.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">No users online right now</p>
                  <p className="text-gray-400 text-sm mt-1">When users are active, they&apos;ll appear here</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {onlineUsers.map((u) => {
                    const lastSeenDate = u.lastSeen instanceof Date ? u.lastSeen : (u.lastSeen as { toDate: () => Date }).toDate();
                    const secsAgo = Math.floor((Date.now() - lastSeenDate.getTime()) / 1000);
                    const timeLabel = secsAgo < 10 ? 'Just now' : secsAgo < 60 ? `${secsAgo}s ago` : `${Math.floor(secsAgo / 60)}m ago`;

                    return (
                      <div key={u.uid} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          {u.photoURL ? (
                            <img
                              src={u.photoURL}
                              alt={u.displayName}
                              className="w-10 h-10 rounded-full"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold text-sm">
                              {(u.displayName || u.email || '?')[0].toUpperCase()}
                            </div>
                          )}
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {u.displayName || u.email}
                          </p>
                          <p className="text-sm text-gray-500 truncate">{u.email}</p>
                        </div>

                        {/* Activity badge */}
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            u.activity === 'Taking Exam'
                              ? 'bg-red-100 text-red-700'
                              : u.activity === 'Lesson Quiz'
                              ? 'bg-blue-100 text-blue-700'
                              : u.activity === 'Practice Quiz'
                              ? 'bg-purple-100 text-purple-700'
                              : u.activity === 'Flashcards'
                              ? 'bg-amber-100 text-amber-700'
                              : u.activity === 'AI Coach'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {u.activity}
                          </span>
                          <span className="text-xs text-gray-400">{timeLabel}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard icon={Users} label="Total Users" value={uniqueUsers.length} color="indigo" />
              <StatCard icon={BarChart3} label="Total Activities" value={activities.length} color="blue" />
              <StatCard icon={Target} label="Exam Attempts" value={exams.length} color="purple" />
              <StatCard
                icon={Trophy}
                label="Exam Pass Rate"
                value={`${examPassRate}%`}
                color="green"
              />
            </div>

            {/* Score Averages */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <p className="text-sm text-gray-500 mb-1">Avg Exam Score</p>
                <p className="text-3xl font-bold text-indigo-600">{avgExamScore}%</p>
                <p className="text-xs text-gray-400 mt-1">{exams.length} attempts</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <p className="text-sm text-gray-500 mb-1">Avg Lesson Quiz Score</p>
                <p className="text-3xl font-bold text-emerald-600">{avgLessonScore}%</p>
                <p className="text-xs text-gray-400 mt-1">{lessonQuizzes.length} attempts</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <p className="text-sm text-gray-500 mb-1">Avg Practice Quiz Score</p>
                <p className="text-3xl font-bold text-blue-600">{avgPracticeScore}%</p>
                <p className="text-xs text-gray-400 mt-1">{practiceQuizzes.length} attempts</p>
              </div>
            </div>

            {/* 7 Day Activity Chart */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Activity – Last 7 Days
              </h3>
              <div className="flex items-end gap-3 h-32">
                {last7Days.map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-medium text-gray-600">{day.count}</span>
                    <div
                      className="w-full bg-indigo-500 rounded-t-md transition-all"
                      style={{
                        height: `${Math.max((day.count / maxDayCount) * 100, 4)}%`,
                        minHeight: '4px',
                      }}
                    />
                    <span className="text-xs text-gray-400">{day.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Recent Activity</h3>
              <ActivityTable records={activities.slice(0, 15)} />
            </div>
          </motion.div>
        )}

        {/* ── EXAMS TAB ── */}
        {activeTab === 'exams' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard icon={Target} label="Total Attempts" value={exams.length} color="purple" />
              <StatCard icon={Trophy} label="Pass Rate" value={`${examPassRate}%`} color="green" />
              <StatCard icon={BarChart3} label="Avg Score" value={`${avgExamScore}%`} color="indigo" />
              <StatCard
                icon={Clock}
                label="Avg Time"
                value={
                  exams.length > 0
                    ? formatDuration(
                        Math.round(
                          exams.reduce((s, e) => s + (e.timeTakenSeconds || 0), 0) / exams.length
                        )
                      )
                    : '–'
                }
                color="blue"
              />
            </div>

            {/* Domain Breakdown */}
            {exams.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">
                  Domain Performance (Across All Attempts)
                </h3>
                <DomainBreakdown exams={exams} />
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">All Exam Attempts</h3>
              <ActivityTable records={exams} showDomains />
            </div>
          </motion.div>
        )}

        {/* ── LESSON QUIZZES TAB ── */}
        {activeTab === 'lesson_quizzes' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <StatCard icon={GraduationCap} label="Total Attempts" value={lessonQuizzes.length} color="emerald" />
              <StatCard icon={BarChart3} label="Avg Score" value={`${avgLessonScore}%`} color="indigo" />
              <StatCard
                icon={Users}
                label="Unique Users"
                value={new Set(lessonQuizzes.map((q) => q.uid)).size}
                color="blue"
              />
            </div>

            {/* By Lesson */}
            {lessonQuizzes.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Performance by Lesson</h3>
                <LessonBreakdown quizzes={lessonQuizzes} />
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">All Lesson Quiz Attempts</h3>
              <ActivityTable records={lessonQuizzes} showLesson />
            </div>
          </motion.div>
        )}

        {/* ── PRACTICE QUIZZES TAB ── */}
        {activeTab === 'practice_quizzes' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <StatCard icon={Zap} label="Total Attempts" value={practiceQuizzes.length} color="yellow" />
              <StatCard icon={BarChart3} label="Avg Score" value={`${avgPracticeScore}%`} color="indigo" />
              <StatCard
                icon={Users}
                label="Unique Users"
                value={new Set(practiceQuizzes.map((q) => q.uid)).size}
                color="blue"
              />
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">All Practice Quiz Attempts</h3>
              <ActivityTable records={practiceQuizzes} />
            </div>
          </motion.div>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <StatCard icon={Users} label="Total Users" value={uniqueUsers.length} color="indigo" />
              <StatCard
                icon={Target}
                label="Active (7 days)"
                value={
                  uniqueUsers.filter(
                    (u) => u.lastActive.getTime() > Date.now() - 7 * 86400000
                  ).length
                }
                color="green"
              />
              <StatCard icon={BarChart3} label="Total Activities" value={activities.length} color="blue" />
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">All Users</h3>
              <div className="space-y-2">
                {uniqueUsers.map((u) => (
                  <div key={u.uid} className="border border-gray-100 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedUser(expandedUser === u.uid ? null : u.uid)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-indigo-600">
                            {(u.displayName || u.email)?.[0]?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">
                            {u.displayName || 'Anonymous'}
                          </p>
                          <p className="text-xs text-gray-400 truncate">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="hidden sm:flex gap-4 text-xs text-gray-500">
                          <span>{u.exams} exams</span>
                          <span>{u.lessonQuizzes} lessons</span>
                          <span>{u.practiceQuizzes} practice</span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {formatDate(u.lastActive)}
                        </span>
                        {expandedUser === u.uid ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </button>

                    {expandedUser === u.uid && (
                      <div className="border-t border-gray-100 bg-gray-50 p-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                          <MiniStat label="Exams" value={u.exams} />
                          <MiniStat label="Exam Avg" value={u.exams > 0 ? `${u.avgExamScore}%` : '–'} />
                          <MiniStat label="Exams Passed" value={u.examsPassed} />
                          <MiniStat label="Total Activities" value={u.totalActivities} />
                        </div>
                        <h4 className="text-xs font-semibold text-gray-500 mb-2">Recent Activity</h4>
                        <ActivityTable
                          records={activities.filter((a) => a.uid === u.uid).slice(0, 10)}
                          compact
                        />
                      </div>
                    )}
                  </div>
                ))}

                {uniqueUsers.length === 0 && (
                  <p className="text-center text-gray-400 py-8">No users yet.</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── QUESTIONS TAB ── */}
        {activeTab === 'questions' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard icon={Database} label="Hardcoded Exam" value={EXAM_QUESTIONS.length} color="indigo" />
              <StatCard icon={Database} label="Practice Quiz" value={QUIZ_QUESTIONS.length} color="blue" />
              <StatCard icon={Database} label="Firestore" value={firestoreQuestions.length} color="purple" />
              <StatCard
                icon={Database}
                label="Total Questions"
                value={EXAM_QUESTIONS.length + QUIZ_QUESTIONS.length + firestoreQuestions.filter(q => q.enabled).length}
                color="green"
              />
            </div>

            {/* Per-lesson breakdown */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Questions by Lesson</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {LESSONS.map((lesson) => {
                  const fsCount = firestoreQuestions.filter(q => q.lessonId === lesson.id && q.enabled).length;
                  return (
                    <div key={lesson.id} className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500 mb-1 truncate">{lesson.shortTitle}</p>
                      <p className="text-lg font-bold text-gray-800">{fsCount}</p>
                      <p className="text-xs text-gray-400">Firestore</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Firestore Questions Manager */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">
                  Firestore Questions ({firestoreQuestions.length})
                </h3>
                <button
                  onClick={() => { setShowAddForm(true); setEditingQuestion(null); }}
                  className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Question
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3 mb-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={questionFilter.search}
                    onChange={(e) => setQuestionFilter(f => ({ ...f, search: e.target.value }))}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
                <select
                  value={questionFilter.lesson}
                  onChange={(e) => setQuestionFilter(f => ({ ...f, lesson: Number(e.target.value) }))}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  <option value={0}>All Lessons</option>
                  {LESSONS.map(l => (
                    <option key={l.id} value={l.id}>Lesson {l.id}: {l.shortTitle}</option>
                  ))}
                </select>
              </div>

              {/* Add/Edit Form */}
              {(showAddForm || editingQuestion) && (
                <QuestionForm
                  question={editingQuestion}
                  onSave={async (data) => {
                    if (editingQuestion?.id) {
                      await updateFirestoreQuestion(editingQuestion.id, data);
                    } else {
                      await addFirestoreQuestion(data);
                    }
                    setShowAddForm(false);
                    setEditingQuestion(null);
                    loadFirestoreQuestions();
                  }}
                  onCancel={() => { setShowAddForm(false); setEditingQuestion(null); }}
                />
              )}

              {questionsLoading ? (
                <div className="py-12 text-center">
                  <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Loading questions...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {firestoreQuestions
                    .filter(q => {
                      if (questionFilter.lesson && q.lessonId !== questionFilter.lesson) return false;
                      if (questionFilter.search) {
                        const s = questionFilter.search.toLowerCase();
                        return q.question.toLowerCase().includes(s);
                      }
                      return true;
                    })
                    .map((q) => (
                      <div
                        key={q.id}
                        className={`border rounded-lg p-4 transition-colors ${
                          q.enabled ? 'border-gray-100 bg-white' : 'border-orange-200 bg-orange-50/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${q.enabled ? 'text-gray-800' : 'text-gray-500 line-through'}`}>
                              {q.question}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full">
                                L{q.lessonId}
                              </span>
                              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                {q.sectionId}
                              </span>
                              <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full">
                                {q.domain}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                q.enabled ? 'bg-green-50 text-green-600' : 'bg-orange-100 text-orange-600'
                              }`}>
                                {q.enabled ? 'Active' : 'Disabled'}
                              </span>
                            </div>
                            <div className="mt-2 text-xs text-gray-400">
                              Options: {q.options.map((o, i) => (
                                <span key={i} className={i === q.correctIndex ? 'font-semibold text-green-600' : ''}>
                                  {i > 0 && ' | '}{o.slice(0, 40)}{o.length > 40 ? '...' : ''}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={async () => {
                                if (q.id) {
                                  await updateFirestoreQuestion(q.id, { enabled: !q.enabled });
                                  loadFirestoreQuestions();
                                }
                              }}
                              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                              title={q.enabled ? 'Disable' : 'Enable'}
                            >
                              {q.enabled ? (
                                <ToggleRight className="w-5 h-5 text-green-500" />
                              ) : (
                                <ToggleLeft className="w-5 h-5 text-gray-400" />
                              )}
                            </button>
                            <button
                              onClick={() => { setEditingQuestion(q); setShowAddForm(false); }}
                              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4 text-gray-500" />
                            </button>
                            {deleteConfirm === q.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={async () => {
                                    if (q.id) {
                                      await deleteFirestoreQuestion(q.id);
                                      setDeleteConfirm(null);
                                      loadFirestoreQuestions();
                                    }
                                  }}
                                  className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition-colors"
                                  title="Confirm delete"
                                >
                                  <Check className="w-4 h-4 text-red-600" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                  title="Cancel"
                                >
                                  <X className="w-4 h-4 text-gray-400" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(q.id || null)}
                                className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                  {firestoreQuestions.length === 0 && !questionsLoading && (
                    <div className="py-12 text-center">
                      <Database className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">No Firestore questions yet</p>
                      <p className="text-gray-400 text-sm mt-1">
                        Add questions here to expand the question bank without redeploying.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}

// ── Sub-components ──

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof BarChart3;
  label: string;
  value: string | number;
  color: string;
}) {
  const colors: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    yellow: 'bg-yellow-50 text-yellow-600',
  };
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colors[color] || colors.indigo}`}>
          <Icon className="w-4 h-4" />
        </div>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 p-3 text-center">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-lg font-bold text-gray-800">{value}</p>
    </div>
  );
}

function ActivityTable({
  records,
  compact,
  showDomains,
  showLesson,
}: {
  records: ActivityRecord[];
  compact?: boolean;
  showDomains?: boolean;
  showLesson?: boolean;
}) {
  if (records.length === 0) {
    return <p className="text-center text-gray-400 py-4 text-sm">No activity recorded yet.</p>;
  }

  const typeLabels: Record<ActivityType, string> = {
    exam: 'Exam',
    lesson_quiz: 'Lesson Quiz',
    practice_quiz: 'Practice Quiz',
    flashcard_session: 'Flashcards',
  };

  const typeColors: Record<ActivityType, string> = {
    exam: 'bg-purple-100 text-purple-700',
    lesson_quiz: 'bg-emerald-100 text-emerald-700',
    practice_quiz: 'bg-blue-100 text-blue-700',
    flashcard_session: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
            {!compact && <th className="pb-2 pr-4">User</th>}
            <th className="pb-2 pr-4">Type</th>
            {showLesson && <th className="pb-2 pr-4">Lesson</th>}
            <th className="pb-2 pr-4">Score</th>
            <th className="pb-2 pr-4">%</th>
            {showDomains && <th className="pb-2 pr-4 hidden lg:table-cell">Passed</th>}
            {showDomains && <th className="pb-2 pr-4 hidden lg:table-cell">Time</th>}
            <th className="pb-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r, i) => (
            <tr key={r.id || i} className="border-b border-gray-50 last:border-0">
              {!compact && (
                <td className="py-2.5 pr-4">
                  <span className="text-gray-700 font-medium truncate max-w-[150px] block">
                    {r.displayName || r.email?.split('@')[0] || '–'}
                  </span>
                </td>
              )}
              <td className="py-2.5 pr-4">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColors[r.type]}`}
                >
                  {typeLabels[r.type]}
                </span>
              </td>
              {showLesson && (
                <td className="py-2.5 pr-4 text-gray-600">
                  {r.lessonTitle || '–'}
                </td>
              )}
              <td className="py-2.5 pr-4 font-medium text-gray-700">
                {r.score}/{r.total}
              </td>
              <td className="py-2.5 pr-4">
                <span
                  className={`font-semibold ${
                    r.percentage >= 73
                      ? 'text-green-600'
                      : r.percentage >= 50
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  }`}
                >
                  {r.percentage}%
                </span>
              </td>
              {showDomains && (
                <td className="py-2.5 pr-4 hidden lg:table-cell">
                  {r.passed ? (
                    <Trophy className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                </td>
              )}
              {showDomains && (
                <td className="py-2.5 pr-4 hidden lg:table-cell text-gray-500">
                  {r.timeTakenSeconds ? formatDuration(r.timeTakenSeconds) : '–'}
                </td>
              )}
              <td className="py-2.5 text-gray-400 text-xs whitespace-nowrap">
                {formatDate(r.createdAt instanceof Date ? r.createdAt : new Date())}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DomainBreakdown({ exams }: { exams: ActivityRecord[] }) {
  const domains = useMemo(() => {
    const map = new Map<string, { correct: number; total: number }>();
    for (const e of exams) {
      if (!e.domainBreakdown) continue;
      for (const [domain, { correct, total }] of Object.entries(e.domainBreakdown)) {
        const existing = map.get(domain) || { correct: 0, total: 0 };
        existing.correct += correct;
        existing.total += total;
        map.set(domain, existing);
      }
    }
    return Array.from(map.entries())
      .map(([name, { correct, total }]) => ({
        name,
        correct,
        total,
        percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [exams]);

  return (
    <div className="space-y-3">
      {domains.map((d) => (
        <div key={d.name}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-700">{d.name}</span>
            <span className="font-medium text-gray-600">
              {d.percentage}%{' '}
              <span className="text-gray-400 text-xs">
                ({d.correct}/{d.total})
              </span>
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                d.percentage >= 73 ? 'bg-green-500' : d.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${d.percentage}%` }}
            />
          </div>
        </div>
      ))}
      {domains.length === 0 && (
        <p className="text-sm text-gray-400">No domain data available yet.</p>
      )}
    </div>
  );
}

function LessonBreakdown({ quizzes }: { quizzes: ActivityRecord[] }) {
  const lessons = useMemo(() => {
    const map = new Map<number, { title: string; attempts: number; totalScore: number }>();
    for (const q of quizzes) {
      if (q.lessonId == null) continue;
      const existing = map.get(q.lessonId) || {
        title: q.lessonTitle || `Lesson ${q.lessonId}`,
        attempts: 0,
        totalScore: 0,
      };
      existing.attempts++;
      existing.totalScore += q.percentage;
      map.set(q.lessonId, existing);
    }
    return Array.from(map.entries())
      .map(([id, data]) => ({
        id,
        title: data.title,
        attempts: data.attempts,
        avgScore: Math.round(data.totalScore / data.attempts),
      }))
      .sort((a, b) => a.id - b.id);
  }, [quizzes]);

  return (
    <div className="space-y-3">
      {lessons.map((l) => (
        <div key={l.id}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-700">
              Lesson {l.id}: {l.title}
            </span>
            <span className="font-medium text-gray-600">
              {l.avgScore}% avg{' '}
              <span className="text-gray-400 text-xs">({l.attempts} attempts)</span>
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                l.avgScore >= 73 ? 'bg-green-500' : l.avgScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${l.avgScore}%` }}
            />
          </div>
        </div>
      ))}
      {lessons.length === 0 && (
        <p className="text-sm text-gray-400">No lesson data available yet.</p>
      )}
    </div>
  );
}

const DOMAIN_OPTIONS = [
  'Introducing Scrum in SAFe',
  'Defining the SM/TC Role',
  'Supporting Team Events',
  'Supporting ART Events',
];

function QuestionForm({
  question,
  onSave,
  onCancel,
}: {
  question: FirestoreQuestion | null;
  onSave: (data: Omit<FirestoreQuestion, 'id' | 'createdAt' | 'createdBy'>) => Promise<void>;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    question: question?.question || '',
    options: question?.options || ['', '', '', ''],
    correctIndex: question?.correctIndex ?? 0,
    domain: question?.domain || DOMAIN_OPTIONS[0],
    lessonId: question?.lessonId || 1,
    sectionId: question?.sectionId || '',
    enabled: question?.enabled ?? true,
  });
  const [saving, setSaving] = useState(false);

  const selectedLesson = LESSONS.find(l => l.id === formData.lessonId);
  const sections = selectedLesson?.sections || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question.trim() || formData.options.some(o => !o.trim())) return;
    setSaving(true);
    await onSave({
      question: formData.question.trim(),
      options: formData.options.map(o => o.trim()),
      correctIndex: formData.correctIndex,
      domain: formData.domain,
      lessonId: formData.lessonId,
      sectionId: formData.sectionId || sections[0]?.id || '',
      enabled: formData.enabled,
    });
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl border border-gray-200 p-5 mb-4">
      <h4 className="font-semibold text-gray-800 mb-4">
        {question ? 'Edit Question' : 'Add New Question'}
      </h4>

      {/* Question text */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-600 mb-1">Question</label>
        <textarea
          value={formData.question}
          onChange={(e) => setFormData(f => ({ ...f, question: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 min-h-[80px]"
          required
        />
      </div>

      {/* Options */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Options (click radio to mark correct)
        </label>
        <div className="space-y-2">
          {formData.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio"
                name="correctIndex"
                checked={formData.correctIndex === i}
                onChange={() => setFormData(f => ({ ...f, correctIndex: i }))}
                className="w-4 h-4 text-indigo-600 accent-indigo-600"
              />
              <input
                type="text"
                value={opt}
                onChange={(e) => {
                  const newOpts = [...formData.options];
                  newOpts[i] = e.target.value;
                  setFormData(f => ({ ...f, options: newOpts }));
                }}
                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                  formData.correctIndex === i ? 'border-green-300 bg-green-50' : 'border-gray-200'
                }`}
                required
              />
            </div>
          ))}
        </div>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Domain</label>
          <select
            value={formData.domain}
            onChange={(e) => setFormData(f => ({ ...f, domain: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            {DOMAIN_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Lesson</label>
          <select
            value={formData.lessonId}
            onChange={(e) => setFormData(f => ({ ...f, lessonId: Number(e.target.value), sectionId: '' }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            {LESSONS.map(l => <option key={l.id} value={l.id}>L{l.id}: {l.shortTitle}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Section</label>
          <select
            value={formData.sectionId}
            onChange={(e) => setFormData(f => ({ ...f, sectionId: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="">Select section...</option>
            {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      {/* Enabled toggle */}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          id="enabled"
          checked={formData.enabled}
          onChange={(e) => setFormData(f => ({ ...f, enabled: e.target.checked }))}
          className="w-4 h-4 accent-indigo-600"
        />
        <label htmlFor="enabled" className="text-sm text-gray-600">Enabled (visible to users)</label>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {question ? 'Update' : 'Add'} Question
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-white text-gray-600 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
