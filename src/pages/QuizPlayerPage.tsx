import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Award,
  RotateCw,
  Home,
  Bookmark,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { PageId, QuizQuestion, QuizSettings } from '../types';
import { SAMPLE_QUIZ_QUESTIONS } from '../data/sampleData';
import { useAuth } from '../contexts/AuthContext';

interface QuizPlayerPageProps {
  settings?: QuizSettings;
  onNavigate: (page: PageId) => void;
  onShowToast: (title: string, description?: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const QuizPlayerPage: React.FC<QuizPlayerPageProps> = ({
  settings,
  onNavigate,
  onShowToast,
}) => {
  const { user, saveQuizAttempt } = useAuth();
  const activeTopic = settings?.topic || 'Solar System';
  const questions: QuizQuestion[] =
    SAMPLE_QUIZ_QUESTIONS[activeTopic] || SAMPLE_QUIZ_QUESTIONS['Solar System'];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [bookmarked, setBookmarked] = useState<Record<number, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Idempotency submission ref
  const submissionIdRef = useRef<string>(`sub_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`);

  // Timer
  useEffect(() => {
    if (isSubmitted) return;
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted]);

  const currentQ = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  const handleSelectOption = (optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [currentIndex]: optionIndex,
    });
  };

  const toggleBookmark = () => {
    setBookmarked({
      ...bookmarked,
      [currentIndex]: !bookmarked[currentIndex],
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswerIndex) {
        correct++;
      }
    });
    const percentage = Math.round((correct / questions.length) * 100);
    const earnedPoints = correct * 50 + (percentage >= 80 ? 50 : 0);
    return {
      correct,
      total: questions.length,
      percentage,
      earnedPoints,
    };
  };

  const handleSubmitQuiz = async () => {
    if (isSubmitted || isSaving) return;
    setShowConfirmSubmit(false);
    setIsSaving(true);

    const score = calculateScore();

    // Idempotent save to Firestore
    try {
      if (user) {
        await saveQuizAttempt({
          topic: activeTopic,
          difficulty: settings?.difficulty || 'Medium',
          questionCount: score.total,
          correctAnswers: score.correct,
          totalScore: score.percentage,
          accuracy: score.percentage,
          earnedPoints: score.earnedPoints,
          completionStatus: 'completed',
          submissionId: submissionIdRef.current,
        });
        onShowToast('Quiz Recorded!', `Earned +${score.earnedPoints} XP saved to your profile.`, 'success');
      } else {
        onShowToast('Quiz Finished!', 'Sign in to record your points on the global leaderboard.', 'info');
      }
    } catch (err: any) {
      console.error('Error saving quiz attempt:', err);
      onShowToast('Save Notice', 'Attempt evaluated locally.', 'info');
    } finally {
      setIsSaving(false);
      setIsSubmitted(true);
    }

    // Confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD6E7', '#E6DFFF', '#D5F5E3', '#9274E8', '#F08CB4'],
      });
    } catch (e) {
      // Safe fallback
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const scoreResult = isSubmitted ? calculateScore() : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E6DFFF]/50 dark:border-[#332A4C]">
        <button
          onClick={() => onNavigate('create-quiz')}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#777187] dark:text-[#A8A1BC] hover:text-[#352B48] dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Quiz</span>
        </button>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#352B48] dark:text-[#F5F1FD] bg-white dark:bg-[#1F1930] px-3 py-1.5 rounded-xl border border-[#E6DFFF] dark:border-[#332A4C]">
            <Clock className="w-3.5 h-3.5 text-[#9274E8]" />
            <span className="tabular-nums font-mono">{formatTime(secondsElapsed)}</span>
          </div>

          <button
            onClick={toggleBookmark}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              bookmarked[currentIndex]
                ? 'bg-[#FFE2CC] border-[#C95C1E] text-[#C95C1E]'
                : 'bg-white dark:bg-[#1F1930] border-[#E6DFFF] dark:border-[#332A4C] text-[#777187] hover:text-[#352B48]'
            }`}
            title="Bookmark question for review"
            aria-label="Bookmark question"
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar & Question Counter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-[#777187] dark:text-[#A8A1BC]">
          <span>
            Question <strong className="text-[#352B48] dark:text-[#F5F1FD]">{currentIndex + 1}</strong> of{' '}
            {questions.length}
          </span>
          <span className="text-[#9274E8] dark:text-[#A78BFA] font-bold">{progressPercent}% Completed</span>
        </div>
        <div className="w-full bg-[#E6DFFF]/40 dark:bg-[#332A4C] rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#9274E8] to-[#F08CB4] h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white dark:bg-[#1F1930] rounded-3xl p-6 sm:p-8 border border-[#E6DFFF] dark:border-[#332A4C] shadow-soft space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9274E8] dark:text-[#A78BFA] bg-[#E6DFFF] dark:bg-[#332A4C] px-2 py-0.5 rounded">
              {currentQ.topic}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#777187] dark:text-[#A8A1BC] bg-[#FFFAFD] dark:bg-[#151120] px-2 py-0.5 rounded border border-[#E6DFFF] dark:border-[#332A4C]">
              {currentQ.difficulty}
            </span>
          </div>
          <h2 className="text-base sm:text-xl font-bold text-[#352B48] dark:text-[#F5F1FD] leading-snug font-heading">
            {currentQ.question}
          </h2>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQ.options.map((optionText, optIdx) => {
            const isSelected = selectedAnswers[currentIndex] === optIdx;
            const isCorrect = currentQ.correctAnswerIndex === optIdx;

            let cardStyle =
              'bg-[#FFFAFD] dark:bg-[#151120] border-[#E6DFFF] dark:border-[#332A4C] text-[#352B48] dark:text-[#F5F1FD] hover:border-[#9274E8] hover:bg-[#E6DFFF]/20';

            if (isSubmitted) {
              if (isCorrect) {
                cardStyle = 'bg-[#D5F5E3] dark:bg-[#1B362A] border-[#31966B] text-[#31966B] dark:text-[#34D399] font-bold';
              } else if (isSelected) {
                cardStyle = 'bg-[#FFD6E7] dark:bg-[#3D2232] border-[#D95370] text-[#D95370] dark:text-[#F87171] font-bold';
              } else {
                cardStyle = 'bg-white dark:bg-[#1F1930] border-[#E6DFFF]/50 text-[#777187] opacity-60';
              }
            } else if (isSelected) {
              cardStyle = 'bg-[#E6DFFF] dark:bg-[#332A4C] border-[#9274E8] dark:border-[#A78BFA] text-[#352B48] dark:text-white font-bold shadow-xs';
            }

            const letter = String.fromCharCode(65 + optIdx);

            return (
              <button
                key={optIdx}
                type="button"
                disabled={isSubmitted}
                onClick={() => handleSelectOption(optIdx)}
                className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all duration-150 flex items-center justify-between cursor-pointer ${cardStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isSelected
                        ? 'bg-[#9274E8] text-white'
                        : 'bg-white dark:bg-[#1F1930] border border-[#E6DFFF] dark:border-[#332A4C] text-[#777187]'
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="text-xs sm:text-sm font-medium">{optionText}</span>
                </div>

                {isSubmitted && (
                  <div>
                    {isCorrect && <CheckCircle2 className="w-5 h-5 text-[#31966B] dark:text-[#34D399]" />}
                    {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-[#D95370] dark:text-[#F87171]" />}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Post-submission explanation */}
        {isSubmitted && (
          <div className="p-4 rounded-2xl bg-[#D9EEFF]/40 dark:bg-[#1A2F45] border border-[#D9EEFF] dark:border-[#332A4C] text-xs space-y-1">
            <span className="font-bold text-[#2870BD] dark:text-[#93C5FD] flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" /> Concept Explanation:
            </span>
            <p className="text-[#352B48] dark:text-[#F5F1FD] leading-relaxed">{currentQ.explanation}</p>
          </div>
        )}

        {/* Navigation controls (Prev, Next, Submit) */}
        <div className="pt-4 border-t border-[#E6DFFF]/50 dark:border-[#332A4C] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-4 py-2.5 rounded-xl border border-[#E6DFFF] dark:border-[#332A4C] text-xs font-semibold text-[#352B48] dark:text-[#F5F1FD] hover:bg-[#E6DFFF]/30 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-2">
            {currentIndex === questions.length - 1 && !isSubmitted && (
              <button
                type="button"
                onClick={() => setShowConfirmSubmit(true)}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-[#31966B] hover:bg-[#287b57] text-white text-xs font-bold shadow-soft transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Submit Quiz'}
              </button>
            )}

            {currentIndex < questions.length - 1 && (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-[#9274E8] hover:bg-[#7e5bd9] text-white text-xs font-bold shadow-pastel-purple transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Jump Question Grid */}
      <div className="bg-white dark:bg-[#1F1930] rounded-2xl p-4 border border-[#E6DFFF] dark:border-[#332A4C] shadow-soft">
        <span className="text-[11px] font-bold text-[#777187] dark:text-[#A8A1BC] uppercase tracking-wider block mb-2">
          Question Navigator
        </span>
        <div className="flex flex-wrap gap-2">
          {questions.map((_, idx) => {
            const isCurrent = currentIndex === idx;
            const isAnswered = selectedAnswers[idx] !== undefined;
            const isMarked = bookmarked[idx];

            return (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-8 h-8 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-[#352B48] dark:bg-white text-white dark:text-[#352B48] border-[#352B48]'
                    : isMarked
                    ? 'bg-[#FFE2CC] text-[#C95C1E] border-[#C95C1E]'
                    : isAnswered
                    ? 'bg-[#D5F5E3] dark:bg-[#1B362A] text-[#31966B] dark:text-[#34D399] border-[#31966B]'
                    : 'bg-[#FFFAFD] dark:bg-[#151120] text-[#777187] border-[#E6DFFF] dark:border-[#332A4C]'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Confirm Submission Dialog */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 bg-[#352B48]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1F1930] rounded-3xl max-w-sm w-full p-6 shadow-soft-lg border border-[#E6DFFF] dark:border-[#332A4C] text-center space-y-4 animate-in fade-in duration-150">
            <div className="w-12 h-12 rounded-2xl bg-[#D5F5E3] text-[#31966B] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#352B48] dark:text-[#F5F1FD] font-heading">
                Ready to Submit?
              </h3>
              <p className="text-xs text-[#777187] dark:text-[#A8A1BC] mt-1">
                You have answered {Object.keys(selectedAnswers).length} of {questions.length} questions.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 py-2 text-xs font-semibold text-[#777187] bg-[#FFFAFD] dark:bg-[#151120] border border-[#E6DFFF] dark:border-[#332A4C] rounded-xl hover:bg-[#E6DFFF]/30"
              >
                Review First
              </button>
              <button
                onClick={handleSubmitQuiz}
                className="flex-1 py-2 text-xs font-bold text-white bg-[#31966B] hover:bg-[#287b57] rounded-xl shadow-soft"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completion Results Modal */}
      {isSubmitted && scoreResult && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#D5F5E3]/60 via-[#E6DFFF]/60 to-[#FFD6E7]/60 dark:from-[#1B362A] dark:to-[#2B2144] border border-white dark:border-[#4C3C73] shadow-soft-lg text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#1F1930] text-[#9274E8] flex items-center justify-center mx-auto shadow-soft">
            <Award className="w-8 h-8 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9274E8] dark:text-[#A78BFA] bg-white/80 dark:bg-[#1F1930] px-2.5 py-1 rounded-full">
              Quiz Evaluated & Recorded
            </span>
            <h3 className="text-3xl font-extrabold text-[#352B48] dark:text-white mt-2 font-heading">
              {scoreResult.percentage}% Score (+{scoreResult.earnedPoints} XP)
            </h3>
            <p className="text-xs text-[#777187] dark:text-[#A8A1BC] mt-1">
              You answered <strong>{scoreResult.correct}</strong> out of {scoreResult.total} questions correctly in {formatTime(secondsElapsed)}.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setIsSubmitted(false);
                setSelectedAnswers({});
                setSecondsElapsed(0);
                setCurrentIndex(0);
                submissionIdRef.current = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
              }}
              className="px-5 py-2.5 bg-white dark:bg-[#1F1930] text-[#352B48] dark:text-[#F5F1FD] border border-[#E6DFFF] dark:border-[#332A4C] text-xs font-bold rounded-xl hover:bg-[#E6DFFF]/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-soft"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Retry Quiz</span>
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-5 py-2.5 bg-[#9274E8] text-white text-xs font-bold rounded-xl shadow-pastel-purple hover:bg-[#7e5bd9] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
