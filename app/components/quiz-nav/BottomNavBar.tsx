'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BottomNavBarProps {
  currentIndex: number;
  totalQuestions: number;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onSaveAndExit?: () => void;
  submitLabel?: string;
}

export function BottomNavBar({
  currentIndex,
  totalQuestions,
  onPrev,
  onNext,
  onSubmit,
  onSaveAndExit,
  submitLabel = 'Submit Quiz',
}: BottomNavBarProps) {
  return (
    <div className="border-t border-gray-200 bg-white/80 backdrop-blur px-4 py-3 sticky bottom-0 z-10">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <button
          onClick={onPrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Previous
        </button>

        <div className="flex gap-2">
          {onSaveAndExit && (
            <button
              onClick={onSaveAndExit}
              className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors text-sm"
            >
              Save &amp; Exit
            </button>
          )}
          <button
            onClick={onSubmit}
            className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
          >
            {submitLabel}
          </button>
        </div>

        <button
          onClick={onNext}
          disabled={currentIndex === totalQuestions - 1}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
