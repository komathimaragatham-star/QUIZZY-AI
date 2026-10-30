import React from 'react';
import { LucideIcon } from 'lucide-react';

export type PastelColorTheme = 'mint' | 'blue' | 'peach' | 'lavender' | 'pink' | 'yellow';

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: LucideIcon;
  theme: PastelColorTheme;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  isDemo?: boolean;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  sublabel,
  icon: Icon,
  theme,
  trend,
  isDemo = true,
  onClick,
}) => {
  const themeStyles: Record<
    PastelColorTheme,
    { bg: string; border: string; iconBg: string; iconColor: string }
  > = {
    mint: {
      bg: 'bg-[#D5F5E3]/50 hover:bg-[#D5F5E3]/70',
      border: 'border-[#D5F5E3]',
      iconBg: 'bg-[#D5F5E3]',
      iconColor: 'text-[#31966B]',
    },
    blue: {
      bg: 'bg-[#D9EEFF]/50 hover:bg-[#D9EEFF]/70',
      border: 'border-[#D9EEFF]',
      iconBg: 'bg-[#D9EEFF]',
      iconColor: 'text-[#2870BD]',
    },
    peach: {
      bg: 'bg-[#FFE2CC]/50 hover:bg-[#FFE2CC]/70',
      border: 'border-[#FFE2CC]',
      iconBg: 'bg-[#FFE2CC]',
      iconColor: 'text-[#C95C1E]',
    },
    lavender: {
      bg: 'bg-[#E6DFFF]/50 hover:bg-[#E6DFFF]/70',
      border: 'border-[#E6DFFF]',
      iconBg: 'bg-[#E6DFFF]',
      iconColor: 'text-[#9274E8]',
    },
    pink: {
      bg: 'bg-[#FFD6E7]/50 hover:bg-[#FFD6E7]/70',
      border: 'border-[#FFD6E7]',
      iconBg: 'bg-[#FFD6E7]',
      iconColor: 'text-[#E06496]',
    },
    yellow: {
      bg: 'bg-[#FFF1B8]/50 hover:bg-[#FFF1B8]/70',
      border: 'border-[#FFF1B8]',
      iconBg: 'bg-[#FFF1B8]',
      iconColor: 'text-[#B8860B]',
    },
  };

  const style = themeStyles[theme];

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl border ${style.bg} ${style.border} shadow-soft transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-[#777187] uppercase tracking-wider">
              {label}
            </span>
            {isDemo && (
              <span className="text-[9px] font-medium text-[#777187] bg-white/60 px-1 py-0.2 rounded border border-black/5">
                demo
              </span>
            )}
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#352B48] tabular-nums font-heading tracking-tight">
            {value}
          </div>
        </div>
        <div className={`p-2.5 rounded-xl ${style.iconBg} ${style.iconColor} shadow-xs`}>
          <Icon className="w-5 h-5 stroke-[2.2]" />
        </div>
      </div>

      {(sublabel || trend) && (
        <div className="mt-3 pt-2 border-t border-black/5 flex items-center justify-between text-xs text-[#777187]">
          {sublabel && <span className="truncate">{sublabel}</span>}
          {trend && (
            <span
              className={`font-semibold tabular-nums ml-auto ${
                trend.isPositive ? 'text-[#31966B]' : 'text-[#D95370]'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
