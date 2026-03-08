'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Flag } from 'lucide-react';

interface SubmitConfirmModalProps {
  open: boolean;
  unansweredCount: number;
  flaggedCount?: number;
  onCancel: () => void;
  onConfirm: () => void;
  label?: string;
}

export function SubmitConfirmModal({
  open,
  unansweredCount,
  flaggedCount = 0,
  onCancel,
  onConfirm,
  label = 'Submit Quiz',
}: SubmitConfirmModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 flex items-center justify-center p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-lg text-gray-900 mb-3">{label}?</h3>
            {unansweredCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-sm text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-500" />
                <span>
                  You have {unansweredCount} unanswered question
                  {unansweredCount > 1 ? 's' : ''}. Unanswered questions will be
                  marked incorrect.
                </span>
              </div>
            )}
            {flaggedCount > 0 && (
              <p className="text-sm text-gray-500 mb-4 flex items-center gap-1.5">
                <Flag className="w-4 h-4 text-amber-500" />
                {flaggedCount} flagged question{flaggedCount > 1 ? 's' : ''} to review.
              </p>
            )}
            {unansweredCount === 0 && flaggedCount === 0 && (
              <p className="text-sm text-gray-500 mb-4">
                All questions have been answered. Ready to submit?
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Continue Quiz
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
              >
                Submit
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
