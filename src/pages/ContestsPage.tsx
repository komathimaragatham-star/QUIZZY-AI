import React, { useState } from 'react';
import {
  Swords,
  Timer,
  Award,
  Sparkles,
  Play,
  Calendar,
  Users,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { PageId, ContestItem } from '../types';

interface ContestsPageProps {
  onNavigate: (page: PageId, extra?: any) => void;
  onShowToast: (title: string, description?: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const ContestsPage: React.FC<ContestsPageProps> = ({
  onNavigate,
  onShowToast,
}) => {
  const [showRulesModal, setShowRulesModal] = useState(false);

  const activeContests: ContestItem[] = [
    {
      id: 'c-solar',
      title: 'Galactic Astronomy Sprint',
      topic: 'Solar System',
      difficulty: 'Medium',
      numQuestions: 10,
      timeLimitMinutes: 8,
      xpReward: 350,
      participantsCount: 42,
      status: 'active',
      endsInHours: 36,
      description: 'Test your understanding of planetary mechanics, orbital eccentricity, and planetary moons in our live timed tournament.',
    },
  ];

  const upcomingContests: ContestItem[] = [
    {
      id: 'c-python',
      title: 'Python Data Structures Championship',
      topic: 'Python Programming',
      difficulty: 'Hard',
      numQuestions: 15,
      timeLimitMinutes: 12,
      xpReward: 500,
      participantsCount: 78,
      status: 'upcoming',
      startDate: 'Saturday, 10:00 AM',
      description: 'Advanced assessment testing lists, hash maps, recursion, and object-oriented paradigms.',
    },
    {
      id: 'c-bio',
      title: 'Cellular Biology Sprint',
      topic: 'Biology',
      difficulty: 'Medium',
      numQuestions: 10,
      timeLimitMinutes: 8,
      xpReward: 300,
      participantsCount: 35,
      status: 'upcoming',
      startDate: 'Next Tuesday',
      description: 'Fast-paced review of mitochondrial respiration, ATP pathways, and genetics.',
    },
  ];

  const activeContest = activeContests[0];

  const handleStartContest = () => {
    onShowToast(
      'Starting Contest Sprint',
      `Launching tournament questions for "${activeContest.title}".`,
      'info'
    );
    onNavigate('quiz-player', { topic: activeContest.topic });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E6DFFF]/50 dark:border-[#332A4C]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#FFE2CC] dark:bg-[#3D291F] text-[#C95C1E] dark:text-[#FF8E72]">
              <Swords className="w-5 h-5 stroke-[2.2]" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#352B48] dark:text-[#F5F1FD] font-heading">
              Weekly Contests
            </h1>
          </div>
          <p className="text-xs text-[#777187] dark:text-[#A8A1BC] mt-1">
            Timed global challenges designed to test accuracy, speed, and deep conceptual knowledge.
          </p>
        </div>

        <button
          onClick={() => setShowRulesModal(true)}
          className="text-xs font-semibold px-3 py-2 bg-white dark:bg-[#1F1930] border border-[#E6DFFF] dark:border-[#332A4C] rounded-xl hover:bg-[#E6DFFF]/30 text-[#777187] dark:text-[#A8A1BC] transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <HelpCircle className="w-3.5 h-3.5 text-[#9274E8]" />
          <span>Contest Rules & Scoring</span>
        </button>
      </div>

      {/* Tournament Notice */}
      <div className="p-3.5 rounded-2xl bg-[#FFF1B8]/40 dark:bg-[#3D351A]/40 border border-[#FFF1B8] dark:border-[#3D351A] flex items-center gap-2 text-xs text-[#352B48] dark:text-[#F5F1FD]">
        <Sparkles className="w-4 h-4 text-[#B8860B] dark:text-[#FDE047] shrink-0" />
        <span>
          <strong>Timed Sprint Arena:</strong> Compete in live weekly topic challenges to earn bonus XP and climb the student leaderboards.
        </span>
      </div>

      {/* FEATURED ACTIVE CONTEST CARD */}
      <div className="bg-gradient-to-br from-white via-[#FFE2CC]/30 to-[#FFD6E7]/30 dark:from-[#1F1930] dark:via-[#3D291F]/30 dark:to-[#3D2232]/30 rounded-3xl p-6 sm:p-8 border border-[#FFE2CC] dark:border-[#3D291F] shadow-soft-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C95C1E] dark:text-[#FF8E72] bg-[#FFE2CC] dark:bg-[#3D291F] px-2.5 py-1 rounded-md">
              Active Tournament
            </span>
            <span className="text-xs font-semibold text-[#777187] dark:text-[#A8A1BC]">
              Ends in {activeContest.endsInHours} hours
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-[#9274E8] dark:text-[#A78BFA] bg-white dark:bg-[#151120] px-3 py-1.5 rounded-xl border border-[#E6DFFF] dark:border-[#332A4C] shadow-xs">
            <Award className="w-4 h-4 text-[#B8860B] dark:text-[#FDE047]" />
            <span>+{activeContest.xpReward} Bonus XP</span>
          </div>
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#352B48] dark:text-[#F5F1FD] font-heading">
            {activeContest.title}
          </h2>
          <p className="text-xs sm:text-sm text-[#777187] dark:text-[#A8A1BC] mt-2 max-w-2xl leading-relaxed">
            {activeContest.description}
          </p>
        </div>

        {/* Contest Parameters Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-white/90 dark:bg-[#151120] rounded-2xl border border-white dark:border-[#332A4C] shadow-xs">
            <span className="text-[10px] font-bold uppercase text-[#777187] dark:text-[#A8A1BC]">Topic</span>
            <p className="text-xs font-bold text-[#352B48] dark:text-[#F5F1FD] mt-0.5 truncate">{activeContest.topic}</p>
          </div>
          <div className="p-3 bg-white/90 dark:bg-[#151120] rounded-2xl border border-white dark:border-[#332A4C] shadow-xs">
            <span className="text-[10px] font-bold uppercase text-[#777187] dark:text-[#A8A1BC]">Format</span>
            <p className="text-xs font-bold text-[#352B48] dark:text-[#F5F1FD] mt-0.5">{activeContest.numQuestions} Questions</p>
          </div>
          <div className="p-3 bg-white/90 dark:bg-[#151120] rounded-2xl border border-white dark:border-[#332A4C] shadow-xs">
            <span className="text-[10px] font-bold uppercase text-[#777187] dark:text-[#A8A1BC]">Time Limit</span>
            <p className="text-xs font-bold text-[#352B48] dark:text-[#F5F1FD] mt-0.5">{activeContest.timeLimitMinutes} Minutes</p>
          </div>
          <div className="p-3 bg-white/90 dark:bg-[#151120] rounded-2xl border border-white dark:border-[#332A4C] shadow-xs">
            <span className="text-[10px] font-bold uppercase text-[#777187] dark:text-[#A8A1BC]">Competitors</span>
            <p className="text-xs font-bold text-[#352B48] dark:text-[#F5F1FD] mt-0.5">{activeContest.participantsCount} Students</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleStartContest}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#9274E8] hover:bg-[#7e5bd9] text-white text-xs sm:text-sm font-bold rounded-2xl shadow-pastel-purple transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Enter Contest Now</span>
          </button>
          <span className="text-xs text-[#777187] dark:text-[#A8A1BC]">
            One attempt allowed per contest period to maintain fairness.
          </span>
        </div>
      </div>

      {/* UPCOMING CONTESTS LIST */}
      <div className="bg-white dark:bg-[#1F1930] rounded-3xl p-6 sm:p-8 border border-[#E6DFFF] dark:border-[#332A4C] shadow-soft space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E6DFFF]/50 dark:border-[#332A4C]">
          <div>
            <h3 className="text-base font-bold text-[#352B48] dark:text-[#F5F1FD] font-heading">
              Upcoming Tournaments
            </h3>
            <p className="text-xs text-[#777187] dark:text-[#A8A1BC]">Prepare your notes and study beforehand</p>
          </div>
          <span className="text-xs font-semibold text-[#777187] dark:text-[#A8A1BC]">
            {upcomingContests.length} scheduled
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingContests.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-2xl bg-[#FFFAFD] dark:bg-[#151120] border border-[#E6DFFF] dark:border-[#332A4C] hover:border-[#9274E8]/60 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9274E8] dark:text-[#A78BFA] bg-[#E6DFFF] dark:bg-[#2B2144] px-2 py-0.5 rounded">
                    Starts {c.startDate}
                  </span>
                  <span className="text-xs font-bold text-[#B8860B] dark:text-[#FDE047]">+{c.xpReward} XP</span>
                </div>
                <h4 className="text-sm font-bold text-[#352B48] dark:text-[#F5F1FD]">{c.title}</h4>
                <p className="text-xs text-[#777187] dark:text-[#A8A1BC] mt-1.5 leading-relaxed">{c.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E6DFFF]/50 dark:border-[#332A4C] flex items-center justify-between text-xs text-[#777187] dark:text-[#A8A1BC]">
                <span>{c.numQuestions} Qs · {c.difficulty}</span>
                <button
                  onClick={() =>
                    onShowToast('Reminder Set', `We will notify you when "${c.title}" starts!`, 'info')
                  }
                  className="font-bold text-[#9274E8] dark:text-[#A78BFA] hover:underline cursor-pointer"
                >
                  Set Reminder
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 bg-[#352B48]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1F1930] rounded-3xl max-w-md w-full p-6 shadow-soft-lg border border-[#E6DFFF] dark:border-[#332A4C] space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6DFFF]/50 dark:border-[#332A4C]">
              <h3 className="text-base font-bold text-[#352B48] dark:text-[#F5F1FD] font-heading">
                Weekly Contest Rules & Scoring
              </h3>
              <button
                onClick={() => setShowRulesModal(false)}
                className="text-[#777187] hover:text-[#352B48] dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#352B48] dark:text-[#F5F1FD] leading-relaxed">
              <div className="p-3 rounded-xl bg-[#D5F5E3]/40 dark:bg-[#1B362A]/40 border border-[#D5F5E3] dark:border-[#1B362A] space-y-1">
                <span className="font-bold text-[#31966B] dark:text-[#34D399]">1. Fair Play & Single Attempt</span>
                <p className="text-[#777187] dark:text-[#A8A1BC]">
                  Each registered student is allocated exactly one scored attempt per weekly contest.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#E6DFFF]/40 dark:bg-[#2B2144]/40 border border-[#E6DFFF] dark:border-[#332A4C] space-y-1">
                <span className="font-bold text-[#9274E8] dark:text-[#A78BFA]">2. Accuracy & Speed Multipliers</span>
                <p className="text-[#777187] dark:text-[#A8A1BC]">
                  Base points are calculated by correct answers. Bonus multipliers reward answering within the first 15 seconds per question.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#FFE2CC]/40 dark:bg-[#3D291F]/40 border border-[#FFE2CC] dark:border-[#3D291F] space-y-1">
                <span className="font-bold text-[#C95C1E] dark:text-[#FF8E72]">3. Continuous Contest Timers</span>
                <p className="text-[#777187] dark:text-[#A8A1BC]">
                  Contest timers run continuously once started to ensure fair competition for all participants.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowRulesModal(false)}
                className="px-4 py-2 bg-[#9274E8] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
