import React, { useState } from 'react';
import { Info, Sparkles, X, ChevronRight } from 'lucide-react';

interface DemoNoticeBannerProps {
  onExploreFeatures?: () => void;
  className?: string;
}

export const DemoNoticeBanner: React.FC<DemoNoticeBannerProps> = ({
  onExploreFeatures,
  className = '',
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  if (isDismissed) return null;

  return (
    <aside
      aria-label="Quizzy AI Architecture Roadmap and Preview Notice"
      className={`bg-gradient-to-r from-[#FFF1B8]/60 via-[#FFE2CC]/50 to-[#FFD6E7]/50 border-b border-[#FFE2CC] px-4 py-2.5 text-xs text-[#352B48] transition-all duration-200 ${className}`}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#FFE2CC] text-[#352B48] shrink-0 font-bold">
            <Info className="w-3.5 h-3.5 text-[#352B48]" />
          </span>
          <p className="font-medium">
            <strong className="font-bold text-[#352B48]">Stage 1 Foundation:</strong> Interactive frontend navigation, pastel design system, and client-side flows are active.
            <span className="text-[#777187] ml-1 hidden sm:inline">
              Scores & rankings shown are sample demo records. Firebase Auth, Firestore, and Gemini AI connect in Stages 2–5.
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[11px] font-semibold text-[#9274E8] hover:text-[#7d5cd6] underline underline-offset-2 flex items-center gap-0.5 cursor-pointer"
          >
            {isExpanded ? 'Hide roadmap' : 'View roadmap'}
            <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 text-[#777187] hover:text-[#352B48] rounded hover:bg-[#FFE2CC]/60 transition-colors"
            title="Dismiss notice"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-[#FFE2CC]/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
          <div className="bg-white/80 rounded-lg p-2 border border-white/60">
            <span className="font-bold text-[#31966B]">✓ Stage 1 (Current)</span>
            <p className="text-[#777187] mt-0.5">Frontend UX, pastel design system, page routes, local interactive quiz & flashcards.</p>
          </div>
          <div className="bg-white/60 rounded-lg p-2 border border-white/40">
            <span className="font-bold text-[#9274E8]">Stage 2 (Upcoming)</span>
            <p className="text-[#777187] mt-0.5">Firebase Authentication, Google Sign-In, password reset, and session security.</p>
          </div>
          <div className="bg-white/60 rounded-lg p-2 border border-white/40">
            <span className="font-bold text-[#9274E8]">Stage 3</span>
            <p className="text-[#777187] mt-0.5">Cloud Firestore database for persistent user profiles, attempts, and streaks.</p>
          </div>
          <div className="bg-white/60 rounded-lg p-2 border border-white/40">
            <span className="font-bold text-[#F08CB4]">Stage 4 & 5</span>
            <p className="text-[#777187] mt-0.5">Server-side Gemini AI generation, real PDF note analysis, live leaderboards & PDF certs.</p>
          </div>
        </div>
      )}
    </aside>
  );
};
