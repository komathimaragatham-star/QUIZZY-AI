import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { isFirebaseConfigured } from '../../lib/firebase';

export const FirebaseConfigAlert: React.FC = () => {
  if (isFirebaseConfigured()) return null;

  return (
    <div className="bg-[#FFE2CC] border-b border-[#C95C1E]/30 px-4 py-3 text-xs text-[#352B48]">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-[#C95C1E] shrink-0" />
        <div className="flex-1">
          <p className="font-bold text-[#C95C1E]">Firebase Setup Incomplete</p>
          <p className="text-[#777187] mt-0.5">
            Cloud Firestore or Authentication settings are not yet fully configured. Ensure{' '}
            <code className="font-mono bg-white/70 px-1 py-0.5 rounded">firebase-applet-config.json</code> or{' '}
            <code className="font-mono bg-white/70 px-1 py-0.5 rounded">VITE_FIREBASE_*</code> environment variables are present.
          </p>
        </div>
      </div>
    </div>
  );
};
