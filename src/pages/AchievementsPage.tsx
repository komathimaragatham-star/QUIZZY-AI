import React, { useState, useEffect } from 'react';
import {
  Award,
  Sparkles,
  Trophy,
  Flame,
  Zap,
  Compass,
  Layers,
  Lock,
  Unlock,
  Download,
  Eye,
  CheckCircle2,
  X,
  FileCheck,
  BookOpen,
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PageId, CertificateItem, QuizAttempt } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { EmptyState } from '../components/common/EmptyState';

interface AchievementsPageProps {
  onNavigate: (page: PageId) => void;
  onShowToast: (title: string, description?: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const AchievementsPage: React.FC<AchievementsPageProps> = ({
  onNavigate,
  onShowToast,
}) => {
  const { user, profile, progress } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [previewCert, setPreviewCert] = useState<CertificateItem | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(true);

  // Fetch real quiz attempts for certificates & perfect score achievement
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
        querySnapshot.forEach((d) => {
          list.push(d.data() as QuizAttempt);
        });
        setAttempts(list);
      } catch (err) {
        console.warn('Could not fetch quiz attempts for achievements:', err);
      } finally {
        setLoadingAttempts(false);
      }
    };

    fetchAttempts();
  }, [user]);

  const totalQuizzes = progress?.totalQuizzesCompleted ?? 0;
  const currentStreak = progress?.currentStreakDays ?? 0;
  const totalPoints = progress?.totalEarnedPoints ?? 0;
  const hasPerfectScore = attempts.some((a) => a.accuracy === 100);

  // Real Dynamic Achievements derived from user records
  const dynamicAchievements = [
    {
      id: 'ach-first-quiz',
      title: 'First Quiz Completed',
      description: 'Complete your first practice quiz on Quizzy AI.',
      category: 'Quiz Completion',
      tier: 'bronze' as const,
      progress: Math.min(1, totalQuizzes),
      target: 1,
      isUnlocked: totalQuizzes >= 1,
      iconName: 'Zap',
    },
    {
      id: 'ach-quiz-novice',
      title: 'Quiz Novice',
      description: 'Complete 5 educational quizzes across any subjects.',
      category: 'Quiz Completion',
      tier: 'silver' as const,
      progress: Math.min(5, totalQuizzes),
      target: 5,
      isUnlocked: totalQuizzes >= 5,
      iconName: 'BookOpen',
    },
    {
      id: 'ach-quiz-master',
      title: 'Quiz Master',
      description: 'Complete 10 total quizzes to achieve mastery status.',
      category: 'Quiz Completion',
      tier: 'gold' as const,
      progress: Math.min(10, totalQuizzes),
      target: 10,
      isUnlocked: totalQuizzes >= 10,
      iconName: 'Trophy',
    },
    {
      id: 'ach-perfect-score',
      title: 'Perfect Accuracy',
      description: 'Score 100% on any practice quiz assessment.',
      category: 'Topic Mastery',
      tier: 'gold' as const,
      progress: hasPerfectScore ? 1 : 0,
      target: 1,
      isUnlocked: hasPerfectScore,
      iconName: 'Sparkles',
    },
    {
      id: 'ach-streak-3',
      title: '3-Day Momentum',
      description: 'Maintain a 3-day consecutive study streak.',
      category: 'Learning Streak',
      tier: 'bronze' as const,
      progress: Math.min(3, currentStreak),
      target: 3,
      isUnlocked: currentStreak >= 3,
      iconName: 'Flame',
    },
    {
      id: 'ach-streak-7',
      title: '7-Day Scholar Streak',
      description: 'Study 7 consecutive days to build long-term memory.',
      category: 'Learning Streak',
      tier: 'silver' as const,
      progress: Math.min(7, currentStreak),
      target: 7,
      isUnlocked: currentStreak >= 7,
      iconName: 'Flame',
    },
    {
      id: 'ach-xp-500',
      title: 'Point Collector',
      description: 'Accumulate 500 XP from verified learning activities.',
      category: 'Special',
      tier: 'silver' as const,
      progress: Math.min(500, totalPoints),
      target: 500,
      isUnlocked: totalPoints >= 500,
      iconName: 'Award',
    },
    {
      id: 'ach-xp-1000',
      title: 'Knowledge Grandmaster',
      description: 'Reach 1,000 lifetime earned XP on Quizzy AI.',
      category: 'Special',
      tier: 'gold' as const,
      progress: Math.min(1000, totalPoints),
      target: 1000,
      isUnlocked: totalPoints >= 1000,
      iconName: 'Trophy',
    },
  ];

  const categories = ['All', 'Quiz Completion', 'Learning Streak', 'Topic Mastery', 'Special'];

  const filteredAchievements =
    selectedCategory === 'All'
      ? dynamicAchievements
      : dynamicAchievements.filter((a) => a.category === selectedCategory);

  const unlockedCount = dynamicAchievements.filter((a) => a.isUnlocked).length;

  // Real Dynamic Certificates: issued for any attempt scoring >= 80%
  const studentName = profile?.fullName || user?.email?.split('@')[0] || 'Quizzy Student';
  const qualifyingAttempts = attempts.filter((a) => a.accuracy >= 80);

  const realCertificates: CertificateItem[] = qualifyingAttempts.map((att) => ({
    id: `cert-${att.attemptId}`,
    title: `${att.topic} Mastery Certificate`,
    topic: att.topic,
    issuedDate: new Date(att.completedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    recipientName: studentName,
    scorePercent: att.accuracy,
    certificateCode: `QZ-${att.attemptId.slice(0, 8).toUpperCase()}`,
    badgeLevel: att.accuracy === 100 ? 'Distinction' : att.accuracy >= 90 ? 'Honor' : 'Mastery',
  }));

  const handleDownloadCertificate = (cert: CertificateItem) => {
    onShowToast(
      'Certificate Generated',
      `Certificate ${cert.certificateCode} is ready for preview and printing.`,
      'success'
    );
    setPreviewCert(cert);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E6DFFF]/50 dark:border-[#332A4C]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#FFF1B8] dark:bg-[#3D351A] text-[#B8860B] dark:text-[#FDE047]">
              <Award className="w-5 h-5 stroke-[2.2]" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#352B48] dark:text-[#F5F1FD] font-heading">
              Achievements & Certificates
            </h1>
          </div>
          <p className="text-xs text-[#777187] dark:text-[#A8A1BC] mt-1">
            Unlock scholastic milestone badges and download certificates as you study.
          </p>
        </div>

        {/* Unlocked Summary Badge */}
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#D5F5E3] dark:bg-[#1B362A] text-[#31966B] dark:text-[#34D399] self-start sm:self-auto border border-[#D5F5E3] dark:border-[#1B362A]">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{unlockedCount} of {dynamicAchievements.length} Badges Unlocked</span>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 p-1 bg-white dark:bg-[#1F1930] rounded-2xl border border-[#E6DFFF] dark:border-[#332A4C] shadow-xs max-w-fit overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-[#E6DFFF] dark:bg-[#332A4C] text-[#352B48] dark:text-[#F5F1FD] shadow-xs'
                : 'text-[#777187] dark:text-[#A8A1BC] hover:text-[#352B48] dark:hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ACHIEVEMENTS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((ach) => {
          const isGold = ach.tier === 'gold';
          const isSilver = ach.tier === 'silver';

          const tierTheme = isGold
            ? {
                cardBg: ach.isUnlocked ? 'bg-gradient-to-br from-[#FFF1B8]/40 dark:from-[#3D351A]/40 to-white dark:to-[#1F1930]' : 'bg-white dark:bg-[#1F1930]',
                border: 'border-[#FFF1B8] dark:border-[#3D351A]',
                badgeText: 'text-[#B8860B] dark:text-[#FDE047]',
                badgeBg: 'bg-[#FFF1B8] dark:bg-[#3D351A]',
              }
            : isSilver
            ? {
                cardBg: ach.isUnlocked ? 'bg-gradient-to-br from-[#E6DFFF]/40 dark:from-[#2B2144]/40 to-white dark:to-[#1F1930]' : 'bg-white dark:bg-[#1F1930]',
                border: 'border-[#E6DFFF] dark:border-[#332A4C]',
                badgeText: 'text-[#9274E8] dark:text-[#A78BFA]',
                badgeBg: 'bg-[#E6DFFF] dark:bg-[#2B2144]',
              }
            : {
                cardBg: ach.isUnlocked ? 'bg-gradient-to-br from-[#FFE2CC]/40 dark:from-[#3D291F]/40 to-white dark:to-[#1F1930]' : 'bg-white dark:bg-[#1F1930]',
                border: 'border-[#FFE2CC] dark:border-[#3D291F]',
                badgeText: 'text-[#C95C1E] dark:text-[#FF8E72]',
                badgeBg: 'bg-[#FFE2CC] dark:bg-[#3D291F]',
              };

          const progressPercent = Math.min(100, Math.round((ach.progress / ach.target) * 100));

          return (
            <div
              key={ach.id}
              className={`p-6 rounded-3xl border shadow-soft flex flex-col justify-between transition-all ${
                tierTheme.cardBg
              } ${tierTheme.border} ${ach.isUnlocked ? 'opacity-100 ring-1 ring-black/5 dark:ring-white/5' : 'opacity-85'}`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-xs ${
                      tierTheme.badgeBg
                    } ${tierTheme.badgeText}`}
                  >
                    {isGold ? '🏆' : isSilver ? '🥈' : '🥉'}
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1 ${
                      ach.isUnlocked
                        ? 'bg-[#D5F5E3] dark:bg-[#1B362A] text-[#31966B] dark:text-[#34D399]'
                        : 'bg-slate-100 dark:bg-[#151120] text-[#777187] dark:text-[#A8A1BC]'
                    }`}
                  >
                    {ach.isUnlocked ? (
                      <>
                        <Unlock className="w-3 h-3" /> Unlocked
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3" /> Locked
                      </>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#777187] dark:text-[#A8A1BC]">
                  <span>{ach.category}</span>
                  <span>·</span>
                  <span className={tierTheme.badgeText}>{ach.tier} Tier</span>
                </div>

                <h3 className="text-base font-bold text-[#352B48] dark:text-[#F5F1FD] mt-1 font-heading">
                  {ach.title}
                </h3>
                <p className="text-xs text-[#777187] dark:text-[#A8A1BC] mt-1.5 leading-relaxed">
                  {ach.description}
                </p>
              </div>

              {/* Progress Bar & Target */}
              <div className="mt-5 pt-3 border-t border-[#E6DFFF]/50 dark:border-[#332A4C] space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-[#777187] dark:text-[#A8A1BC]">
                  <span>
                    Progress: {ach.progress} / {ach.target}
                  </span>
                  <span className="text-[#352B48] dark:text-[#F5F1FD] font-bold">{progressPercent}%</span>
                </div>
                <div className="w-full bg-[#E6DFFF]/40 dark:bg-[#332A4C] rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      ach.isUnlocked ? 'bg-[#31966B]' : 'bg-[#9274E8]'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* TOPIC MASTERY CERTIFICATES SECTION */}
      <div className="bg-white dark:bg-[#1F1930] rounded-3xl p-6 sm:p-8 border border-[#E6DFFF] dark:border-[#332A4C] shadow-soft space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E6DFFF]/50 dark:border-[#332A4C]">
          <div>
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-[#9274E8] dark:text-[#A78BFA]" />
              <h3 className="text-lg font-bold text-[#352B48] dark:text-[#F5F1FD] font-heading">
                Topic Mastery Certificates
              </h3>
            </div>
            <p className="text-xs text-[#777187] dark:text-[#A8A1BC]">
              Earned automatically by scoring 80% or higher on any practice quiz.
            </p>
          </div>
          <span className="text-xs font-semibold text-[#9274E8] dark:text-[#A78BFA] bg-[#E6DFFF] dark:bg-[#332A4C] px-2.5 py-1 rounded-lg self-start sm:self-auto">
            {realCertificates.length} Certificates Earned
          </span>
        </div>

        {loadingAttempts ? (
          <div className="py-8 text-center text-xs text-[#777187] dark:text-[#A8A1BC]">
            Checking certificate credentials...
          </div>
        ) : realCertificates.length === 0 ? (
          <EmptyState
            title="No certificates earned yet"
            description="Score 80% or higher on any topic quiz to earn your verified academic excellence certificate."
            actionLabel="Take a Practice Quiz"
            onAction={() => onNavigate('create-quiz')}
            icon={Award}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {realCertificates.map((cert) => (
              <div
                key={cert.id}
                className="p-6 rounded-2xl bg-gradient-to-br from-[#FFFAFD] via-white to-[#E6DFFF]/20 dark:from-[#151120] dark:via-[#1F1930] dark:to-[#2B2144]/30 border border-[#E6DFFF] dark:border-[#332A4C] shadow-soft flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#9274E8] dark:text-[#A78BFA] bg-[#E6DFFF] dark:bg-[#332A4C] px-2 py-0.5 rounded">
                      {cert.badgeLevel} Award
                    </span>
                    <span className="text-[11px] font-mono text-[#777187] dark:text-[#A8A1BC]">{cert.certificateCode}</span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-[#352B48] dark:text-[#F5F1FD] font-heading">
                    {cert.title}
                  </h4>
                  <p className="text-xs text-[#777187] dark:text-[#A8A1BC] mt-1">
                    Issued to <strong>{cert.recipientName}</strong> on {cert.issuedDate} with {cert.scorePercent}% Score.
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-[#E6DFFF]/50 dark:border-[#332A4C] flex items-center justify-between">
                  <button
                    onClick={() => setPreviewCert(cert)}
                    className="text-xs font-bold text-[#9274E8] dark:text-[#A78BFA] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview Certificate</span>
                  </button>
                  <button
                    onClick={() => handleDownloadCertificate(cert)}
                    className="px-3.5 py-1.5 bg-[#9274E8] hover:bg-[#7e5bd9] text-white text-xs font-bold rounded-xl shadow-soft flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Print Certificate</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Certificate Modal Viewer */}
      {previewCert && (
        <div className="fixed inset-0 z-50 bg-[#352B48]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1F1930] rounded-3xl max-w-2xl w-full p-6 sm:p-10 shadow-soft-lg border-4 border-[#FFF1B8] dark:border-[#3D351A] space-y-6 relative animate-in fade-in duration-150">
            <button
              onClick={() => setPreviewCert(null)}
              className="absolute top-4 right-4 text-[#777187] hover:text-[#352B48] dark:hover:text-white p-1.5 rounded-lg cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Inner Certificate Parchment */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-[#FFFAFD] to-[#FFF1B8]/20 dark:from-[#151120] dark:to-[#3D351A]/20 border border-[#FFF1B8] dark:border-[#3D351A] text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#FFF1B8] dark:bg-[#3D351A] border-2 border-[#B8860B] dark:border-[#FDE047] flex items-center justify-center mx-auto text-3xl shadow-soft">
                🎓
              </div>

              <span className="text-[11px] font-bold uppercase tracking-widest text-[#B8860B] dark:text-[#FDE047]">
                Certificate of Academic Excellence
              </span>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#352B48] dark:text-[#F5F1FD] font-heading">
                Quizzy AI Mastery Award
              </h2>

              <p className="text-xs text-[#777187] dark:text-[#A8A1BC]">This honors that</p>

              <h3 className="text-xl sm:text-2xl font-bold text-[#9274E8] dark:text-[#A78BFA] font-heading underline decoration-[#FFD6E7] underline-offset-4">
                {previewCert.recipientName}
              </h3>

              <p className="text-xs text-[#777187] dark:text-[#A8A1BC] max-w-md mx-auto leading-relaxed">
                has successfully achieved the distinction of <strong>{previewCert.badgeLevel}</strong> in{' '}
                <strong>{previewCert.topic}</strong> with an aggregate evaluation accuracy of {previewCert.scorePercent}%.
              </p>

              <div className="pt-4 border-t border-[#E6DFFF] dark:border-[#332A4C] flex items-center justify-between text-xs text-[#777187] dark:text-[#A8A1BC] max-w-md mx-auto">
                <div>
                  <p className="font-mono font-bold text-[#352B48] dark:text-[#F5F1FD]">{previewCert.certificateCode}</p>
                  <span className="text-[10px]">Verification Code</span>
                </div>
                <div>
                  <p className="font-bold text-[#352B48] dark:text-[#F5F1FD]">{previewCert.issuedDate}</p>
                  <span className="text-[10px]">Date Conferred</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setPreviewCert(null)}
                className="px-4 py-2 text-xs font-semibold text-[#777187] dark:text-[#A8A1BC] hover:bg-[#E6DFFF]/30 rounded-xl cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2.5 bg-[#9274E8] hover:bg-[#7e5bd9] text-white text-xs font-bold rounded-xl shadow-pastel-purple flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Print Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
