import React, { useState } from 'react';
import { Menu, X, ArrowRight, User, LogOut, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { QuizzyLogo } from './QuizzyLogo';
import { PageId } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

interface HeaderProps {
  currentPage: PageId;
  onNavigate: (page: PageId, extra?: { accountTab?: 'login' | 'register' }) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate }) => {
  const { user, profile, logoutUser } = useAuth();
  const { effectiveMode, setColorMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    setColorMode(effectiveMode === 'dark' ? 'light' : 'dark');
  };

  const handleNavClick = (page: PageId, extra?: { accountTab?: 'login' | 'register' }) => {
    setMobileMenuOpen(false);
    onNavigate(page, extra);
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (currentPage !== 'landing') {
      onNavigate('landing');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFFAFD]/90 dark:bg-[#151120]/90 backdrop-blur-md border-b border-[#E6DFFF]/60 dark:border-[#332A4C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Brand wordmark */}
        <button
          onClick={() => handleNavClick('landing')}
          className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9274E8] rounded-xl"
          aria-label="Quizzy AI Home"
        >
          <QuizzyLogo size="md" />
        </button>

        {/* Zone 2: Navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#777187] dark:text-[#A8A1BC]">
          <button
            onClick={() => scrollToSection('features')}
            className="hover:text-[#352B48] dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="hover:text-[#352B48] dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            How It Works
          </button>
          {user ? (
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`hover:text-[#352B48] dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
                currentPage === 'dashboard' ? 'text-[#9274E8] dark:text-[#A78BFA] font-bold' : ''
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
          ) : (
            <button
              onClick={() => handleNavClick('dashboard')}
              className="hover:text-[#352B48] dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Dashboard
            </button>
          )}
        </nav>

        {/* Zone 3: Primary action / Auth controls + Theme Toggle */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          {/* Segmented Light / Dark Mode Toggle */}
          <div className="flex items-center p-1 rounded-2xl border border-[#E6DFFF] dark:border-[#332A4C] bg-white/90 dark:bg-[#1F1930] shadow-xs">
            <button
              onClick={() => setColorMode('light')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                effectiveMode === 'light'
                  ? 'bg-gradient-to-r from-[#FFD6E7] to-[#E6DFFF] text-[#352B48] shadow-xs'
                  : 'text-[#777187] hover:text-[#352B48] dark:text-[#A8A1BC]'
              }`}
              title="Light Mode (Pastel Watercolor)"
              aria-label="Switch to Light Theme"
            >
              <Sun className={`w-3.5 h-3.5 ${effectiveMode === 'light' ? 'text-[#D95370] fill-[#FFF1B8]' : 'text-[#777187]'}`} />
              <span>Light</span>
            </button>
            <button
              onClick={() => setColorMode('dark')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                effectiveMode === 'dark'
                  ? 'bg-[#332A4C] text-[#FDE047] shadow-xs'
                  : 'text-[#777187] hover:text-[#352B48] dark:text-[#A8A1BC] dark:hover:text-white'
              }`}
              title="Dark Mode (Elegant Dark Lavender)"
              aria-label="Switch to Dark Theme"
            >
              <Moon className={`w-3.5 h-3.5 ${effectiveMode === 'dark' ? 'text-[#FDE047] fill-[#FDE047]' : 'text-[#777187]'}`} />
              <span>Dark</span>
            </button>
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNavClick('profile')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[#E6DFFF]/30 dark:hover:bg-[#1F1930] transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-[#E6DFFF] dark:bg-[#332A4C] text-[#9274E8] dark:text-[#A78BFA] font-bold text-xs flex items-center justify-center">
                  {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-xs font-semibold text-[#352B48] dark:text-[#F5F1FD]">
                  {profile?.fullName || user.email?.split('@')[0]}
                </span>
              </button>
              <button
                onClick={() => logoutUser()}
                className="p-2 text-[#777187] hover:text-[#D95370] rounded-xl hover:bg-[#FFD6E7]/30 transition-colors cursor-pointer"
                title="Sign Out"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => handleNavClick('account', { accountTab: 'login' })}
                className="px-4 py-2 text-xs font-semibold text-[#352B48] dark:text-[#F5F1FD] hover:text-[#9274E8] hover:bg-[#E6DFFF]/40 rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer"
              >
                Log In
              </button>
              <button
                onClick={() => handleNavClick('account', { accountTab: 'register' })}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#9274E8] hover:bg-[#7e5bd9] active:bg-[#6b47c6] shadow-pastel-purple rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Create Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        {/* Mobile controls (Theme Toggle + User icon + Menu button) */}
        <div className="flex sm:hidden items-center gap-1.5">
          <div className="flex items-center p-0.5 rounded-xl border border-[#E6DFFF] dark:border-[#332A4C] bg-white dark:bg-[#1F1930]">
            <button
              onClick={() => setColorMode('light')}
              className={`p-1.5 rounded-lg transition-all ${
                effectiveMode === 'light' ? 'bg-[#FFD6E7] text-[#D95370]' : 'text-[#777187] dark:text-[#A8A1BC]'
              }`}
              title="Light theme"
              aria-label="Light theme"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setColorMode('dark')}
              className={`p-1.5 rounded-lg transition-all ${
                effectiveMode === 'dark' ? 'bg-[#332A4C] text-[#FDE047]' : 'text-[#777187] dark:text-[#A8A1BC]'
              }`}
              title="Dark theme"
              aria-label="Dark theme"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {user ? (
            <button
              onClick={() => handleNavClick('dashboard')}
              className="p-2 text-xs font-medium text-[#9274E8]"
              aria-label="Student Dashboard"
            >
              <LayoutDashboard className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => handleNavClick('account', { accountTab: 'login' })}
              className="p-2 text-xs font-medium text-[#352B48] dark:text-[#F5F1FD]"
              aria-label="Account Login"
            >
              <User className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#352B48] dark:text-[#F5F1FD] hover:bg-[#E6DFFF]/40 rounded-xl transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-[#E6DFFF]/60 dark:border-[#332A4C] bg-[#FFFAFD] dark:bg-[#151120] px-4 pt-3 pb-5 space-y-3 shadow-soft-lg animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => scrollToSection('features')}
              className="text-left py-2.5 px-3 rounded-lg text-sm font-medium text-[#352B48] dark:text-[#F5F1FD] hover:bg-[#E6DFFF]/40"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-left py-2.5 px-3 rounded-lg text-sm font-medium text-[#352B48] dark:text-[#F5F1FD] hover:bg-[#E6DFFF]/40"
            >
              How It Works
            </button>
            {user ? (
              <button
                onClick={() => handleNavClick('dashboard')}
                className="text-left py-2.5 px-3 rounded-lg text-sm font-medium text-[#9274E8] dark:text-[#A78BFA] hover:bg-[#E6DFFF]/40"
              >
                Dashboard
              </button>
            ) : null}
          </div>

          <div className="pt-2 border-t border-[#E6DFFF]/40 dark:border-[#332A4C] flex flex-col gap-2">
            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logoutUser();
                }}
                className="w-full py-2.5 px-3 text-center text-xs font-semibold text-[#D95370] bg-[#FFD6E7]/30 rounded-xl"
              >
                Sign Out
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleNavClick('account', { accountTab: 'login' })}
                  className="w-full py-2.5 px-3 text-center text-xs font-semibold text-[#352B48] dark:text-[#F5F1FD] bg-white dark:bg-[#1F1930] border border-[#E6DFFF] dark:border-[#332A4C] rounded-xl hover:bg-[#E6DFFF]/30"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleNavClick('account', { accountTab: 'register' })}
                  className="w-full py-2.5 px-3 text-center text-xs font-semibold text-white bg-[#9274E8] rounded-xl shadow-pastel-purple hover:bg-[#7e5bd9]"
                >
                  Create Account
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
