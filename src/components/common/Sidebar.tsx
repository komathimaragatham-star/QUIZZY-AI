import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Layers,
  TrendingUp,
  Trophy,
  Swords,
  Award,
  UserCheck,
  Flame,
  Home,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react';
import { QuizzyLogo } from './QuizzyLogo';
import { PageId, UserProfile, UserProgress } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  profile: UserProfile | null;
  progress: UserProgress | null;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  profile,
  progress,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { logoutUser } = useAuth();
  const { effectiveMode, setColorMode } = useTheme();

  const toggleTheme = () => {
    setColorMode(effectiveMode === 'dark' ? 'light' : 'dark');
  };

  const navItems: { id: PageId; label: string; icon: React.FC<{ className?: string }>; badge?: string; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'create-quiz', label: 'Create Quiz', icon: PlusCircle, badge: 'New', badgeColor: 'bg-[#D5F5E3] text-[#31966B]' },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'progress', label: 'My Progress', icon: TrendingUp },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'contests', label: 'Weekly Contests', icon: Swords },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'profile', label: 'Profile & Settings', icon: UserCheck },
  ];

  const currentStreak = progress?.currentStreakDays ?? 0;
  const totalPoints = progress?.totalEarnedPoints ?? 0;
  const displayName = profile?.fullName || 'Student';
  const username = profile?.username ? `@${profile.username}` : '';

  return (
    <aside
      className={`relative flex flex-col bg-white dark:bg-[#1F1930] border-r border-[#E6DFFF]/70 dark:border-[#332A4C] h-screen sticky top-0 transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-18 flex items-center justify-between px-4 border-b border-[#E6DFFF]/40 dark:border-[#332A4C]">
        {!isCollapsed ? (
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2 cursor-pointer focus:outline-none"
            title="Go to Landing Page"
          >
            <QuizzyLogo size="sm" />
          </button>
        ) : (
          <button
            onClick={() => onNavigate('landing')}
            className="mx-auto cursor-pointer focus:outline-none"
            title="Quizzy AI Home"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#9274E8] to-[#F08CB4] flex items-center justify-center text-white font-bold text-xs">
              Q
            </div>
          </button>
        )}

        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 text-[#777187] dark:text-[#A8A1BC] hover:text-[#352B48] dark:hover:text-white hover:bg-[#E6DFFF]/40 dark:hover:bg-[#151120] rounded-lg transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Streak & XP Callout (Reflects REAL User Progress from Firestore) */}
      {!isCollapsed ? (
        <div className="mx-3 my-3 p-2.5 rounded-xl bg-gradient-to-r from-[#FFE2CC]/60 to-[#FFF1B8]/60 dark:from-[#3D291F] dark:to-[#3D351A] border border-[#FFE2CC] dark:border-[#4C3C73] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#FFE2CC] dark:bg-[#1F1930] text-[#A6511A] dark:text-[#FFC79E]">
              <Flame className="w-4 h-4 fill-[#F08CB4] text-[#A6511A]" />
            </span>
            <div>
              <p className="text-[11px] font-bold text-[#352B48] dark:text-[#F5F1FD] leading-none">
                {currentStreak} Day Streak
              </p>
              <p className="text-[10px] text-[#777187] dark:text-[#A8A1BC] leading-none mt-0.5">
                {currentStreak > 0 ? 'Active study habit' : 'Complete quiz to start'}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-white/80 dark:bg-[#1F1930] rounded text-[#352B48] dark:text-[#F5F1FD] tabular-nums">
            {totalPoints} XP
          </span>
        </div>
      ) : (
        <div className="my-2 flex justify-center" title={`${currentStreak} Day Streak`}>
          <div className="p-2 rounded-xl bg-[#FFE2CC]/70 dark:bg-[#3D291F] text-[#A6511A]">
            <Flame className="w-4 h-4 fill-[#F08CB4]" />
          </div>
        </div>
      )}

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-1 py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#E6DFFF] dark:bg-[#332A4C] text-[#352B48] dark:text-white shadow-sm font-bold'
                  : 'text-[#777187] dark:text-[#A8A1BC] hover:text-[#352B48] dark:hover:text-white hover:bg-[#FFD6E7]/25 dark:hover:bg-[#151120]'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform ${
                  isActive ? 'text-[#9274E8] dark:text-[#A78BFA] scale-105' : 'text-[#777187] dark:text-[#A8A1BC]'
                }`}
              />
              {!isCollapsed && (
                <>
                  <span className="truncate flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Profile Snippet */}
      <div className="p-2 border-t border-[#E6DFFF]/40 dark:border-[#332A4C]">
        {!isCollapsed ? (
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-[#FFD6E7]/20 dark:hover:bg-[#151120] transition-colors">
            <button
              onClick={() => onNavigate('profile')}
              className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-[#E6DFFF] dark:bg-[#332A4C] text-[#9274E8] dark:text-[#A78BFA] font-bold text-xs flex items-center justify-center shrink-0 border border-[#9274E8]/30">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#352B48] dark:text-[#F5F1FD] truncate">{displayName}</p>
                <p className="text-[10px] text-[#777187] dark:text-[#A8A1BC] truncate">{username}</p>
              </div>
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleTheme}
                className="p-1.5 text-[#777187] hover:text-[#9274E8] dark:hover:text-[#FDE047] rounded-lg transition-colors cursor-pointer"
                title={`Switch to ${effectiveMode === 'dark' ? 'Light' : 'Dark'} mode`}
                aria-label="Toggle theme"
              >
                {effectiveMode === 'dark' ? <Sun className="w-4 h-4 text-[#FDE047]" /> : <Moon className="w-4 h-4 text-[#9274E8]" />}
              </button>
              <button
                onClick={() => logoutUser()}
                className="p-1.5 text-[#777187] hover:text-[#D95370] rounded-lg transition-colors cursor-pointer"
                title="Sign Out"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => onNavigate('profile')}
            className="w-full flex justify-center py-2 cursor-pointer"
            title={`${displayName} (${username})`}
          >
            <div className="w-8 h-8 rounded-full bg-[#E6DFFF] dark:bg-[#332A4C] text-[#9274E8] font-bold text-xs flex items-center justify-center border border-[#9274E8]/30">
              {displayName.charAt(0).toUpperCase()}
            </div>
          </button>
        )}
      </div>
    </aside>
  );
};
