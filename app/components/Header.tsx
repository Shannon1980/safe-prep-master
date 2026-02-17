'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Brain,
  Target,
  GraduationCap,
  Zap,
  BookOpen,
  Upload,
  Menu,
  X,
  LogIn,
  LogOut,
  User,
  ShieldCheck,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { isAdmin } from '@/app/lib/activity';

const NAV_LINKS = [
  { href: '/exam', label: 'Exam Sim', icon: Target },
  { href: '/quiz/lesson', label: 'Lesson Quizzes', icon: GraduationCap },
  { href: '/quiz', label: 'Practice Quiz', icon: Zap },
  { href: '/flashcards', label: 'Flashcards', icon: BookOpen },
  { href: '/upload', label: 'Upload', icon: Upload },
];

export default function Header() {
  const { user, loading, isConfigured, login, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="border-b border-indigo-100/60 bg-white/70 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold text-indigo-700 flex items-center gap-2"
        >
          <Brain className="w-7 h-7" />
          <span className="hidden sm:inline">SAFe Prep Master</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'text-indigo-700 bg-indigo-50'
                    : 'text-gray-600 hover:text-indigo-700 hover:bg-indigo-50'
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
          {user && (
            <Link
              href="/progress"
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                pathname === '/progress'
                  ? 'text-indigo-700 bg-indigo-50'
                  : 'text-gray-600 hover:text-indigo-700 hover:bg-indigo-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              My Progress
            </Link>
          )}
          {isAdmin(user?.email) && (
            <Link
              href="/admin"
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                pathname === '/admin'
                  ? 'text-amber-700 bg-amber-50'
                  : 'text-amber-600 hover:text-amber-700 hover:bg-amber-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Admin
            </Link>
          )}
        </nav>

        {/* Auth + Mobile Toggle */}
        <div className="flex items-center gap-2">
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-2">
                  {user.photoURL && (
                    <img
                      src={user.photoURL}
                      alt=""
                      className="w-7 h-7 rounded-full border border-gray-200"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <span className="text-sm font-medium text-gray-600 hidden sm:inline">
                    {user.displayName?.split(' ')[0]}
                  </span>
                  <button
                    onClick={logout}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              ) : isConfigured ? (
                <button
                  onClick={login}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
                >
                  <LogIn className="w-4 h-4" />
                  Sign in with Google
                </button>
              ) : null}
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="md:hidden border-t border-indigo-100/60 bg-white"
        >
          <nav className="px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'text-indigo-700 bg-indigo-50'
                      : 'text-gray-600 hover:text-indigo-700 hover:bg-indigo-50'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}

            {/* Mobile progress */}
            {user && (
              <Link
                href="/progress"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  pathname === '/progress'
                    ? 'text-indigo-700 bg-indigo-50'
                    : 'text-gray-600 hover:text-indigo-700 hover:bg-indigo-50'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                My Progress
              </Link>
            )}

            {/* Mobile admin */}
            {isAdmin(user?.email) && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  pathname === '/admin'
                    ? 'text-amber-700 bg-amber-50'
                    : 'text-amber-600 hover:text-amber-700 hover:bg-amber-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Dashboard
              </Link>
            )}

            {/* Mobile auth */}
            {!loading && !user && isConfigured && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  login();
                }}
                className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors w-full"
              >
                <User className="w-4 h-4" />
                Sign in with Google
              </button>
            )}
          </nav>
        </motion.div>
      )}
    </header>
  );
}
