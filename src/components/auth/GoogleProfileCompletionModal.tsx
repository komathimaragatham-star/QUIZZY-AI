import React, { useState } from 'react';
import { Sparkles, Phone, AtSign, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface GoogleProfileCompletionModalProps {
  onShowToast: (title: string, description?: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const GoogleProfileCompletionModal: React.FC<GoogleProfileCompletionModalProps> = ({ onShowToast }) => {
  const { user, completeGoogleProfile } = useAuth();
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState(
    user?.displayName ? user.displayName.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 15) : ''
  );
  const [altEmail, setAltEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone.trim()) {
      setError('Phone number is compulsory.');
      return;
    }

    if (!username.trim() || username.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }

    try {
      setIsSubmitting(true);
      await completeGoogleProfile(phone, username, altEmail || undefined);
      onShowToast('Profile Complete!', 'Welcome to Quizzy AI.', 'success');
    } catch (err: any) {
      setError(err.message || 'Failed to complete profile.');
      onShowToast('Setup Error', err.message || 'Failed to complete profile.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#352B48]/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-soft-lg border border-[#E6DFFF] space-y-5 animate-in fade-in duration-200">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#E6DFFF] text-[#9274E8] flex items-center justify-center mx-auto shadow-soft">
            <Sparkles className="w-6 h-6 fill-[#FFF1B8]" />
          </div>
          <h2 className="text-xl font-bold text-[#352B48] font-heading">
            Complete Your Student Profile
          </h2>
          <p className="text-xs text-[#777187] leading-relaxed">
            Signed in with Google as <strong>{user?.email}</strong>. Please provide your compulsory phone number and choose your unique username.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-[#FFD6E7]/80 border border-[#D95370]/30 rounded-xl text-xs text-[#D95370] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#352B48] mb-1">
              Phone Number <span className="text-[#D95370]">* (Compulsory)</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#777187] absolute left-3.5 top-3" />
              <input
                type="tel"
                placeholder="+1 555 382 9104"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#FFFAFD] rounded-xl border border-[#E6DFFF] text-xs focus:outline-none focus:ring-2 focus:ring-[#9274E8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#352B48] mb-1">
              Unique Username <span className="text-[#D95370]">*</span>
            </label>
            <div className="relative">
              <AtSign className="w-4 h-4 text-[#777187] absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="choose_username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                required
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#FFFAFD] rounded-xl border border-[#E6DFFF] text-xs focus:outline-none focus:ring-2 focus:ring-[#9274E8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#352B48] mb-1">
              Alternative Email <span className="text-[#777187] font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#777187] absolute left-3.5 top-3" />
              <input
                type="email"
                placeholder="backup@school.edu"
                value={altEmail}
                onChange={(e) => setAltEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#FFFAFD] rounded-xl border border-[#E6DFFF] text-xs focus:outline-none focus:ring-2 focus:ring-[#9274E8]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#9274E8] hover:bg-[#7e5bd9] text-white text-xs font-bold rounded-xl shadow-pastel-purple flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Saving Profile...' : 'Complete & Enter Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
