import React from 'react';
import { LucideIcon, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  theme?: 'lavender' | 'mint' | 'peach' | 'blue';
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  theme = 'lavender',
  className = '',
}) => {
  const themeColors = {
    lavender: {
      bg: 'bg-[#E6DFFF]/40',
      iconBg: 'bg-[#E6DFFF]',
      iconText: 'text-[#9274E8]',
      btnBg: 'bg-[#9274E8] hover:bg-[#7e5bd9] text-white',
    },
    mint: {
      bg: 'bg-[#D5F5E3]/40',
      iconBg: 'bg-[#D5F5E3]',
      iconText: 'text-[#31966B]',
      btnBg: 'bg-[#31966B] hover:bg-[#287b57] text-white',
    },
    peach: {
      bg: 'bg-[#FFE2CC]/40',
      iconBg: 'bg-[#FFE2CC]',
      iconText: 'text-[#C95C1E]',
      btnBg: 'bg-[#C95C1E] hover:bg-[#a84c17] text-white',
    },
    blue: {
      bg: 'bg-[#D9EEFF]/40',
      iconBg: 'bg-[#D9EEFF]',
      iconText: 'text-[#2870BD]',
      btnBg: 'bg-[#2870BD] hover:bg-[#1e5999] text-white',
    },
  };

  const style = themeColors[theme];

  return (
    <div
      className={`p-8 sm:p-12 text-center rounded-3xl border border-dashed border-[#E6DFFF] ${style.bg} ${className}`}
    >
      <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center shadow-soft mb-4 bg-white">
        <div className={`w-10 h-10 rounded-xl ${style.iconBg} ${style.iconText} flex items-center justify-center`}>
          <Icon className="w-5 h-5 stroke-[2]" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-[#352B48] font-heading">{title}</h3>
      <p className="text-xs sm:text-sm text-[#777187] max-w-md mx-auto mt-1.5 leading-relaxed">
        {description}
      </p>

      {(actionLabel || secondaryActionLabel) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold shadow-soft transition-all cursor-pointer flex items-center gap-1.5 ${style.btnBg}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{actionLabel}</span>
            </button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-white text-[#352B48] border border-[#E6DFFF] hover:bg-[#E6DFFF]/30 transition-all cursor-pointer"
            >
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
