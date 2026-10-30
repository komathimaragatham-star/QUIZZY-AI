import React from 'react';
import { Sparkles, BookOpen } from 'lucide-react';

interface QuizzyLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export const QuizzyLogo: React.FC<QuizzyLogoProps> = ({
  size = 'md',
  showSubtitle = false,
  className = '',
}) => {
  const iconSizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const textClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div
        className={`${iconSizeClasses[size]} relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-[#9274E8] via-[#F08CB4] to-[#FFD6E7] text-white shadow-soft font-bold overflow-hidden shrink-0 border border-white/60`}
      >
        <BookOpen className="w-4/7 h-4/7 stroke-[2.2] text-white" />
        <span className="absolute -top-1 -right-1 text-[#FFF1B8]">
          <Sparkles className="w-3.5 h-3.5 fill-[#FFF1B8]" />
        </span>
      </div>
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1.5">
          <span className={`font-extrabold tracking-tight text-[#352B48] dark:text-white transition-colors ${textClasses[size]} font-heading`}>
            Quizzy<span className="text-[#9274E8] dark:text-[#C084FC]">AI</span>
          </span>
          <span className="text-[10px] font-bold text-[#7C5CE0] dark:text-[#E9D5FF] bg-[#E6DFFF] dark:bg-[#332A4C] border border-[#C4B5FD]/70 dark:border-[#4C3C73] px-1.5 py-0.5 rounded-md transition-colors">
            v1.0
          </span>
        </div>
        {showSubtitle && (
          <span className="text-xs text-[#777187] dark:text-[#C4BDD8] font-medium tracking-normal mt-0.5 transition-colors">
            Smart Learning Platform
          </span>
        )}
      </div>
    </div>
  );
};
