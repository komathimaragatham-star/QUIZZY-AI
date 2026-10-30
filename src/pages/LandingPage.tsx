import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  BrainCircuit,
  Layers,
  FileText,
  TrendingUp,
  Award,
  Swords,
  CheckCircle2,
  BookOpen,
  Zap,
  HelpCircle,
  Play,
  RotateCw,
} from 'lucide-react';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { PageId } from '../types';

interface LandingPageProps {
  onNavigate: (page: PageId, extra?: { accountTab?: 'login' | 'register' }) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [interactiveFlip, setInteractiveFlip] = useState(false);
  const [selectedDemoOption, setSelectedDemoOption] = useState<number | null>(null);

  const features = [
    {
      id: 'quiz-gen',
      title: 'AI Quiz Generator',
      description: 'Generate tailored practice questions instantly on any topic, syllabus, or learning level from middle school to university.',
      icon: BrainCircuit,
      color: 'bg-[#FFD6E7]/60 text-[#D95370]',
      badge: 'Interactive',
      link: 'create-quiz' as PageId,
    },
    {
      id: 'flashcards',
      title: 'Smart Flashcards',
      description: 'Revise core definitions and high-yield concepts with spaced repetition cards and tactile 3D flipping.',
      icon: Layers,
      color: 'bg-[#E6DFFF]/70 text-[#9274E8]',
      badge: 'Memory Boost',
      link: 'flashcards' as PageId,
    },
    {
      id: 'pdf-notes',
      title: 'Learn from PDFs & Notes',
      description: 'Upload lecture slides, chapters, or study notes directly into the Quiz Generator to synthesize review quizzes.',
      icon: FileText,
      color: 'bg-[#D9EEFF]/70 text-[#2870BD]',
      badge: 'Time Saver',
      link: 'create-quiz' as PageId,
    },
    {
      id: 'progress',
      title: 'Track Your Progress',
      description: 'Deep analytics track accuracy, study streaks, and topic-wise strengths so you always know what to review next.',
      icon: TrendingUp,
      color: 'bg-[#D5F5E3]/70 text-[#31966B]',
      badge: 'Analytics',
      link: 'progress' as PageId,
    },
    {
      id: 'achievements',
      title: 'Achievements & Badges',
      description: 'Unlock milestone badges, celebrate study streaks, and download verifiable course completion certificates.',
      icon: Award,
      color: 'bg-[#FFE2CC]/70 text-[#C95C1E]',
      badge: 'Rewards',
      link: 'achievements' as PageId,
    },
    {
      id: 'contests',
      title: 'Weekly Challenges',
      description: 'Compete in friendly timed global tournaments with other students to climb the ranks and earn exclusive trophies.',
      icon: Swords,
      color: 'bg-[#FFF1B8]/70 text-[#B8860B]',
      badge: 'Tournaments',
      link: 'contests' as PageId,
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Choose Topic or Upload Notes',
      description: 'Type any subject like Python or Photosynthesis, or drop in your class PDF notes in seconds.',
      color: 'bg-[#FFD6E7]',
    },
    {
      step: '02',
      title: 'Create Quizzes & Flashcards',
      description: 'Customize question count, difficulty, and question styles tailored to your exact learning goals.',
      color: 'bg-[#E6DFFF]',
    },
    {
      step: '03',
      title: 'Practise, Track & Earn Rewards',
      description: 'Complete quizzes, build your daily streak, unlock achievements, and climb the student leaderboard.',
      color: 'bg-[#D5F5E3]',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFAFD] dark:bg-[#120E1F] text-[#352B48] dark:text-[#F5F1FD] transition-colors duration-200 relative overflow-hidden">
      {/* Soft Pastel Watercolor Clouds Reference Backdrop */}
      <div
        className="fixed inset-0 pointer-events-none -z-10 opacity-25 dark:opacity-10 bg-cover bg-center mix-blend-multiply dark:mix-blend-overlay transition-opacity duration-300"
        style={{ backgroundImage: "url('/assets/aistudio/image_529d6d49.png')" }}
      />

      <Header currentPage="landing" onNavigate={onNavigate} />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
          {/* Subtle pastel background ambient orbs */}
          <div className="absolute top-10 left-1/4 w-72 h-72 rounded-full bg-[#FFD6E7]/35 dark:bg-[#3D2232]/20 blur-3xl pointer-events-none -z-10" />
          <div className="absolute top-24 right-1/4 w-80 h-80 rounded-full bg-[#E6DFFF]/40 dark:bg-[#2B2144]/20 blur-3xl pointer-events-none -z-10" />
          <div className="absolute bottom-10 left-1/3 w-96 h-96 rounded-full bg-[#D5F5E3]/35 dark:bg-[#1B362A]/20 blur-3xl pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Heading & CTAs */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#1F1930] border border-[#E6DFFF] dark:border-[#332A4C] shadow-soft text-xs font-semibold text-[#9274E8] dark:text-[#A78BFA]">
                  <Sparkles className="w-3.5 h-3.5 fill-[#FFF1B8] text-[#9274E8]" />
                  <span>The Fun, Rewarding Way to Study</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#352B48] dark:text-[#F5F1FD] leading-[1.12] font-heading text-balance">
                  Learn Smarter, One Quiz at a Time!
                </h1>

                <p className="text-base sm:text-lg text-[#777187] dark:text-[#A8A1BC] max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Turn any topic or your study notes into interactive quizzes and flashcards. Make learning fun, simple, and rewarding.
                </p>

                {/* Primary & Secondary CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                  <button
                    onClick={() => onNavigate('account', { accountTab: 'register' })}
                    className="w-full sm:w-auto px-7 py-3.5 text-sm font-bold text-white bg-[#9274E8] hover:bg-[#7e5bd9] active:bg-[#6b47c6] rounded-2xl shadow-pastel-purple transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onNavigate('account', { accountTab: 'login' })}
                    className="w-full sm:w-auto px-6 py-3.5 text-sm font-bold text-[#352B48] dark:text-[#F5F1FD] bg-white dark:bg-[#1F1930] hover:bg-[#E6DFFF]/30 border border-[#E6DFFF] dark:border-[#332A4C] rounded-2xl transition-all shadow-soft flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Log In to Account</span>
                  </button>
                </div>

                {/* Social Proof / Trust Markers */}
                <div className="pt-4 border-t border-[#E6DFFF]/40 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#777187]">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#31966B]" />
                    <span>Free for students</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#31966B]" />
                    <span>PDF upload ready</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#31966B]" />
                    <span>Instant feedback</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Hero Showcase Preview */}
              <div className="lg:col-span-5 relative">
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  {/* Decorative pastel backdrop cards */}
                  <div className="absolute -top-3 -right-3 w-full h-full bg-[#FFD6E7]/60 rounded-3xl -rotate-2 -z-10" />
                  <div className="absolute -bottom-3 -left-3 w-full h-full bg-[#D5F5E3]/60 rounded-3xl rotate-2 -z-10" />

                  {/* Main Interactive Showcase Card */}
                  <div className="bg-white rounded-3xl p-6 shadow-soft-lg border border-[#E6DFFF] space-y-4">
                    {/* Header with Mascot & Level */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#E6DFFF]/50">
                      <div className="flex items-center gap-3">
                        <img
                          src="/src/assets/images/quizzy_mascot_hero_1793289274828.jpg"
                          alt="Quizzy Mascot"
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-[#9274E8]/20 shadow-soft"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-[#352B48]">Solar System Sprint</span>
                            <span className="text-[10px] font-semibold text-[#31966B] bg-[#D5F5E3] px-1.5 py-0.2 rounded">
                              Active
                            </span>
                          </div>
                          <p className="text-[11px] text-[#777187]">Question 3 of 5 · Medium</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#9274E8] bg-[#E6DFFF] px-2 py-1 rounded-lg">
                        +120 XP
                      </span>
                    </div>

                    {/* Interactive Question Card */}
                    <div className="p-4 rounded-2xl bg-[#D9EEFF]/40 border border-[#D9EEFF]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#2870BD]">
                        Quick Practice Sample
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-[#352B48] mt-1">
                        Which planet has the most violent dust storms in the solar system?
                      </p>

                      <div className="mt-3 space-y-1.5">
                        {[
                          { label: 'Mars (Correct answer!)', isCorrect: true },
                          { label: 'Jupiter', isCorrect: false },
                          { label: 'Mercury', isCorrect: false },
                        ].map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => setSelectedDemoOption(i)}
                            className={`w-full text-left text-xs px-3 py-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                              selectedDemoOption === i
                                ? opt.isCorrect
                                  ? 'bg-[#D5F5E3] border-[#31966B] text-[#31966B] font-bold shadow-xs'
                                  : 'bg-[#FFD6E7] border-[#D95370] text-[#D95370] font-bold'
                                : 'bg-white border-[#E6DFFF]/80 text-[#352B48] hover:border-[#9274E8]'
                            }`}
                          >
                            <span>{opt.label}</span>
                            {selectedDemoOption === i && (
                              <span className="text-[10px]">
                                {opt.isCorrect ? '✓ Correct!' : 'Try Mars'}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Interactive Mini Flashcard Preview */}
                    <div
                      onClick={() => setInteractiveFlip(!interactiveFlip)}
                      className="p-3.5 rounded-2xl bg-[#FFF1B8]/40 border border-[#FFF1B8] cursor-pointer hover:bg-[#FFF1B8]/60 transition-all text-xs"
                      title="Click to flip flashcard"
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold text-[#B8860B] uppercase">
                        <span>Interactive Flashcard Widget</span>
                        <span className="flex items-center gap-1 font-semibold normal-case">
                          <RotateCw className="w-3 h-3" /> Tap to Flip
                        </span>
                      </div>
                      <p className="mt-1.5 font-medium text-[#352B48]">
                        {!interactiveFlip
                          ? 'Q: What is the power currency of biological cells?'
                          : 'A: ATP (Adenosine Triphosphate), synthesized by mitochondria!'}
                      </p>
                    </div>

                    {/* Quick Action Button to Launch Full Player */}
                    <button
                      onClick={() => onNavigate('quiz-player')}
                      className="w-full py-2.5 bg-gradient-to-r from-[#9274E8] to-[#F08CB4] text-white text-xs font-bold rounded-xl shadow-soft hover:opacity-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Take Full Interactive Practice Quiz</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES GRID SECTION */}
        <section id="features" className="py-16 sm:py-24 bg-white/80 dark:bg-[#151120]/80 backdrop-blur-sm border-y border-[#E6DFFF]/60 dark:border-[#332A4C]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9274E8] dark:text-[#A78BFA] bg-[#E6DFFF] dark:bg-[#2B2144] px-3 py-1 rounded-full">
                Features Built For Mastery
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#352B48] dark:text-[#F5F1FD] mt-3 font-heading">
                Everything you need to excel in your studies
              </h2>
              <p className="text-sm text-[#777187] dark:text-[#A8A1BC] mt-2">
                Designed for optimal recall, active repetition, and rewarding progress tracking.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.id}
                    onClick={() => onNavigate(feat.link)}
                    className="p-6 rounded-2xl bg-[#FFFAFD] dark:bg-[#1F1930] border border-[#E6DFFF] dark:border-[#332A4C] hover:border-[#9274E8]/60 shadow-soft hover:shadow-soft-lg transition-all duration-200 flex flex-col justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-2xl ${feat.color} shadow-xs`}>
                          <Icon className="w-6 h-6 stroke-[2.2]" />
                        </div>
                        <span className="text-[10px] font-bold text-[#777187] dark:text-[#A8A1BC] bg-white dark:bg-[#151120] px-2 py-0.5 rounded-md border border-[#E6DFFF] dark:border-[#332A4C]">
                          {feat.badge}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-[#352B48] dark:text-[#F5F1FD] group-hover:text-[#9274E8] dark:group-hover:text-[#A78BFA] transition-colors font-heading">
                        {feat.title}
                      </h3>
                      <p className="text-xs text-[#777187] dark:text-[#A8A1BC] mt-2 leading-relaxed">
                        {feat.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-[#E6DFFF]/50 dark:border-[#332A4C] flex items-center text-xs font-semibold text-[#9274E8] dark:text-[#A78BFA] group-hover:translate-x-1 transition-transform">
                      <span>Open tool</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" className="py-16 sm:py-24 bg-[#FFFAFD] dark:bg-[#120E1F]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-[#31966B] dark:text-[#34D399] bg-[#D5F5E3] dark:bg-[#1B362A] px-3 py-1 rounded-full">
                Simple 3-Step Process
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#352B48] dark:text-[#F5F1FD] mt-3 font-heading">
                How Quizzy AI works
              </h2>
              <p className="text-sm text-[#777187] dark:text-[#A8A1BC] mt-2">
                From blank notebook to exam-ready confidence in three effortless steps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {steps.map((st, i) => (
                <div
                  key={st.step}
                  className="bg-white dark:bg-[#1F1930] rounded-3xl p-7 border border-[#E6DFFF] dark:border-[#332A4C] shadow-soft relative flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <span className={`w-12 h-12 rounded-2xl ${st.color} flex items-center justify-center font-extrabold text-base text-[#352B48] font-heading shadow-xs`}>
                        {st.step}
                      </span>
                      <span className="text-xs font-semibold text-[#777187] dark:text-[#A8A1BC]">Step {i + 1}</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#352B48] dark:text-[#F5F1FD] font-heading">
                      {st.title}
                    </h3>
                    <p className="text-xs text-[#777187] dark:text-[#A8A1BC] mt-2.5 leading-relaxed">
                      {st.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#E6DFFF]/40 dark:border-[#332A4C] flex items-center gap-1.5 text-xs text-[#31966B] dark:text-[#34D399] font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Instant and effortless</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Banner highlight */}
            <div className="mt-12 rounded-3xl overflow-hidden border border-[#E6DFFF] dark:border-[#332A4C] shadow-soft bg-white dark:bg-[#1F1930]">
              <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
                <div className="lg:col-span-6 p-8 lg:p-10 space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#9274E8] dark:text-[#A78BFA] bg-[#E6DFFF] dark:bg-[#2B2144] px-2.5 py-1 rounded-md">
                    Study Space
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#352B48] dark:text-[#F5F1FD] font-heading">
                    Turn your study desk into an interactive learning hub
                  </h3>
                  <p className="text-xs sm:text-sm text-[#777187] dark:text-[#A8A1BC] leading-relaxed">
                    Whether you are preparing for high school exams, university midterms, or medical boards, Quizzy AI adapts to your syllabus and pace.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => onNavigate('create-quiz')}
                      className="px-5 py-2.5 bg-[#9274E8] hover:bg-[#7e5bd9] text-white text-xs font-bold rounded-xl shadow-pastel-purple transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 fill-[#FFF1B8]" />
                      <span>Create Your First Quiz</span>
                    </button>
                  </div>
                </div>
                <div className="lg:col-span-6 h-64 lg:h-full min-h-[260px]">
                  <img
                    src="/src/assets/images/quizzy_study_banner_1793289288786.jpg"
                    alt="Study desk with Quizzy AI"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};
