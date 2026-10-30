import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  Flame,
  ArrowRight,
  BookOpen,
  Calendar,
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { StatCard } from '../components/common/StatCard';
import { EmptyState } from '../components/common/EmptyState';
import { PageId, QuizAttempt } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface ProgressPageProps {
  onNavigate: (page: PageId, extra?: any) => void;
  onShowToast: (title: string, description?: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const ProgressPage: React.FC<ProgressPageProps> = ({
  onNavigate,
  onShowToast,
}) => {
  const { user, profile, progress } = useAuth();
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(true);
  const [selectedAttemptForReview, setSelectedAttemptForReview] = useState<QuizAttempt | null>(null);

  // Fetch real quiz attempts from Firestore
  useEffect(() => {
    const fetchAttempts = async () => {
      if (!user) {
        setLoadingAttempts(false);
        return;
      }
      try {
        const q = query(
          collection(db, 'quiz_attempts'),
          where('userId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        const list: QuizAttempt[] = [];
        querySnapshot.forEach((doc) => {
          list.push(doc.data() as QuizAttempt);
        });
        // Sort descending by completion time
        list.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
        setAttempts(list);
      } catch (err) {
        console.error('Error fetching quiz attempts:', err);
      } finally {
        setLoadingAttempts(false);
      }
    };

    fetchAttempts();
  }, [user]);

  const totalQuizzes = progress?.totalQuizzesCompleted ?? 0;
  const avgAccuracy = progress?.averageAccuracy ?? 0;
  const currentStreak = progress?.currentStreakDays ?? 0;
  const totalPoints = progress?.totalEarnedPoints ?? 0;

  // Real topic mastery from progress record
  const topicMasteryList = progress?.topicMastery
    ? Object.entries(progress.topicMastery).map(([topic, data]) => ({
        topic,
        mastery: data.mastery,
        attempts: data.attempts,
        status: data.mastery >= 85 ? 'Strong Topic' : data.mastery >= 70 ? 'Good Retention' : 'Needs Practice',
        color:
          data.mastery >= 85
            ? 'bg-[#D5F5E3] text-[#31966B]'
            : data.mastery >= 70
            ? 'bg-[#D9EEFF] text-[#2870BD]'
            : 'bg-[#FFE2CC] text-[#C95C1E]',
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E6DFFF]/50 dark:border-[#332A4C]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#D5F5E3] text-[#31966B]">
              <TrendingUp className="w-5 h-5 stroke-[2.2]" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#352B48] dark:text-[#F5F1FD] font-heading">
              My Learning Progress
            </h1>
          </div>
          <p className="text-xs text-[#777187] dark:text-[#A8A1BC] mt-1">
            Verified study metrics, topic mastery rates, and complete quiz history.
          </p>
        </div>
      </div>

      {totalQuizzes === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No completed quizzes yet"
          description="Take your first quiz or review flashcards to generate live mastery statistics, accuracy rates, and learning streak records stored in Firestore."
          actionLabel="Take a Practice Quiz"
          onAction={() => onNavigate('create-quiz')}
          theme="mint"
        />
      ) : (
        <>
          {/* STATS OVERVIEW (Real stored metrics) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Overall Accuracy"
              value={`${avgAccuracy}%`}
              sublabel="Average score across attempts"
              icon={CheckCircle2}
              theme="mint"
              isDemo={false}
            />
            <StatCard
              label="Quizzes Completed"
              value={totalQuizzes}
              sublabel="Verified submissions"
              icon={Award}
              theme="blue"
              isDemo={false}
            />
            <StatCard
              label="Current Streak"
              value={`${currentStreak} ${currentStreak === 1 ? 'Day' : 'Days'}`}
              sublabel="Active learning habit"
              icon={Flame}
              theme="peach"
              isDemo={false}
            />
            <StatCard
              label="Total Points"
              value={`${totalPoints} XP`}
              sublabel="Earned study points"
              icon={Clock}
              theme="lavender"
              isDemo={false}
            />
          </div>

          {/* TOPIC MASTERY BREAKDOWN */}
          {topicMasteryList.length > 0 && (
            <div className="bg-white dark:bg-[#1F1930] rounded-3xl p-6 border border-[#E6DFFF] dark:border-[#332A4C] shadow-soft space-y-4">
              <div className="pb-3 border-b border-[#E6DFFF]/50 dark:border-[#332A4C]">
                <h3 className="text-base font-bold text-[#352B48] dark:text-[#F5F1FD] font-heading">
                  Topic-Wise Mastery
                </h3>
                <p className="text-xs text-[#777187] dark:text-[#A8A1BC]">Calculated from your verified quiz answers</p>
              </div>

              <div className="space-y-3.5">
                {topicMasteryList.map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#352B48] dark:text-[#F5F1FD] truncate max-w-[220px]">
                        {item.topic}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${item.color}`}>
                          {item.status} ({item.attempts} {item.attempts === 1 ? 'attempt' : 'attempts'})
                        </span>
                        <span className="font-bold text-[#352B48] dark:text-[#F5F1FD] tabular-nums">{item.mastery}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-[#E6DFFF]/40 dark:bg-[#332A4C] rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          item.mastery >= 85
                            ? 'bg-[#31966B]'
                            : item.mastery >= 70
                            ? 'bg-[#2870BD]'
                            : 'bg-[#D95370]'
                        }`}
                        style={{ width: `${item.mastery}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QUIZ HISTORY TABLE */}
          <div className="bg-white dark:bg-[#1F1930] rounded-3xl p-6 border border-[#E6DFFF] dark:border-[#332A4C] shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6DFFF]/50 dark:border-[#332A4C]">
              <div>
                <h3 className="text-base font-bold text-[#352B48] dark:text-[#F5F1FD] font-heading">
                  Quiz History Log
                </h3>
                <p className="text-xs text-[#777187] dark:text-[#A8A1BC]">Verified records stored in Cloud Firestore</p>
              </div>
              <span className="text-xs font-semibold text-[#777187] dark:text-[#A8A1BC]">
                Showing {attempts.length} attempts
              </span>
            </div>

            {loadingAttempts ? (
              <p className="py-6 text-center text-xs text-[#777187]">Loading quiz history...</p>
            ) : attempts.length === 0 ? (
              <p className="py-6 text-center text-xs text-[#777187]">No quiz attempts logged yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E6DFFF] dark:border-[#332A4C] text-[#777187] dark:text-[#A8A1BC] uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Topic</th>
                      <th className="py-3 px-4">Date Completed</th>
                      <th className="py-3 px-4">Questions</th>
                      <th className="py-3 px-4">Score</th>
                      <th className="py-3 px-4">Points</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6DFFF]/40 dark:divide-[#332A4C]">
                    {attempts.map((attempt) => (
                      <tr key={attempt.attemptId} className="hover:bg-[#FFFAFD] dark:hover:bg-[#151120] transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-[#352B48] dark:text-[#F5F1FD]">
                          {attempt.topic}
                        </td>
                        <td className="py-3.5 px-4 text-[#777187] dark:text-[#A8A1BC]">
                          {new Date(attempt.completedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-[#352B48] dark:text-[#F5F1FD] tabular-nums">
                          {attempt.correctAnswers} / {attempt.questionCount}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`font-bold tabular-nums px-2 py-0.5 rounded ${
                              attempt.accuracy >= 85
                                ? 'bg-[#D5F5E3] text-[#31966B]'
                                : 'bg-[#E6DFFF] text-[#9274E8]'
                            }`}
                          >
                            {attempt.accuracy}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[#9274E8] dark:text-[#A78BFA] font-bold tabular-nums">
                          +{attempt.earnedPoints} XP
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedAttemptForReview(attempt)}
                            className="px-2.5 py-1 text-xs font-bold text-[#9274E8] dark:text-[#A78BFA] hover:bg-[#E6DFFF]/40 rounded-lg transition-colors cursor-pointer"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Review Dialog */}
      {selectedAttemptForReview && (
        <div className="fixed inset-0 z-50 bg-[#352B48]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1F1930] rounded-3xl max-w-md w-full p-6 shadow-soft-lg border border-[#E6DFFF] dark:border-[#332A4C] space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6DFFF]/50 dark:border-[#332A4C]">
              <h3 className="text-sm font-bold text-[#352B48] dark:text-[#F5F1FD] font-heading">
                Attempt Details
              </h3>
              <button
                onClick={() => setSelectedAttemptForReview(null)}
                className="text-[#777187] hover:text-[#352B48] dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-bold text-[#352B48] dark:text-[#F5F1FD] text-sm">
                Topic: {selectedAttemptForReview.topic}
              </p>
              <div className="p-3 rounded-xl bg-[#FFFAFD] dark:bg-[#151120] border border-[#E6DFFF] dark:border-[#332A4C] grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[#777187] dark:text-[#A8A1BC]">Accuracy:</span>{' '}
                  <strong className="text-[#31966B]">{selectedAttemptForReview.accuracy}%</strong>
                </div>
                <div>
                  <span className="text-[#777187] dark:text-[#A8A1BC]">Correct:</span>{' '}
                  <strong>
                    {selectedAttemptForReview.correctAnswers} / {selectedAttemptForReview.questionCount}
                  </strong>
                </div>
                <div>
                  <span className="text-[#777187] dark:text-[#A8A1BC]">Points:</span>{' '}
                  <strong className="text-[#9274E8] dark:text-[#A78BFA]">+{selectedAttemptForReview.earnedPoints} XP</strong>
                </div>
                <div>
                  <span className="text-[#777187] dark:text-[#A8A1BC]">Submission ID:</span>{' '}
                  <span className="font-mono text-[10px] text-[#777187] truncate block">
                    {selectedAttemptForReview.submissionId}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedAttemptForReview(null)}
                className="px-4 py-2 bg-[#9274E8] text-white text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
