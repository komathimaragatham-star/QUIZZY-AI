import React, { useState } from 'react';
import { QuizzyLogo } from './QuizzyLogo';
import { PageId } from '../../types';
import { Heart, Shield, HelpCircle, FileText, ArrowRight, X } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: PageId, extra?: { accountTab?: 'login' | 'register' }) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [activeModal, setActiveModal] = useState<'about' | 'help' | 'privacy' | null>(null);

  return (
    <footer className="bg-white dark:bg-[#151120] border-t border-[#E6DFFF]/70 dark:border-[#332A4C] pt-16 pb-12 mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Closing CTA */}
        <div className="mb-14 p-8 rounded-3xl bg-gradient-to-r from-[#FFD6E7]/50 via-[#E6DFFF]/50 to-[#D9EEFF]/50 dark:from-[#3D2232]/50 dark:via-[#2B2144]/50 dark:to-[#1A2F45]/50 border border-white/80 dark:border-[#332A4C] shadow-soft text-center max-w-4xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[#9274E8] dark:text-[#A78BFA] bg-white/80 dark:bg-[#1F1930] px-3 py-1 rounded-full">
            Start Your Journey Today
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#352B48] dark:text-[#F5F1FD] mt-3 font-heading">
            Ready to turn your study notes into superpower recall?
          </h2>
          <p className="text-sm text-[#777187] dark:text-[#A8A1BC] max-w-xl mx-auto mt-2">
            Join thousands of students mastering complex subjects through bite-sized quizzes, interactive flashcards, and automated AI assistance.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('account', { accountTab: 'register' })}
              className="px-6 py-3 text-sm font-bold text-white bg-[#9274E8] hover:bg-[#7e5bd9] shadow-pastel-purple rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Get Started for Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-6 py-3 text-sm font-bold text-[#352B48] dark:text-white bg-white dark:bg-[#1F1930] hover:bg-[#E6DFFF]/30 dark:hover:bg-[#332A4C] border border-[#E6DFFF] dark:border-[#332A4C] rounded-xl transition-all cursor-pointer"
            >
              <span>Explore Student Dashboard</span>
            </button>
          </div>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-[#E6DFFF]/40 dark:border-[#332A4C]">
          <div className="space-y-3 md:col-span-1">
            <QuizzyLogo size="md" showSubtitle />
            <p className="text-xs text-[#777187] dark:text-[#A8A1BC] leading-relaxed">
              Making learning fun, interactive, and rewarding for students of every age and topic.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#352B48] dark:text-[#F5F1FD] uppercase tracking-wider mb-3">
              Learning Tools
            </h4>
            <ul className="space-y-2 text-xs text-[#777187] dark:text-[#A8A1BC]">
              <li>
                <button
                  onClick={() => onNavigate('create-quiz')}
                  className="hover:text-[#9274E8] dark:hover:text-white transition-colors cursor-pointer"
                >
                  AI Quiz Generator
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('flashcards')}
                  className="hover:text-[#9274E8] dark:hover:text-white transition-colors cursor-pointer"
                >
                  Smart Flashcards
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('create-quiz')}
                  className="hover:text-[#9274E8] dark:hover:text-white transition-colors cursor-pointer"
                >
                  Create Quiz from PDF Notes
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contests')}
                  className="hover:text-[#9274E8] dark:hover:text-white transition-colors cursor-pointer"
                >
                  Weekly Student Contests
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#352B48] dark:text-[#F5F1FD] uppercase tracking-wider mb-3">
              Community & Progress
            </h4>
            <ul className="space-y-2 text-xs text-[#777187] dark:text-[#A8A1BC]">
              <li>
                <button
                  onClick={() => onNavigate('leaderboard')}
                  className="hover:text-[#9274E8] dark:hover:text-white transition-colors cursor-pointer"
                >
                  Global Leaderboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('achievements')}
                  className="hover:text-[#9274E8] dark:hover:text-white transition-colors cursor-pointer"
                >
                  Badges & Certificates
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('progress')}
                  className="hover:text-[#9274E8] dark:hover:text-white transition-colors cursor-pointer"
                >
                  Streaks & Analytics
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#352B48] dark:text-[#F5F1FD] uppercase tracking-wider mb-3">
              Platform & Safety
            </h4>
            <ul className="space-y-2 text-xs text-[#777187] dark:text-[#A8A1BC]">
              <li>
                <button
                  onClick={() => setActiveModal('about')}
                  className="hover:text-[#9274E8] dark:hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5 text-[#F08CB4]" /> About Quizzy AI
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal('help')}
                  className="hover:text-[#9274E8] dark:hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-[#9274E8]" /> Help & FAQ
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal('privacy')}
                  className="hover:text-[#9274E8] dark:hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-[#31966B]" /> Privacy & Terms
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#777187] dark:text-[#A8A1BC] gap-4">
          <p>© 2026 Quizzy AI Inc. Built for thoughtful students everywhere.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-[#31966B] dark:text-[#34D399]">
              <span className="w-2 h-2 rounded-full bg-[#31966B] dark:bg-[#34D399]"></span>
              <span>All Systems Operational</span>
            </span>
            <span>·</span>
            <span className="text-[#9274E8] dark:text-[#A78BFA] font-medium">Firebase Protected</span>
          </div>
        </div>
      </div>

      {/* Info Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-[#352B48]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1F1930] rounded-2xl max-w-lg w-full p-6 shadow-soft-lg border border-[#E6DFFF] dark:border-[#332A4C] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6DFFF]/60 dark:border-[#332A4C]">
              <h3 className="text-base font-bold text-[#352B48] dark:text-[#F5F1FD] font-heading">
                {activeModal === 'about' && 'About Quizzy AI'}
                {activeModal === 'help' && 'Quizzy AI Help Center'}
                {activeModal === 'privacy' && 'Privacy Policy & Student Data'}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg hover:bg-[#E6DFFF]/40 dark:hover:bg-[#332A4C] text-[#777187] hover:text-[#352B48] dark:text-[#A8A1BC] dark:hover:text-white"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 text-xs text-[#352B48] dark:text-[#F5F1FD] space-y-3 leading-relaxed max-h-[60vh] overflow-y-auto">
              {activeModal === 'about' && (
                <>
                  <p>
                    Quizzy AI is dedicated to transforming passive studying into active, joyful mastery. We believe every student learns best when information is broken down into engaging questions, spaced repetition flashcards, and personalized practice.
                  </p>
                  <p>
                    Our mission is to help learners build authentic recall confidence through continuous practice and meaningful rewards.
                  </p>
                </>
              )}

              {activeModal === 'help' && (
                <div className="space-y-3">
                  <div>
                    <h5 className="font-bold text-[#9274E8] dark:text-[#A78BFA]">How are quizzes generated?</h5>
                    <p className="text-[#777187] dark:text-[#A8A1BC] mt-0.5">
                      You can type any topic or upload a PDF document directly inside Create Quiz. Questions are automatically tailored to your selected difficulty and learning level.
                    </p>
                  </div>
                  <div>
                    <h5 className="font-bold text-[#9274E8] dark:text-[#A78BFA]">How does the leaderboard work?</h5>
                    <p className="text-[#777187] dark:text-[#A8A1BC] mt-0.5">
                      Every correctly answered quiz question awards 50 verified XP points. Scoring 80% or higher earns an additional 50-point mastery bonus.
                    </p>
                  </div>
                </div>
              )}

              {activeModal === 'privacy' && (
                <div className="space-y-2">
                  <p>
                    We protect student privacy with verified Firebase Authentication and granular Firestore Security Rules.
                  </p>
                  <p>
                    Passwords and personal emails are never shared or published. Your learning scores and quiz attempts are linked to your secure user identifier.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#E6DFFF]/40 dark:border-[#332A4C] flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-[#9274E8] text-white rounded-xl text-xs font-bold hover:bg-[#7e5bd9] transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
