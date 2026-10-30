import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Crown,
  Search,
} from 'lucide-react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PageId, LeaderboardEntry } from '../types';
import { EmptyState } from '../components/common/EmptyState';
import { useAuth } from '../contexts/AuthContext';

interface LeaderboardPageProps {
  onNavigate: (page: PageId) => void;
  onShowToast: (title: string, description?: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({
  onNavigate,
  onShowToast,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'weekly' | 'all-time'>('weekly');
  const [leaderboardList, setLeaderboardList] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch real leaderboard records from Firestore
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const q = query(collection(db, 'leaderboard'), orderBy('points', 'desc'), limit(50));
        const snap = await getDocs(q);
        const entries: LeaderboardEntry[] = [];
        let r = 1;
        snap.forEach((docSnap) => {
          const data = docSnap.data() as LeaderboardEntry;
          if (data.points > 0 || data.quizzesCompleted > 0) {
            entries.push({
              ...data,
              rank: r++,
              isCurrentUser: data.userId === user?.uid,
            });
          }
        });
        setLeaderboardList(entries);
      } catch (err) {
        console.warn('Could not load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [user]);

  const filteredList = leaderboardList.filter(
    (item) =>
      item.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const top3 = filteredList.slice(0, 3);
  const rank1 = top3[0];
  const rank2 = top3[1];
  const rank3 = top3[2];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E6DFFF]/50 dark:border-[#332A4C]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#FFF1B8] text-[#B8860B]">
              <Trophy className="w-5 h-5 stroke-[2.2]" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#352B48] dark:text-[#F5F1FD] font-heading">
              Student Leaderboard
            </h1>
          </div>
          <p className="text-xs text-[#777187] dark:text-[#A8A1BC] mt-1">
            Real-time student rankings calculated from verified completed quiz attempts.
          </p>
        </div>
      </div>

      {loading ? (
        <p className="py-12 text-center text-xs text-[#777187]">Loading leaderboard records...</p>
      ) : leaderboardList.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No live rankings yet"
          description="Leaderboard standings update dynamically after genuine quiz submissions. Complete a practice quiz to earn points and claim the #1 spot!"
          actionLabel="Start a Quiz to Rank Up"
          onAction={() => onNavigate('create-quiz')}
          theme="peach"
        />
      ) : (
        <>
          {/* Tabs & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center p-1 bg-white dark:bg-[#1F1930] rounded-2xl border border-[#E6DFFF] dark:border-[#332A4C] shadow-xs">
              <button
                onClick={() => setActiveTab('weekly')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'weekly'
                    ? 'bg-[#E6DFFF] dark:bg-[#332A4C] text-[#352B48] dark:text-white shadow-xs'
                    : 'text-[#777187] dark:text-[#A8A1BC] hover:text-[#352B48]'
                }`}
              >
                Weekly Standings
              </button>
              <button
                onClick={() => setActiveTab('all-time')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'all-time'
                    ? 'bg-[#E6DFFF] dark:bg-[#332A4C] text-[#352B48] dark:text-white shadow-xs'
                    : 'text-[#777187] dark:text-[#A8A1BC] hover:text-[#352B48]'
                }`}
              >
                All-Time Records
              </button>
            </div>

            <div className="relative sm:w-64">
              <Search className="w-4 h-4 text-[#777187] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#1F1930] rounded-xl border border-[#E6DFFF] dark:border-[#332A4C] text-xs focus:outline-none focus:ring-2 focus:ring-[#9274E8] dark:text-white"
              />
            </div>
          </div>

          {/* TOP 3 PODIUM DESIGN */}
          {top3.length > 0 && (
            <div className="bg-gradient-to-b from-[#FFFAFD] to-white dark:from-[#151120] dark:to-[#1F1930] rounded-3xl p-6 sm:p-8 border border-[#E6DFFF] dark:border-[#332A4C] shadow-soft">
              <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end max-w-lg mx-auto pt-4 pb-2">
                {/* Rank 2 (Silver) */}
                {rank2 ? (
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-2">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#E6DFFF] dark:bg-[#332A4C] border-2 border-white dark:border-[#4C3C73] shadow-soft flex items-center justify-center text-xl font-bold text-[#9274E8] dark:text-[#A78BFA]">
                        {rank2.displayName.charAt(0).toUpperCase()}
                      </div>
                      <span className="absolute -bottom-2 inset-x-0 mx-auto w-5 h-5 rounded-full bg-[#9274E8] text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
                        2
                      </span>
                    </div>
                    <p className="text-xs font-bold text-[#352B48] dark:text-[#F5F1FD] mt-2 truncate max-w-full">
                      {rank2.displayName}
                    </p>
                    <p className="text-[10px] text-[#777187] dark:text-[#A8A1BC] font-semibold">{rank2.points} pts</p>
                    <div className="w-full h-24 sm:h-28 bg-[#E6DFFF]/50 dark:bg-[#2B2144] rounded-t-2xl mt-3 flex items-center justify-center text-xs font-bold text-[#9274E8] dark:text-[#A78BFA] border-t-2 border-[#9274E8]/40">
                      Silver
                    </div>
                  </div>
                ) : <div />}

                {/* Rank 1 (Gold) */}
                {rank1 && (
                  <div className="flex flex-col items-center text-center -translate-y-2">
                    <Crown className="w-6 h-6 text-[#B8860B] fill-[#FFF1B8] mb-1 animate-bounce" />
                    <div className="relative mb-2">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#FFF1B8] dark:bg-[#3D351A] border-3 border-[#B8860B]/40 shadow-soft-lg flex items-center justify-center text-2xl font-bold text-[#B8860B]">
                        {rank1.displayName.charAt(0).toUpperCase()}
                      </div>
                      <span className="absolute -bottom-2 inset-x-0 mx-auto w-6 h-6 rounded-full bg-[#B8860B] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                        1
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-extrabold text-[#352B48] dark:text-white mt-2 truncate max-w-full font-heading">
                      {rank1.displayName}
                    </p>
                    <p className="text-xs text-[#B8860B] font-bold">{rank1.points} pts</p>
                    <div className="w-full h-32 sm:h-36 bg-[#FFF1B8]/70 dark:bg-[#3D351A] rounded-t-2xl mt-3 flex items-center justify-center text-xs font-bold text-[#B8860B] border-t-2 border-[#B8860B]">
                      Gold Winner
                    </div>
                  </div>
                )}

                {/* Rank 3 (Bronze) */}
                {rank3 ? (
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-2">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#FFE2CC] dark:bg-[#3D291F] border-2 border-white dark:border-[#4C3C73] shadow-soft flex items-center justify-center text-xl font-bold text-[#C95C1E]">
                        {rank3.displayName.charAt(0).toUpperCase()}
                      </div>
                      <span className="absolute -bottom-2 inset-x-0 mx-auto w-5 h-5 rounded-full bg-[#C95C1E] text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
                        3
                      </span>
                    </div>
                    <p className="text-xs font-bold text-[#352B48] dark:text-[#F5F1FD] mt-2 truncate max-w-full">
                      {rank3.displayName}
                    </p>
                    <p className="text-[10px] text-[#777187] dark:text-[#A8A1BC] font-semibold">{rank3.points} pts</p>
                    <div className="w-full h-18 sm:h-20 bg-[#FFE2CC]/50 dark:bg-[#3D291F] rounded-t-2xl mt-3 flex items-center justify-center text-xs font-bold text-[#C95C1E] border-t-2 border-[#C95C1E]/40">
                      Bronze
                    </div>
                  </div>
                ) : <div />}
              </div>
            </div>
          )}

          {/* FULL LEADERBOARD TABLE */}
          <div className="bg-white dark:bg-[#1F1930] rounded-3xl p-6 border border-[#E6DFFF] dark:border-[#332A4C] shadow-soft space-y-4">
            <h3 className="text-sm font-bold text-[#352B48] dark:text-[#F5F1FD] font-heading">
              Complete Standings
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E6DFFF] dark:border-[#332A4C] text-[#777187] dark:text-[#A8A1BC] uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Accuracy</th>
                    <th className="py-3 px-4">Quizzes</th>
                    <th className="py-3 px-4 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6DFFF]/40 dark:divide-[#332A4C]">
                  {filteredList.map((entry) => (
                    <tr
                      key={entry.userId}
                      className={`transition-colors ${
                        entry.isCurrentUser
                          ? 'bg-[#E6DFFF]/40 dark:bg-[#332A4C]/60 font-bold border-l-4 border-l-[#9274E8]'
                          : 'hover:bg-[#FFFAFD] dark:hover:bg-[#151120]'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-xs">
                        #{entry.rank}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#352B48] dark:text-[#F5F1FD]">{entry.displayName}</span>
                          {entry.isCurrentUser && (
                            <span className="text-[9px] bg-[#9274E8] text-white px-1.5 py-0.2 rounded font-bold">
                              You
                            </span>
                          )}
                          <span className="text-[10px] text-[#777187] dark:text-[#A8A1BC]">@{entry.username}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#352B48] dark:text-[#F5F1FD] tabular-nums">
                        {entry.accuracy}%
                      </td>
                      <td className="py-3.5 px-4 text-[#777187] dark:text-[#A8A1BC] tabular-nums">
                        {entry.quizzesCompleted}
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-[#9274E8] dark:text-[#A78BFA] tabular-nums">
                        {entry.points} pts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
