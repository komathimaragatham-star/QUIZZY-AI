import React, { useState } from 'react';
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  AtSign,
  ArrowRight,
  Sparkles,
  KeyRound,
  CheckCircle2,
  X,
  AlertCircle,
  Check,
} from 'lucide-react';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { PageId, AccountTab } from '../types';
import { useAuth, validatePasswordStrength } from '../contexts/AuthContext';

interface AccountPageProps {
  initialTab?: AccountTab;
  redirectAfterLogin?: PageId;
  onNavigate: (page: PageId) => void;
  onShowToast: (title: string, description?: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  initialTab = 'register',
  redirectAfterLogin = 'dashboard',
  onNavigate,
  onShowToast,
}) => {
  const { registerUser, loginUser, loginWithGoogle, sendResetEmail, isConfigured } = useAuth();
  const [activeTab, setActiveTab] = useState<AccountTab>(initialTab);

  // Registration Form State
  const [regFullName, setRegFullName] = useState('');
  const [regPrimaryEmail, setRegPrimaryEmail] = useState('');
  const [regAltEmail, setRegAltEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Loading & Error States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Forgot Password Modal
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordSubmitted, setForgotPasswordSubmitted] = useState(false);

  // Password Requirements Live Analysis
  const passwordCriteria = validatePasswordStrength(regPassword);
  const passwordsMatch = regPassword.length > 0 && regPassword === regConfirmPassword;

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});

    const errors: Record<string, string> = {};

    if (!regFullName.trim()) errors.fullName = 'Full name is required.';
    if (!regPrimaryEmail.trim()) {
      errors.primaryEmail = 'Primary email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regPrimaryEmail.trim())) {
      errors.primaryEmail = 'Please enter a valid email address.';
    }

    if (regAltEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regAltEmail.trim())) {
      errors.altEmail = 'Please enter a valid email address.';
    }

    if (!regPhone.trim()) {
      errors.phone = 'Phone number is compulsory.';
    }

    if (!regUsername.trim()) {
      errors.username = 'Username is required.';
    } else if (regUsername.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters.';
    }

    if (!passwordCriteria.minLength || !passwordCriteria.hasUpper || !passwordCriteria.hasLower || !passwordCriteria.hasNumber || !passwordCriteria.hasSpecial) {
      errors.password = 'Please meet all password security requirements.';
    }

    if (regPassword !== regConfirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      onShowToast('Incomplete Form', 'Please fix the highlighted fields to continue.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await registerUser({
        fullName: regFullName,
        primaryEmail: regPrimaryEmail,
        alternativeEmail: regAltEmail.trim() || undefined,
        phoneNumber: regPhone,
        username: regUsername,
        password: regPassword,
      });

      onShowToast('Account Created!', 'Welcome to Quizzy AI.', 'success');
      onNavigate(redirectAfterLogin);
    } catch (err: any) {
      const msg = err.message || 'Registration failed.';
      setGeneralError(msg);
      if (msg.toLowerCase().includes('username')) {
        setFieldErrors({ username: msg });
      } else if (msg.toLowerCase().includes('phone')) {
        setFieldErrors({ phone: msg });
      } else if (msg.toLowerCase().includes('primary email') || msg.toLowerCase().includes('email address already')) {
        setFieldErrors({ primaryEmail: msg });
      } else if (msg.toLowerCase().includes('alternative email')) {
        setFieldErrors({ altEmail: msg });
      }
      onShowToast('Registration Error', msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});

    if (!loginIdentifier.trim()) {
      setFieldErrors({ identifier: 'Please enter your username or email.' });
      return;
    }
    if (!loginPassword) {
      setFieldErrors({ password: 'Password is required.' });
      return;
    }

    try {
      setIsSubmitting(true);
      await loginUser(loginIdentifier, loginPassword);
      onShowToast('Welcome back!', 'Successfully signed in.', 'success');
      onNavigate(redirectAfterLogin);
    } catch (err: any) {
      let friendlyMessage = err.message || 'Login failed.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        friendlyMessage = 'Invalid email/username or password. Please try again.';
      } else if (err.code === 'auth/too-many-requests') {
        friendlyMessage = 'Too many failed login attempts. Please reset your password or try again later.';
      }
      setGeneralError(friendlyMessage);
      onShowToast('Sign-In Error', friendlyMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignInClick = async () => {
    setGeneralError(null);
    try {
      setIsSubmitting(true);
      await loginWithGoogle();
      onShowToast('Google Sign-In Successful', 'Welcome to Quizzy AI.', 'success');
      onNavigate(redirectAfterLogin);
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setGeneralError(err.message || 'Google sign-in failed.');
        onShowToast('Authentication Error', err.message || 'Google sign-in failed.', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotPasswordEmail.trim())) {
      onShowToast('Invalid Email', 'Please enter a valid registered email address.', 'error');
      return;
    }

    try {
      await sendResetEmail(forgotPasswordEmail);
      setForgotPasswordSubmitted(true);
      onShowToast('Reset Link Sent', `Password reset instructions sent to ${forgotPasswordEmail}.`, 'success');
    } catch (err: any) {
      onShowToast('Reset Error', err.message || 'Failed to send reset email.', 'error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFAFD] dark:bg-[#151120] text-[#352B48] dark:text-[#F5F1FD] relative overflow-hidden">
      {/* Soft Pastel Watercolor Clouds Reference Backdrop */}
      <div
        className="fixed inset-0 pointer-events-none -z-10 opacity-25 dark:opacity-10 bg-cover bg-center mix-blend-multiply dark:mix-blend-overlay transition-opacity duration-300"
        style={{ backgroundImage: "url('/assets/aistudio/image_529d6d49.png')" }}
      />
      <Header currentPage="account" onNavigate={onNavigate} />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-xl w-full">
          {/* Main Auth Card */}
          <div className="bg-white dark:bg-[#1F1930] rounded-3xl p-6 sm:p-8 shadow-soft-lg border border-[#E6DFFF] dark:border-[#332A4C]">
            {/* Tabs */}
            <div className="flex items-center p-1.5 bg-[#FFFAFD] dark:bg-[#151120] rounded-2xl border border-[#E6DFFF] dark:border-[#332A4C] mb-6">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setGeneralError(null);
                  setFieldErrors({});
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-white dark:bg-[#1F1930] text-[#9274E8] dark:text-[#A78BFA] shadow-sm'
                    : 'text-[#777187] dark:text-[#A8A1BC] hover:text-[#352B48] dark:hover:text-white'
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setGeneralError(null);
                  setFieldErrors({});
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-white dark:bg-[#1F1930] text-[#9274E8] dark:text-[#A78BFA] shadow-sm'
                    : 'text-[#777187] dark:text-[#A8A1BC] hover:text-[#352B48] dark:hover:text-white'
                }`}
              >
                Log In
              </button>
            </div>

            {generalError && (
              <div className="mb-5 p-3.5 rounded-2xl bg-[#FFD6E7]/80 dark:bg-[#3D2232] border border-[#D95370]/30 text-xs text-[#D95370] dark:text-[#F87171] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{generalError}</span>
              </div>
            )}

            {/* CREATE ACCOUNT FORM */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4" noValidate>
                <div>
                  <label className="block text-xs font-bold text-[#352B48] dark:text-[#F5F1FD] mb-1">
                    Full Name <span className="text-[#D95370]">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#777187] absolute left-3.5 top-3" />
                    <input
                      type="text"
                      placeholder="e.g. Alex Chen"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      className={`w-full pl-10 pr-3.5 py-2.5 bg-[#FFFAFD] dark:bg-[#151120] rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-[#9274E8] transition-all ${
                        fieldErrors.fullName ? 'border-[#D95370]' : 'border-[#E6DFFF] dark:border-[#332A4C]'
                      }`}
                    />
                  </div>
                  {fieldErrors.fullName && (
                    <p className="text-[11px] text-[#D95370] mt-1">{fieldErrors.fullName}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#352B48] dark:text-[#F5F1FD] mb-1">
                      Primary Email <span className="text-[#D95370]">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#777187] absolute left-3.5 top-3" />
                      <input
                        type="email"
                        placeholder="student@school.edu"
                        value={regPrimaryEmail}
                        onChange={(e) => setRegPrimaryEmail(e.target.value)}
                        className={`w-full pl-10 pr-3.5 py-2.5 bg-[#FFFAFD] dark:bg-[#151120] rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-[#9274E8] transition-all ${
                          fieldErrors.primaryEmail ? 'border-[#D95370]' : 'border-[#E6DFFF] dark:border-[#332A4C]'
                        }`}
                      />
                    </div>
                    {fieldErrors.primaryEmail && (
                      <p className="text-[11px] text-[#D95370] mt-1">{fieldErrors.primaryEmail}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#352B48] dark:text-[#F5F1FD] mb-1">
                      Alternative Email <span className="text-[#777187] font-normal">(Optional, must be unique)</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#777187] absolute left-3.5 top-3" />
                      <input
                        type="email"
                        placeholder="personal@gmail.com"
                        value={regAltEmail}
                        onChange={(e) => setRegAltEmail(e.target.value)}
                        className={`w-full pl-10 pr-3.5 py-2.5 bg-[#FFFAFD] dark:bg-[#151120] rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-[#9274E8] transition-all ${
                          fieldErrors.altEmail ? 'border-[#D95370]' : 'border-[#E6DFFF] dark:border-[#332A4C]'
                        }`}
                      />
                    </div>
                    {fieldErrors.altEmail && (
                      <p className="text-[11px] text-[#D95370] mt-1">{fieldErrors.altEmail}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#352B48] dark:text-[#F5F1FD] mb-1">
                      Phone Number <span className="text-[#D95370]">* (Compulsory)</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#777187] absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        placeholder="+1 555 382 9104"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className={`w-full pl-10 pr-3.5 py-2.5 bg-[#FFFAFD] dark:bg-[#151120] rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-[#9274E8] transition-all ${
                          fieldErrors.phone ? 'border-[#D95370]' : 'border-[#E6DFFF] dark:border-[#332A4C]'
                        }`}
                      />
                    </div>
                    {fieldErrors.phone && (
                      <p className="text-[11px] text-[#D95370] mt-1">{fieldErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#352B48] dark:text-[#F5F1FD] mb-1">
                      Unique Username <span className="text-[#D95370]">*</span>
                    </label>
                    <div className="relative">
                      <AtSign className="w-4 h-4 text-[#777187] absolute left-3.5 top-3" />
                      <input
                        type="text"
                        placeholder="alex_learner"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        className={`w-full pl-10 pr-3.5 py-2.5 bg-[#FFFAFD] dark:bg-[#151120] rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-[#9274E8] transition-all ${
                          fieldErrors.username ? 'border-[#D95370]' : 'border-[#E6DFFF] dark:border-[#332A4C]'
                        }`}
                      />
                    </div>
                    {fieldErrors.username && (
                      <p className="text-[11px] text-[#D95370] mt-1">{fieldErrors.username}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#352B48] dark:text-[#F5F1FD] mb-1">
                      Password <span className="text-[#D95370]">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#777187] absolute left-3.5 top-3" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        placeholder="Min 8 characters"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className={`w-full pl-10 pr-10 py-2.5 bg-[#FFFAFD] dark:bg-[#151120] rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-[#9274E8] transition-all ${
                          fieldErrors.password ? 'border-[#D95370]' : 'border-[#E6DFFF] dark:border-[#332A4C]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-2.5 text-[#777187] hover:text-[#352B48] dark:hover:text-white p-0.5 cursor-pointer"
                        aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#352B48] dark:text-[#F5F1FD] mb-1">
                      Confirm Password <span className="text-[#D95370]">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#777187] absolute left-3.5 top-3" />
                      <input
                        type={showRegConfirmPassword ? 'text' : 'password'}
                        placeholder="Re-enter password"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        className={`w-full pl-10 pr-10 py-2.5 bg-[#FFFAFD] dark:bg-[#151120] rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-[#9274E8] transition-all ${
                          fieldErrors.confirmPassword ? 'border-[#D95370]' : 'border-[#E6DFFF] dark:border-[#332A4C]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                        className="absolute right-3 top-2.5 text-[#777187] hover:text-[#352B48] dark:hover:text-white p-0.5 cursor-pointer"
                        aria-label={showRegConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && (
                      <p className="text-[11px] text-[#D95370] mt-1">{fieldErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* Password Requirements Indicator */}
                <div className="p-3 bg-[#FFFAFD] dark:bg-[#151120] rounded-xl border border-[#E6DFFF] dark:border-[#332A4C] space-y-1.5 text-[11px]">
                  <span className="font-bold text-[#777187] dark:text-[#A8A1BC] block">
                    Password Requirements:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className={`flex items-center gap-1.5 ${passwordCriteria.minLength ? 'text-[#31966B]' : 'text-[#777187]'}`}>
                      <Check className={`w-3.5 h-3.5 ${passwordCriteria.minLength ? 'text-[#31966B]' : 'opacity-30'}`} />
                      <span>At least 8 characters</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordCriteria.hasUpper ? 'text-[#31966B]' : 'text-[#777187]'}`}>
                      <Check className={`w-3.5 h-3.5 ${passwordCriteria.hasUpper ? 'text-[#31966B]' : 'opacity-30'}`} />
                      <span>One uppercase letter</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordCriteria.hasLower ? 'text-[#31966B]' : 'text-[#777187]'}`}>
                      <Check className={`w-3.5 h-3.5 ${passwordCriteria.hasLower ? 'text-[#31966B]' : 'opacity-30'}`} />
                      <span>One lowercase letter</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordCriteria.hasNumber ? 'text-[#31966B]' : 'text-[#777187]'}`}>
                      <Check className={`w-3.5 h-3.5 ${passwordCriteria.hasNumber ? 'text-[#31966B]' : 'opacity-30'}`} />
                      <span>At least one number</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordCriteria.hasSpecial ? 'text-[#31966B]' : 'text-[#777187]'}`}>
                      <Check className={`w-3.5 h-3.5 ${passwordCriteria.hasSpecial ? 'text-[#31966B]' : 'opacity-30'}`} />
                      <span>Special character (!@#$)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordsMatch ? 'text-[#31966B]' : 'text-[#777187]'}`}>
                      <Check className={`w-3.5 h-3.5 ${passwordsMatch ? 'text-[#31966B]' : 'opacity-30'}`} />
                      <span>Passwords match</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-4 py-3 bg-[#9274E8] hover:bg-[#7e5bd9] text-white text-xs font-bold rounded-xl shadow-pastel-purple transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Creating Secure Account...' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-center text-xs text-[#777187] pt-2">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="font-bold text-[#9274E8] hover:underline cursor-pointer"
                  >
                    Log In
                  </button>
                </p>
              </form>
            )}

            {/* LOGIN FORM */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
                <div>
                  <label className="block text-xs font-bold text-[#352B48] dark:text-[#F5F1FD] mb-1">
                    Primary Email Address <span className="text-[#D95370]">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#777187] absolute left-3.5 top-3" />
                    <input
                      type="email"
                      placeholder="e.g. student@school.edu"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      className={`w-full pl-10 pr-3.5 py-2.5 bg-[#FFFAFD] dark:bg-[#151120] rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-[#9274E8] transition-all ${
                        fieldErrors.identifier ? 'border-[#D95370]' : 'border-[#E6DFFF] dark:border-[#332A4C]'
                      }`}
                    />
                  </div>
                  {fieldErrors.identifier && (
                    <p className="text-[11px] text-[#D95370] mt-1">{fieldErrors.identifier}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-[#352B48] dark:text-[#F5F1FD]">
                      Password <span className="text-[#D95370]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPasswordModal(true);
                        setForgotPasswordSubmitted(false);
                      }}
                      className="text-[11px] font-semibold text-[#9274E8] hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#777187] absolute left-3.5 top-3" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className={`w-full pl-10 pr-10 py-2.5 bg-[#FFFAFD] dark:bg-[#151120] rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-[#9274E8] transition-all ${
                        fieldErrors.password ? 'border-[#D95370]' : 'border-[#E6DFFF] dark:border-[#332A4C]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-2.5 text-[#777187] hover:text-[#352B48] dark:hover:text-white p-0.5 cursor-pointer"
                      aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-[11px] text-[#D95370] mt-1">{fieldErrors.password}</p>
                  )}
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#777187]">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-[#9274E8] focus:ring-[#9274E8] border-[#E6DFFF]"
                    />
                    <span>Remember me on this browser</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3 bg-[#9274E8] hover:bg-[#7e5bd9] text-white text-xs font-bold rounded-xl shadow-pastel-purple transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Signing In...' : 'Log In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#E6DFFF] dark:border-[#332A4C]" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-white dark:bg-[#1F1930] px-3 text-[#777187]">Or continue with</span>
                  </div>
                </div>

                {/* Continue with Google button */}
                <button
                  type="button"
                  onClick={handleGoogleSignInClick}
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-white dark:bg-[#151120] border border-[#E6DFFF] dark:border-[#332A4C] hover:bg-[#FFFAFD] dark:hover:bg-[#1F1930] text-[#352B48] dark:text-[#F5F1FD] text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-soft disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <p className="text-center text-xs text-[#777187] pt-2">
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="font-bold text-[#9274E8] hover:underline cursor-pointer"
                  >
                    Create Account
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 bg-[#352B48]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1F1930] rounded-2xl max-w-md w-full p-6 shadow-soft-lg border border-[#E6DFFF] dark:border-[#332A4C] animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6DFFF]/60 dark:border-[#332A4C]">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#9274E8]" />
                <h3 className="text-sm font-bold text-[#352B48] dark:text-[#F5F1FD] font-heading">
                  Reset Password
                </h3>
              </div>
              <button
                onClick={() => setShowForgotPasswordModal(false)}
                className="p-1 rounded-lg text-[#777187] hover:text-[#352B48]"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!forgotPasswordSubmitted ? (
              <form onSubmit={handleForgotPasswordSubmit} className="py-4 space-y-3">
                <p className="text-xs text-[#777187]">
                  Enter the primary email associated with your Quizzy AI account. We will send a secure Firebase reset link.
                </p>
                <div>
                  <label className="block text-xs font-bold text-[#352B48] dark:text-[#F5F1FD] mb-1">
                    Account Email
                  </label>
                  <input
                    type="email"
                    placeholder="student@school.edu"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[#FFFAFD] dark:bg-[#151120] rounded-xl border border-[#E6DFFF] dark:border-[#332A4C] text-xs focus:outline-none focus:ring-2 focus:ring-[#9274E8]"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(false)}
                    className="px-3.5 py-2 text-xs font-semibold text-[#777187] hover:bg-[#E6DFFF]/30 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-[#9274E8] hover:bg-[#7e5bd9] rounded-xl shadow-soft"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            ) : (
              <div className="py-6 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#D5F5E3] text-[#31966B] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-[#352B48] dark:text-[#F5F1FD]">Reset Email Dispatched</p>
                <p className="text-[11px] text-[#777187] max-w-xs mx-auto">
                  A password reset link was sent to <strong>{forgotPasswordEmail}</strong>. Check your inbox to choose a new password.
                </p>
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(false)}
                  className="mt-3 px-4 py-2 text-xs font-bold text-white bg-[#9274E8] rounded-xl cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer onNavigate={onNavigate} />
    </div>
  );
};
