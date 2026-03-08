'use client';

import { motion, AnimatePresence } from 'framer-motion';

export interface QuestionNavState {
  selectedAnswer: number | null;
  selectedAnswers: number[];
  flagged: boolean;
}

interface QuestionNavigatorProps {
  open: boolean;
  totalQuestions: number;
  questionStates: QuestionNavState[];
  currentIndex: number;
  onGoToQuestion: (index: number) => void;
  onClose: () => void;
}

export function QuestionNavigator({
  open,
  totalQuestions,
  questionStates,
  currentIndex,
  onGoToQuestion,
  onClose,
}: QuestionNavigatorProps) {
  const unansweredCount = questionStates.filter(
    (s) => s.selectedAnswers.length === 0 && s.selectedAnswer === null
  ).length;
  const flaggedCount = questionStates.filter((s) => s.flagged).length;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[70vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-lg text-gray-900 mb-4">Question Navigator</h3>
            <div className="flex gap-3 mb-4 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-indigo-500" /> Answered
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-gray-200" /> Unanswered
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-amber-400" /> Flagged
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded ring-2 ring-indigo-400 bg-transparent" /> Current
              </span>
            </div>
            <div className="grid grid-cols-8 gap-2">
              {Array.from({ length: totalQuestions }, (_, i) => {
                const qs = questionStates[i];
                const isCurrent = i === currentIndex;
                const isAnswered =
                  qs.selectedAnswers.length > 0 || qs.selectedAnswer !== null;
                const isFlagged = qs.flagged;
                return (
                  <button
                    key={i}
                    onClick={() => onGoToQuestion(i)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      isCurrent
                        ? 'ring-2 ring-indigo-500 bg-indigo-600 text-white'
                        : isFlagged
                          ? 'bg-amber-400 text-amber-900'
                          : isAnswered
                            ? 'bg-indigo-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 text-sm text-gray-500 space-y-1">
              {unansweredCount > 0 && (
                <p>
                  {unansweredCount} question{unansweredCount > 1 ? 's' : ''} unanswered
                </p>
              )}
              {flaggedCount > 0 && (
                <p>
                  {flaggedCount} question{flaggedCount > 1 ? 's' : ''} flagged for review
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
