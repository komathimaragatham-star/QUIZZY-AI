import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  TrendingUp,
  Flame,
  BookOpen,
  PlusCircle,
  Layers,
  Swords,
  Search,
  Bell,
  Sparkles,
  Trophy,
  ArrowRight,
  Target,
  Clock,
} from 'lucide-react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { StatCard } from '../components/common/StatCard';
import { EmptyState } from '../components/common/EmptyState';
import { PageId, LeaderboardEntry } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface DashboardPageProps {
  onNavigate: (page: PageId, extra?: any) => void;
  onShowToast: (title: string, description?: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onShowToast,
}) => {
  const { profile, progress, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [liveLeaderboard, setLiveLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Fetch real top leaderboard records from Firestore
  useEffect(() => {
    const fetchTopLeaderboard = async () => {
      try {
        const q = query(collection(db, 'leaderboard'), orderBy('points', 'desc'), limit(4));
        const snap = await getDocs(q);
        const entries: LeaderboardEntry[] = [];
        let rankCounter = 1;
        snap.forEach((docSnap) => {
          entries.push({
            ...(docSnap.data() as LeaderboardEntry),
            rank: rankCounter++,
          });
        });
        setLiveLeaderboard(entries);
      } catch (err) {
        console.warn('Could not fetch leaderboard:', err);
      }
    };
    fetchTopLeaderboard();
  }, []);

  const totalQuizzes = progress?.totalQuizzesCompleted ?? 0;
  const avgScore = progress?.averageAccuracy ?? 0;
  const currentStreak = progress?.currentStreakDays ?? 0;
  const topicsCount = progress?.topicMastery ? Object.keys(progress.topicMastery).length : 0;
  const firstName = profile?.fullName ? profile.fullName.split(' ')[0] : 'Student';

  const topicsList = progress?.topicMastery ? Object.entries(progress.topicMastery) : [];
  const filteredTopics = topicsList.filter(([topicName]) =>
    topicName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Bar with Greeting, Search & Notifications */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E6DFFF]/50 dark:border-[#332A4C]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#352B48] dark:text-[#F5F1FD] font-heading">
              Ready to learn something new, {firstName}?
            </h1>
            <span className="text-xl">✨</span>
          </div>
          <p className="text-xs text-[#777187] dark:text-[#A8A1BC] mt-0.5">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}{' '}
            · Your personal educational dashboard
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-[#777187] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search practiced topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#1F1930] rounded-xl border border-[#E6DFFF] dark:border-[#332A4C] text-xs focus:outline-none focus:ring-2 focus:ring-[#9274E8] dark:text-white transition-all"
            />
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 bg-white dark:bg-[#1F1930] rounded-xl border border-[#E6DFFF] dark:border-[#332A4C] text-[#352B48] dark:text-white hover:bg-[#E6DFFF]/30 transition-all cursor-pointer"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4 text-[#777187]" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#1F1930] rounded-2xl shadow-soft-lg border border-[#E6DFFF] dark:border-[#332A4C] p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between pb-2 border-b border-[#E6DFFF]/50 dark:border-[#332A4C]">
                  <span className="text-xs font-bold text-[#352B48] dark:text-white">Notifications</span>
                  <span className="text-[10px] text-[#777187]">Up to date</span>
                </div>
                <div className="py-4 text-center text-xs text-[#777187]">
                  No unread notifications at this time.
                </div>
              </div>
            )}
          </div>

          {/* Avatar button */}
          <button
            onClick={() => onNavigate('profile')}
            className="w-9 h-9 rounded-full bg-[#E6DFFF] dark:bg-[#332A4C] text-[#9274E8] dark:text-[#A78BFA] font-bold text-xs flex items-center justify-center border-2 border-[#9274E8]/40 hover:ring-2 hover:ring-[#9274E8] transition-all cursor-pointer shrink-0"
            title="View Profile"
          >
            {firstName.charAt(0).toUpperCase()}
          </button>
        </div>
      </div>

      {/* 4 SUMMARY STAT CARDS (Real Firestore aggregates, isDemo=false) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Quizzes Completed"
          value={totalQuizzes}
          sublabel={totalQuizzes === 0 ? 'No completed quizzes yet' : `${totalQuizzes} verified attempts`}
          icon={CheckCircle2}
          theme="mint"
          isDemo={false}
          onClick={() => onNavigate('progress')}
        />
        <StatCard
          label="Average Score"
          value={totalQuizzes === 0 ? '—' : `${avgScore}%`}
          sublabel={totalQuizzes === 0 ? 'Take your first quiz' : 'Cumulative accuracy'}
          icon={TrendingUp}
          theme="blue"
          isDemo={false}
          onClick={() => onNavigate('progress')}
        />
        <StatCard
          label="Learning Streak"
          value={`${currentStreak} ${currentStreak === 1 ? 'Day' : 'Days'}`}
          sublabel={currentStreak > 0 ? 'Consecutive daily activity' : 'Study today to begin streak'}
          icon={Flame}
          theme="peach"
          isDemo={false}
          onClick={() => onNavigate('progress')}
        />
        <StatCard
          label="Topics Practised"
          value={topicsCount}
          sublabel={topicsCount === 0 ? 'No topics explored yet' : `${topicsCount} unique subjects`}
          icon={Layers}
          theme="lavender"
          isDemo={false}
          onClick={() => onNavigate('create-quiz')}
        />
      </div>

      {/* QUICK ACTION CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigate('create-quiz')}
          className="p-4 rounded-2xl bg-gradient-to-br from-[#FFD6E7]/60 to-[#E6DFFF]/60 dark:from-[#3D2232] dark:to-[#2B2144] border border-[#FFD6E7] dark:border-[#4C3C73] shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5 transition-all text-left flex items-center justify-between group cursor-pointer"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D95370] dark:text-[#FB7185]">
              Practice Mode
            </span>
            <p className="text-sm font-bold text-[#352B48] dark:text-[#F5F1FD] group-hover:text-[#9274E8] dark:group-hover:text-[#A78BFA] transition-colors">
              Create New Quiz
            </p>
            <p className="text-[11px] text-[#777187] dark:text-[#A8A1BC]">Generate questions on any topic</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/80 dark:bg-[#1F1930] text-[#9274E8] dark:text-[#A78BFA] flex items-center justify-center shadow-xs shrink-0">
            <PlusCircle className="w-5 h-5 stroke-[2.2]" />
          </div>
        </button>

        <button
          onClick={() => onNavigate('flashcards')}
          className="p-4 rounded-2xl bg-gradient-to-br from-[#E6DFFF]/60 to-[#D9EEFF]/60 dark:from-[#2B2144] dark:to-[#1A2F45] border border-[#E6DFFF] dark:border-[#4C3C73] shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5 transition-all text-left flex items-center justify-between group cursor-pointer"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9274E8] dark:text-[#A78BFA]">
              Memory & Recall
            </span>
            <p className="text-sm font-bold text-[#352B48] dark:text-[#F5F1FD] group-hover:text-[#9274E8] dark:group-hover:text-[#A78BFA] transition-colors">
              Study Flashcards
            </p>
            <p className="text-[11px] text-[#777187] dark:text-[#A8A1BC]">Interactive 3D flip study cards</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/80 dark:bg-[#1F1930] text-[#9274E8] dark:text-[#A78BFA] flex items-center justify-center shadow-xs shrink-0">
            <Layers className="w-5 h-5 stroke-[2.2]" />
          </div>
        </button>

        <button
          onClick={() => onNavigate('contests')}
          className="p-4 rounded-2xl bg-gradient-to-br from-[#FFE2CC]/60 to-[#FFF1B8]/60 dark:from-[#3D291F] dark:to-[#3D351A] border border-[#FFE2CC] dark:border-[#4C3C73] shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5 transition-all text-left flex items-center justify-between group cursor-pointer"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C95C1E] dark:text-[#FCD34D]">
              Global Arena
            </span>
            <p className="text-sm font-bold text-[#352B48] dark:text-[#F5F1FD] group-hover:text-[#C95C1E] dark:group-hover:text-[#FCD34D] transition-colors">
              Weekly Contests
            </p>
            <p className="text-[11px] text-[#777187] dark:text-[#A8A1BC]">Compete in live timed events</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/80 dark:bg-[#1F1930] text-[#C95C1E] dark:text-[#FCD34D] flex items-center justify-center shadow-xs shrink-0">
            <Swords className="w-5 h-5 stroke-[2.2]" />
          </div>
        </button>
      </div>

      {/* ZERO QUIZZES EMPTY STATE FOR NEW STUDENTS */}
      {totalQuizzes === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={`Welcome to Quizzy AI, ${firstName}!`}
          description="You have not completed any quizzes yet. Choose a topic like Solar System, Python, or Mathematics to test your knowledge, earn points, and build your learning streak."
          actionLabel="Create Your First Quiz"
          onAction={() => onNavigate('create-quiz')}
          secondaryActionLabel="Explore Smart Flashcards"
          onSecondaryAction={() => onNavigate('flashcards')}
          theme="lavender"
        />
      ) : (
        /* MAIN 2-COLUMN SPLIT: Analytics & Recent Topics vs Side Widgets */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 8 Cols: Topics Practiced */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white dark:bg-[#1F1930] rounded-3xl p-6 border border-[#E6DFFF] dark:border-[#332A4C] shadow-soft">
              <div className="flex items-center justify-between pb-3 border-b border-[#E6DFFF]/50 dark:border-[#332A4C]">
                <div>
                  <h3 className="text-base font-bold text-[#352B48] dark:text-[#F5F1FD] font-heading">
                    Topics Practised
                  </h3>
                  <p className="text-xs text-[#777187] dark:text-[#A8A1BC]">Real mastery computed from your completed attempts</p>
                </div>
                <button
                  onClick={() => onNavigate('create-quiz')}
                  className="text-xs font-bold text-[#9274E8] dark:text-[#A78BFA] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Practice New Topic</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {filteredTopics.map(([topicName, stats]) => (
                  <div
                    key={topicName}
                    className="p-4 rounded-2xl border border-[#E6DFFF] dark:border-[#332A4C] bg-[#FFFAFD] dark:bg-[#151120] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-[#352B48] dark:text-[#F5F1FD]">
                        {topicName}
                      </h4>
                      <p className="text-[11px] text-[#777187] dark:text-[#A8A1BC] mt-0.5">
                        {stats.attempts} {stats.attempts === 1 ? 'attempt' : 'attempts'} completed
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 self-end sm:self-auto">
                      <span className="text-xs font-bold text-[#352B48] dark:text-[#F5F1FD] bg-white dark:bg-[#1F1930] px-2.5 py-1 rounded-lg border border-black/5 dark:border-white/10">
                        {stats.mastery}% Mastery
                      </span>
                      <button
                        onClick={() => onNavigate('quiz-player', { topic: topicName })}
                        className="px-3 py-1.5 bg-[#9274E8] text-white text-xs font-bold rounded-xl shadow-soft hover:bg-[#7e5bd9] transition-all cursor-pointer"
                      >
                        Practice Again
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right 4 Cols: Daily Goal & Real Leaderboard Preview */}
          <div className="lg:col-span-4 space-y-6">
            {/* Daily Goal Card */}
            <div className="bg-gradient-to-br from-[#FFE2CC]/50 via-[#FFF1B8]/40 to-white dark:from-[#3D291F] dark:to-[#1F1930] rounded-3xl p-6 border border-[#FFE2CC] dark:border-[#4C3C73] shadow-soft">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-[#FFE2CC] dark:bg-[#1F1930] text-[#C95C1E]">
                    <Target className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-[#352B48] dark:text-[#F5F1FD] font-heading">Daily Study Goal</span>
                </div>
                <span className="text-xs font-bold text-[#C95C1E] tabular-nums">
                  {totalQuizzes > 0 ? '1 / 3' : '0 / 3'}
                </span>
              </div>
              <p className="text-xs text-[#777187] dark:text-[#A8A1BC] mt-3 leading-relaxed">
                Complete practice quizzes to maintain your daily study streak and climb the standings.
              </p>
            </div>

            {/* Live Leaderboard Standings Preview */}
            <div className="bg-white dark:bg-[#1F1930] rounded-3xl p-6 border border-[#E6DFFF] dark:border-[#332A4C] shadow-soft">
              <div className="flex items-center justify-between pb-3 border-b border-[#E6DFFF]/50 dark:border-[#332A4C]">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#B8860B]" />
                  <h3 className="text-xs font-bold text-[#352B48] dark:text-[#F5F1FD] font-heading">
                    Leaderboard
                  </h3>
                </div>
                <button
                  onClick={() => onNavigate('leaderboard')}
                  className="text-[11px] font-bold text-[#9274E8] dark:text-[#A78BFA] hover:underline cursor-pointer"
                >
                  Full Board →
                </button>
              </div>

              {liveLeaderboard.length === 0 ? (
                <p className="py-4 text-center text-xs text-[#777187]">
                  No recorded student points yet. Be the first to earn points!
                </p>
              ) : (
                <div className="mt-3 divide-y divide-[#E6DFFF]/40 dark:divide-[#332A4C]">
                  {liveLeaderboard.map((entry) => (
                    <div key={entry.userId} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] bg-[#E6DFFF] dark:bg-[#332A4C] text-[#9274E8]">
                          #{entry.rank}
                        </span>
                        <div className="truncate">
                          <p className="font-bold text-[#352B48] dark:text-[#F5F1FD] truncate">
                            {entry.displayName} {entry.userId === user?.uid && '(You)'}
                          </p>
                          <p className="text-[10px] text-[#777187] dark:text-[#A8A1BC]">{entry.accuracy}% accuracy</p>
                        </div>
                      </div>
                      <span className="font-bold text-[#9274E8] dark:text-[#A78BFA] tabular-nums shrink-0">
                        {entry.points} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
