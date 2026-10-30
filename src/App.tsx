/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  PageId,
  AccountTab,
  QuizSettings,
  ToastMessage,
} from './types';

// Contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

// Common components
import { Sidebar } from './components/common/Sidebar';
import { ToastContainer } from './components/common/Toast';
import { QuizzyLogo } from './components/common/QuizzyLogo';
import { FirebaseConfigAlert } from './components/common/FirebaseConfigAlert';
import { GoogleProfileCompletionModal } from './components/auth/GoogleProfileCompletionModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { AccountPage } from './pages/AccountPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreateQuizPage } from './pages/CreateQuizPage';
import { QuizPlayerPage } from './pages/QuizPlayerPage';
import { FlashcardsPage } from './pages/FlashcardsPage';
import { ProgressPage } from './pages/ProgressPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ContestsPage } from './pages/ContestsPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { ProfilePage } from './pages/ProfilePage';

// Icons
import {
  Menu,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';

function AppContent() {
  const { user, profile, progress, loading, needsProfileCompletion } = useAuth();
  const { effectiveMode, setColorMode } = useTheme();

  const [currentPage, setCurrentPage] = useState<PageId>('landing');
  const [accountInitialTab, setAccountInitialTab] = useState<AccountTab>('register');
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<PageId>('dashboard');
  const [activeQuizSettings, setActiveQuizSettings] = useState<QuizSettings | undefined>(undefined);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast handler
  const showToast = (
    title: string,
    description?: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    const newToast: ToastMessage = { id, title, description, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Protected pages list
  const isProtectedPage = (page: PageId) => {
    return page !== 'landing' && page !== 'account';
  };

  // Navigation router with protected route guards
  const handleNavigate = (
    page: PageId,
    extra?: { accountTab?: AccountTab; topic?: string; sourceFileName?: string }
  ) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileSidebarOpen(false);

    // If unauthenticated visitor tries to access a protected page
    if (isProtectedPage(page) && !user) {
      setRedirectAfterLogin(page);
      setAccountInitialTab(extra?.accountTab || 'login');
      setCurrentPage('account');
      showToast('Authentication Required', 'Please log in or create an account to access student tools.', 'info');
      return;
    }

    if (page === 'account' && extra?.accountTab) {
      setAccountInitialTab(extra.accountTab);
    }

    if (extra?.topic) {
      setActiveQuizSettings({
        topic: extra.topic,
        numQuestions: 5,
        difficulty: 'Medium',
        learningLevel: 'High School',
        questionType: 'Multiple Choice',
        sourceFileName: extra.sourceFileName,
      });
    }

    setCurrentPage(page);
  };

  // When user is authenticated and visits /account, redirect to dashboard or preserved destination
  useEffect(() => {
    if (user && currentPage === 'account') {
      setCurrentPage(redirectAfterLogin || 'dashboard');
    }
  }, [user, currentPage, redirectAfterLogin]);

  // When user signs out, ensure protected pages bounce back to landing
  useEffect(() => {
    if (!user && isProtectedPage(currentPage) && !loading) {
      setCurrentPage('landing');
    }
  }, [user, currentPage, loading]);

  const handleLaunchQuiz = (settings: QuizSettings) => {
    if (!user) {
      setRedirectAfterLogin('create-quiz');
      setAccountInitialTab('login');
      setCurrentPage('account');
      showToast('Login Required', 'Please sign in to take interactive quizzes and save your scores.', 'info');
      return;
    }
    setActiveQuizSettings(settings);
    setCurrentPage('quiz-player');
    showToast(
      'Practice Quiz Started',
      `Loading questions for "${settings.topic}". Good luck!`,
      'info'
    );
  };

  // Loading Screen while Firebase checks initial authentication state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFAFD] dark:bg-[#151120] text-[#352B48] dark:text-[#F5F1FD]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#9274E8] to-[#F08CB4] flex items-center justify-center text-white shadow-pastel-purple animate-pulse">
            <Sparkles className="w-6 h-6 fill-white" />
          </div>
          <div className="space-y-1 text-center">
            <p className="text-sm font-bold font-heading">Quizzy AI</p>
            <p className="text-xs text-[#777187] dark:text-[#A8A1BC]">Connecting to secure learning session...</p>
          </div>
        </div>
      </div>
    );
  }

  const isDashboardApp = isProtectedPage(currentPage) && user !== null;

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${effectiveMode === 'dark' ? 'dark' : ''}`}>
      {/* Firebase setup notice if config is missing */}
      <FirebaseConfigAlert />

      {/* Google profile completion modal if mandatory phone/username missing */}
      {needsProfileCompletion && (
        <GoogleProfileCompletionModal onShowToast={showToast} />
      )}

      {/* Public Pages Layout */}
      {!isDashboardApp ? (
        <div className="flex-1 flex flex-col">
          {currentPage === 'landing' && <LandingPage onNavigate={handleNavigate} />}
          {currentPage === 'account' && (
            <AccountPage
              initialTab={accountInitialTab}
              redirectAfterLogin={redirectAfterLogin}
              onNavigate={handleNavigate}
              onShowToast={showToast}
            />
          )}
        </div>
      ) : (
        /* Protected Student Application Layout */
        <div className="flex-1 flex flex-row min-h-screen relative bg-[#FFFAFD] dark:bg-[#151120] text-[#352B48] dark:text-[#F5F1FD]">
          {/* Atmospheric Pastel Watercolor Clouds Reference Backdrop */}
          <div
            className="fixed inset-0 pointer-events-none -z-10 opacity-20 dark:opacity-5 bg-cover bg-center mix-blend-multiply dark:mix-blend-overlay transition-opacity duration-300"
            style={{ backgroundImage: "url('/assets/aistudio/image_529d6d49.png')" }}
          />

          {/* Desktop Sidebar */}
          <div className="hidden lg:block shrink-0">
            <Sidebar
              currentPage={currentPage}
              onNavigate={handleNavigate}
              profile={profile}
              progress={progress}
              isCollapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
          </div>

          {/* Mobile Sidebar Overlay Drawer */}
          {mobileSidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              <div
                className="fixed inset-0 bg-[#352B48]/40 backdrop-blur-sm"
                onClick={() => setMobileSidebarOpen(false)}
              />
              <div className="relative w-64 bg-white dark:bg-[#1F1930] h-full z-10 shadow-soft-lg animate-in slide-in-from-left duration-200">
                <Sidebar
                  currentPage={currentPage}
                  onNavigate={handleNavigate}
                  profile={profile}
                  progress={progress}
                  isCollapsed={false}
                  onToggleCollapse={() => setMobileSidebarOpen(false)}
                />
              </div>
            </div>
          )}

          {/* Application Content Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
            {/* Mobile / Tablet Top Header */}
            <div className="lg:hidden h-16 bg-white dark:bg-[#1F1930] border-b border-[#E6DFFF] dark:border-[#332A4C] px-4 flex items-center justify-between sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileSidebarOpen(true)}
                  className="p-2 text-[#352B48] dark:text-[#F5F1FD] hover:bg-[#E6DFFF]/40 dark:hover:bg-[#151120] rounded-xl cursor-pointer"
                  aria-label="Open navigation menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <QuizzyLogo size="sm" />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center p-0.5 rounded-xl border border-[#E6DFFF] dark:border-[#332A4C] bg-white dark:bg-[#151120]">
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

                <button
                  onClick={() => handleNavigate('profile')}
                  className="w-8 h-8 rounded-full bg-[#E6DFFF] dark:bg-[#332A4C] text-[#9274E8] dark:text-[#A78BFA] font-bold text-xs flex items-center justify-center border border-[#9274E8]/40"
                  aria-label="View profile"
                >
                  {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
                </button>
              </div>
            </div>

            {/* Inner Page Router Container */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              {currentPage === 'dashboard' && (
                <DashboardPage
                  onNavigate={handleNavigate}
                  onShowToast={showToast}
                />
              )}
              {currentPage === 'create-quiz' && (
                <CreateQuizPage
                  onNavigate={handleNavigate}
                  onShowToast={showToast}
                  onLaunchQuiz={handleLaunchQuiz}
                />
              )}
              {currentPage === 'quiz-player' && (
                <QuizPlayerPage
                  settings={activeQuizSettings}
                  onNavigate={handleNavigate}
                  onShowToast={showToast}
                />
              )}
              {currentPage === 'flashcards' && (
                <FlashcardsPage onNavigate={handleNavigate} onShowToast={showToast} />
              )}
              {currentPage === 'progress' && (
                <ProgressPage
                  onNavigate={handleNavigate}
                  onShowToast={showToast}
                />
              )}
              {currentPage === 'leaderboard' && (
                <LeaderboardPage onNavigate={handleNavigate} onShowToast={showToast} />
              )}
              {currentPage === 'contests' && (
                <ContestsPage onNavigate={handleNavigate} onShowToast={showToast} />
              )}
              {currentPage === 'achievements' && (
                <AchievementsPage onNavigate={handleNavigate} onShowToast={showToast} />
              )}
              {currentPage === 'profile' && (
                <ProfilePage
                  onNavigate={handleNavigate}
                  onShowToast={showToast}
                />
              )}
            </main>
          </div>
        </div>
      )}

      {/* Floating Toast Notification Stack */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
