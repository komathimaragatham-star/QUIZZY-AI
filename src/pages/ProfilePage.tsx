import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  AtSign,
  Shield,
  Bell,
  Palette,
  LogOut,
  Save,
  CheckCircle2,
  KeyRound,
  Sun,
  Moon,
} from 'lucide-react';
import { PageId } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, PastelTheme, ColorMode } from '../contexts/ThemeContext';

interface ProfilePageProps {
  onNavigate: (page: PageId) => void;
  onShowToast: (title: string, description?: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  onNavigate,
  onShowToast,
}) => {
  const { user, profile, progress, updateProfileData, logoutUser } = useAuth();
  const { pastelTheme, colorMode, setPastelTheme, setColorMode } = useTheme();

  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [primaryEmail, setPrimaryEmail] = useState(profile?.primaryEmail || '');
  const [altEmail, setAltEmail] = useState(profile?.alternativeEmail || '');
  const [phone, setPhone] = useState(profile?.phoneNumber || '');

  // Notification settings
  const [emailAlerts, setEmailAlerts] = useState(profile?.notificationPreferences?.emailAlerts ?? true);
  const [streakReminders, setStreakReminders] = useState(profile?.notificationPreferences?.streakReminders ?? true);
  const [contestAlerts, setContestAlerts] = useState(profile?.notificationPreferences?.contestAlerts ?? true);

  const [isSaving, setIsSaving] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setUsername(profile.username || '');
      setPrimaryEmail(profile.primaryEmail || '');
      setAltEmail(profile.alternativeEmail || '');
      setPhone(profile.phoneNumber || '');
      if (profile.notificationPreferences) {
        setEmailAlerts(profile.notificationPreferences.emailAlerts);
        setStreakReminders(profile.notificationPreferences.streakReminders);
        setContestAlerts(profile.notificationPreferences.contestAlerts);
      }
      if (profile.themePreference) {
        setPastelTheme(profile.themePreference);
      }
      if (profile.colorMode) {
        setColorMode(profile.colorMode);
      }
    }
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfileData({
        fullName,
        alternativeEmail: altEmail || undefined,
        phoneNumber: phone,
        themePreference: pastelTheme,
        colorMode: colorMode,
        notificationPreferences: {
          emailAlerts,
          streakReminders,
          contestAlerts,
        },
      });
      onShowToast('Profile Saved', 'Your changes have been synced to Cloud Firestore.', 'success');
    } catch (err: any) {
      onShowToast('Update Failed', err.message || 'Could not update profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleThemeChange = async (theme: PastelTheme) => {
    setPastelTheme(theme);
    if (user && profile) {
      try {
        await updateProfileData({ themePreference: theme });
      } catch (e) {
        // Ignored for fast optimistic update
      }
    }
    onShowToast('Theme Applied', `Switched theme to ${theme}.`, 'info');
  };

  const handleColorModeChange = async (mode: ColorMode) => {
    setColorMode(mode);
    if (user && profile) {
      try {
        await updateProfileData({ colorMode: mode });
      } catch (e) {
        // Ignored for fast optimistic update
      }
    }
    onShowToast('Display Mode', `Switched to ${mode} mode.`, 'info');
  };

  const currentStreak = progress?.currentStreakDays ?? 0;
  const totalXp = progress?.totalEarnedPoints ?? 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-[#E6DFFF]/50 dark:border-[#332A4C]">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-[#E6DFFF] dark:bg-[#332A4C] text-[#9274E8] dark:text-[#A78BFA]">
            <User className="w-5 h-5 stroke-[2.2]" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#352B48] dark:text-[#F5F1FD] font-heading">
            Profile & Settings
          </h1>
        </div>
        <p className="text-xs text-[#777187] dark:text-[#A8A1BC] mt-1">
          Manage your personal account credentials, learning notifications, and display themes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Avatar & Profile Form */}
        <div className="lg:col-span-8 bg-white dark:bg-[#1F1930] rounded-3xl p-6 sm:p-8 border border-[#E6DFFF] dark:border-[#332A4C] shadow-soft space-y-6">
          {/* Avatar Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-6 border-b border-[#E6DFFF]/50 dark:border-[#332A4C]">
            <div className="w-20 h-20 rounded-2xl bg-[#E6DFFF] dark:bg-[#332A4C] text-[#9274E8] dark:text-[#A78BFA] font-bold text-3xl flex items-center justify-center border-2 border-[#9274E8]/40 shadow-soft shrink-0">
              {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#352B48] dark:text-[#F5F1FD] font-heading">{fullName || 'Student'}</h3>
              <p className="text-xs text-[#777187] dark:text-[#A8A1BC]">@{username || 'learner'}</p>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="font-bold text-[#9274E8] dark:text-[#A78BFA] bg-[#E6DFFF] dark:bg-[#332A4C] px-2 py-0.5 rounded-md tabular-nums">
                  {totalXp} XP
                </span>
                <span className="font-bold text-[#C95C1E] bg-[#FFE2CC] dark:bg-[#3D291F] px-2 py-0.5 rounded-md tabular-nums">
                  {currentStreak} Day Streak
                </span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#352B48] dark:text-[#F5F1FD]">
              Personal Information
            </h4>

            <div>
              <label className="block text-xs font-bold text-[#352B48] dark:text-[#F5F1FD] mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFFAFD] dark:bg-[#151120] rounded-xl border border-[#E6DFFF] dark:border-[#332A4C] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#9274E8] dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#352B48] dark:text-[#F5F1FD] mb-1">
                  Username <span className="text-[#777187] font-normal">(Verified Unique)</span>
                </label>
                <input
                  type="text"
                  value={username}
                  disabled
                  className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-[#151120] rounded-xl border border-[#E6DFFF] dark:border-[#332A4C] text-xs font-medium text-[#777187] cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#352B48] dark:text-[#F5F1FD] mb-1">
                  Phone Number <span className="text-[#D95370]">* (Compulsory)</span>
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-[#FFFAFD] dark:bg-[#151120] rounded-xl border border-[#E6DFFF] dark:border-[#332A4C] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#9274E8] dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#352B48] dark:text-[#F5F1FD] mb-1">Primary Email</label>
                <input
                  type="email"
                  value={primaryEmail}
                  disabled
                  className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-[#151120] rounded-xl border border-[#E6DFFF] dark:border-[#332A4C] text-xs font-medium text-[#777187] cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#352B48] dark:text-[#F5F1FD] mb-1">Alternative Email</label>
                <input
                  type="email"
                  value={altEmail}
                  onChange={(e) => setAltEmail(e.target.value)}
                  placeholder="Optional secondary email"
                  className="w-full px-3.5 py-2.5 bg-[#FFFAFD] dark:bg-[#151120] rounded-xl border border-[#E6DFFF] dark:border-[#332A4C] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#9274E8] dark:text-white"
                />
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-[#9274E8] hover:bg-[#7e5bd9] text-white text-xs font-bold rounded-xl shadow-pastel-purple transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving to Firestore...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Preferences, Themes & Security */}
        <div className="lg:col-span-4 space-y-4">
          {/* Theme Selector (Section 9) */}
          <div className="bg-white dark:bg-[#1F1930] rounded-3xl p-6 border border-[#E6DFFF] dark:border-[#332A4C] shadow-soft space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E6DFFF]/50 dark:border-[#332A4C]">
              <Palette className="w-4 h-4 text-[#9274E8]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#352B48] dark:text-[#F5F1FD]">
                Pastel Theme
              </h4>
            </div>

            {/* 3 Distinct Pastel Themes */}
            <div className="space-y-2">
              {[
                {
                  id: 'pastel-delight' as PastelTheme,
                  label: 'Pastel Delight',
                  desc: 'Soft pink, lavender, mint & baby blue',
                  indicator: 'bg-[#FFD6E7] border-[#E6DFFF]',
                },
                {
                  id: 'high-contrast' as PastelTheme,
                  label: 'High Contrast Pastel',
                  desc: 'Stronger contrast & distinct card borders',
                  indicator: 'bg-[#FFB3D4] border-[#7C5CE0]',
                },
                {
                  id: 'soft-lavender' as PastelTheme,
                  label: 'Soft Lavender Focus',
                  desc: 'Minimalist lavender and violet accents',
                  indicator: 'bg-[#EDE9FE] border-[#8B5CF6]',
                },
              ].map((th) => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => handleThemeChange(th.id)}
                  className={`w-full text-left p-3 rounded-2xl border text-xs transition-all cursor-pointer flex items-center justify-between ${
                    pastelTheme === th.id
                      ? 'bg-[#E6DFFF] dark:bg-[#332A4C] border-[#9274E8] dark:border-[#A78BFA] text-[#352B48] dark:text-white font-bold shadow-xs'
                      : 'bg-[#FFFAFD] dark:bg-[#151120] border-[#E6DFFF] dark:border-[#332A4C] text-[#777187] dark:text-[#A8A1BC] hover:border-[#9274E8]'
                  }`}
                >
                  <div>
                    <p className="font-bold">{th.label}</p>
                    <p className="text-[10px] text-[#777187] dark:text-[#A8A1BC] mt-0.5">{th.desc}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 ${th.indicator}`} />
                </button>
              ))}
            </div>

            {/* Separate Light / Dark Mode Switch */}
            <div className="pt-3 border-t border-[#E6DFFF]/40 dark:border-[#332A4C]">
              <span className="text-[11px] font-bold text-[#777187] dark:text-[#A8A1BC] uppercase tracking-wider block mb-2">
                Display Mode
              </span>
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#FFFAFD] dark:bg-[#151120] rounded-2xl border border-[#E6DFFF] dark:border-[#332A4C]">
                <button
                  type="button"
                  onClick={() => handleColorModeChange('light')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    colorMode === 'light'
                      ? 'bg-gradient-to-r from-[#FFD6E7] to-[#E6DFFF] text-[#352B48] shadow-xs font-bold'
                      : 'text-[#777187] hover:text-[#352B48] dark:text-[#A8A1BC] dark:hover:text-white'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-[#D95370]" />
                  <span>Light Mode (Pastel)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleColorModeChange('dark')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    colorMode === 'dark'
                      ? 'bg-[#332A4C] text-[#FDE047] shadow-xs font-bold'
                      : 'text-[#777187] hover:text-[#352B48] dark:text-[#A8A1BC] dark:hover:text-white'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-[#FDE047]" />
                  <span>Dark Mode (Elegant)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white dark:bg-[#1F1930] rounded-3xl p-6 border border-[#E6DFFF] dark:border-[#332A4C] shadow-soft space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E6DFFF]/50 dark:border-[#332A4C]">
              <Bell className="w-4 h-4 text-[#9274E8]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#352B48] dark:text-[#F5F1FD]">
                Notifications
              </h4>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-semibold text-[#352B48] dark:text-[#F5F1FD]">Daily Streak Reminders</p>
                  <p className="text-[10px] text-[#777187] dark:text-[#A8A1BC]">Notify before streak resets</p>
                </div>
                <input
                  type="checkbox"
                  checked={streakReminders}
                  onChange={(e) => setStreakReminders(e.target.checked)}
                  className="w-4 h-4 rounded text-[#9274E8] focus:ring-[#9274E8]"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-semibold text-[#352B48] dark:text-[#F5F1FD]">Weekly Contest Alerts</p>
                  <p className="text-[10px] text-[#777187] dark:text-[#A8A1BC]">New tournament announcements</p>
                </div>
                <input
                  type="checkbox"
                  checked={contestAlerts}
                  onChange={(e) => setContestAlerts(e.target.checked)}
                  className="w-4 h-4 rounded text-[#9274E8] focus:ring-[#9274E8]"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-semibold text-[#352B48] dark:text-[#F5F1FD]">Product Updates</p>
                  <p className="text-[10px] text-[#777187] dark:text-[#A8A1BC]">New features and flashcard sets</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 rounded text-[#9274E8] focus:ring-[#9274E8]"
                />
              </label>
            </div>
          </div>

          {/* Account Security & Sign Out */}
          <div className="bg-white dark:bg-[#1F1930] rounded-3xl p-6 border border-[#E6DFFF] dark:border-[#332A4C] shadow-soft space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E6DFFF]/50 dark:border-[#332A4C]">
              <Shield className="w-4 h-4 text-[#31966B]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#352B48] dark:text-[#F5F1FD]">
                Account Session
              </h4>
            </div>

            <button
              type="button"
              onClick={() => setShowSignOutModal(true)}
              className="w-full text-left p-2.5 rounded-xl border border-[#FFD6E7] dark:border-[#3D2232] text-xs font-semibold text-[#D95370] dark:text-[#F87171] hover:bg-[#FFD6E7]/40 flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <LogOut className="w-3.5 h-3.5 text-[#D95370]" />
                <span>Sign Out of Quizzy AI</span>
              </span>
              <span className="text-[10px]">Exit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sign Out Confirmation Modal */}
      {showSignOutModal && (
        <div className="fixed inset-0 z-50 bg-[#352B48]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1F1930] rounded-3xl max-w-sm w-full p-6 shadow-soft-lg border border-[#E6DFFF] dark:border-[#332A4C] text-center space-y-4 animate-in fade-in duration-150">
            <div className="w-12 h-12 rounded-2xl bg-[#FFD6E7] text-[#D95370] flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#352B48] dark:text-[#F5F1FD] font-heading">
                Sign Out of Session?
              </h3>
              <p className="text-xs text-[#777187] dark:text-[#A8A1BC] mt-1">
                You will be signed out of Firebase Authentication and returned to the welcome landing page.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSignOutModal(false)}
                className="flex-1 py-2 text-xs font-semibold text-[#777187] bg-[#FFFAFD] dark:bg-[#151120] border border-[#E6DFFF] dark:border-[#332A4C] rounded-xl hover:bg-[#E6DFFF]/30"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowSignOutModal(false);
                  await logoutUser();
                  onNavigate('landing');
                  onShowToast('Signed Out', 'You have been safely signed out.', 'info');
                }}
                className="flex-1 py-2 text-xs font-bold text-white bg-[#D95370] hover:bg-[#c23d5a] rounded-xl shadow-soft cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
