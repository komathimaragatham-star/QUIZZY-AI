import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  writeBatch,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { auth, db, googleProvider, isFirebaseConfigured, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, UserProgress, QuizAttempt, LeaderboardEntry } from '../types';

interface RegisterData {
  fullName: string;
  primaryEmail: string;
  alternativeEmail?: string;
  phoneNumber: string;
  username: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  progress: UserProgress | null;
  loading: boolean;
  isConfigured: boolean;
  needsProfileCompletion: boolean;
  registerUser: (data: RegisterData) => Promise<void>;
  loginUser: (identifier: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  completeGoogleProfile: (phoneNumber: string, username: string, alternativeEmail?: string) => Promise<void>;
  sendResetEmail: (email: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  saveQuizAttempt: (attempt: Omit<QuizAttempt, 'userId' | 'attemptId' | 'startedAt' | 'completedAt'>) => Promise<QuizAttempt>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Normalizers & Validators
export const normalizeEmail = (email: string): string => email.trim().toLowerCase();
export const normalizeUsername = (username: string): string => username.trim().toLowerCase();

export const normalizePhoneNumber = (rawPhone: string): string => {
  const cleaned = rawPhone.trim().replace(/[\s\-\(\)\.]/g, '');
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  // Default to +1 if 10 digits provided without international prefix
  if (/^\d{10}$/.test(cleaned)) {
    return `+1${cleaned}`;
  }
  if (/^\d{11}$/.test(cleaned) && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
};

export const validatePasswordStrength = (password: string) => {
  return {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password),
  };
};

export const isPasswordStrong = (password: string): boolean => {
  const checks = validatePasswordStrength(password);
  return (
    checks.minLength &&
    checks.hasUpper &&
    checks.hasLower &&
    checks.hasNumber &&
    checks.hasSpecial
  );
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState<boolean>(false);
  const isConfigured = isFirebaseConfigured();

  // Load User Data
  const loadUserData = async (uid: string) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const p = userSnap.data() as UserProfile;
        setProfile(p);
        setNeedsProfileCompletion(false);
      } else {
        // Google auth user without a completed profile
        setNeedsProfileCompletion(true);
      }

      const progDocRef = doc(db, 'user_progress', uid);
      const progSnap = await getDoc(progDocRef);
      if (progSnap.exists()) {
        setProgress(progSnap.data() as UserProgress);
      } else if (userSnap.exists()) {
        // Create clean initial progress
        const initialProgress: UserProgress = {
          userId: uid,
          totalQuizzesCompleted: 0,
          totalEarnedPoints: 0,
          averageAccuracy: 0,
          currentStreakDays: 0,
          lastActiveDate: '',
          topicMastery: {},
          earnedBadgeIds: [],
          updatedAt: new Date().toISOString(),
        };
        await setDoc(progDocRef, initialProgress);
        setProgress(initialProgress);
      }
    } catch (err) {
      console.error('Error fetching user data from Firestore:', err);
    }
  };

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadUserData(currentUser.uid);
      } else {
        setProfile(null);
        setProgress(null);
        setNeedsProfileCompletion(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isConfigured]);

  // REGISTER
  const registerUser = async (data: RegisterData) => {
    if (!isConfigured) {
      throw new Error('Firebase configuration is incomplete. Please check your settings.');
    }

    const normalizedPrimaryEmail = normalizeEmail(data.primaryEmail);
    const normalizedAltEmail = data.alternativeEmail ? normalizeEmail(data.alternativeEmail) : undefined;
    const normalizedPhone = normalizePhoneNumber(data.phoneNumber);
    const normalizedUser = normalizeUsername(data.username);

    // Validate phone E.164
    if (!/^\+[1-9]\d{6,14}$/.test(normalizedPhone)) {
      throw new Error('Please enter a valid phone number with country code (e.g. +1 555 382 9104).');
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedPrimaryEmail)) {
      throw new Error('Please enter a valid primary email address.');
    }

    if (normalizedAltEmail) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedAltEmail)) {
        throw new Error('Please enter a valid alternative email address.');
      }
      if (normalizedAltEmail === normalizedPrimaryEmail) {
        throw new Error('Alternative email cannot be the same as your primary email.');
      }
    }

    // Validate password
    if (!isPasswordStrong(data.password)) {
      throw new Error('Password must be at least 8 characters and include uppercase, lowercase, number, and special character.');
    }

    // 1. Create Firebase Auth user first
    let userCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(auth, normalizedPrimaryEmail, data.password);
    } catch (authErr: any) {
      if (authErr.code === 'auth/email-already-in-use') {
        throw new Error('An account with this primary email address already exists. Please log in instead.');
      } else if (authErr.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please include at least 8 characters with upper, lower, number, and special character.');
      } else if (authErr.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid primary email address.');
      } else if (authErr.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      throw new Error(authErr.message || 'Registration failed. Please check your details and try again.');
    }

    const newUid = userCredential.user.uid;

    // 2. Perform protected uniqueness checks under the newly authenticated session
    try {
      // Username Check
      const usernameSnap = await getDoc(doc(db, 'usernames', normalizedUser));
      if (usernameSnap.exists() && usernameSnap.data()?.uid !== newUid) {
        await userCredential.user.delete();
        throw new Error(`The username "@${normalizedUser}" is already taken. Please choose another.`);
      }

      // Phone Check
      const phoneSnap = await getDoc(doc(db, 'phones', normalizedPhone));
      if (phoneSnap.exists() && phoneSnap.data()?.uid !== newUid) {
        await userCredential.user.delete();
        throw new Error('This phone number is already registered to another account.');
      }

      // Alt Email Check
      if (normalizedAltEmail) {
        const altEmailSnap = await getDoc(doc(db, 'emails', normalizedAltEmail));
        if (altEmailSnap.exists() && altEmailSnap.data()?.uid !== newUid) {
          await userCredential.user.delete();
          throw new Error('This alternative email address is already associated with another account.');
        }
      }
    } catch (uniqueErr: any) {
      if (uniqueErr.message && (uniqueErr.message.includes('already') || uniqueErr.message.includes('taken'))) {
        throw uniqueErr;
      }
      // If any unexpected Firestore error occurred, roll back the newly created auth user
      try {
        await userCredential.user.delete();
      } catch (delErr) {
        console.warn('Could not roll back auth user:', delErr);
      }
      handleFirestoreError(uniqueErr, OperationType.GET, 'uniqueness_checks');
    }

    // 3. Update auth profile display name
    await updateProfile(userCredential.user, {
      displayName: data.fullName.trim(),
    });

    const nowIso = new Date().toISOString();

    const newProfile: UserProfile = {
      id: newUid,
      fullName: data.fullName.trim(),
      primaryEmail: normalizedPrimaryEmail,
      alternativeEmail: normalizedAltEmail,
      phoneNumber: normalizedPhone,
      username: normalizedUser,
      createdAt: nowIso,
      updatedAt: nowIso,
      themePreference: 'pastel-delight',
      colorMode: 'light',
      notificationPreferences: {
        emailAlerts: true,
        streakReminders: true,
        contestAlerts: true,
      },
    };

    const initialProgress: UserProgress = {
      userId: newUid,
      totalQuizzesCompleted: 0,
      totalEarnedPoints: 0,
      averageAccuracy: 0,
      currentStreakDays: 0,
      lastActiveDate: '',
      topicMastery: {},
      earnedBadgeIds: [],
      updatedAt: nowIso,
    };

    const initialLeaderboard: LeaderboardEntry = {
      userId: newUid,
      displayName: data.fullName.trim(),
      username: normalizedUser,
      points: 0,
      accuracy: 0,
      quizzesCompleted: 0,
      streakDays: 0,
      updatedAt: nowIso,
    };

    // 4. Atomic batch write for user profile, indexes, initial progress, and leaderboard entry
    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'users', newUid), newProfile);
      batch.set(doc(db, 'usernames', normalizedUser), { uid: newUid, createdAt: nowIso });
      batch.set(doc(db, 'phones', normalizedPhone), { uid: newUid, createdAt: nowIso });
      batch.set(doc(db, 'emails', normalizedPrimaryEmail), { uid: newUid, type: 'primary', createdAt: nowIso });
      if (normalizedAltEmail) {
        batch.set(doc(db, 'emails', normalizedAltEmail), { uid: newUid, type: 'alternative', createdAt: nowIso });
      }
      batch.set(doc(db, 'user_progress', newUid), initialProgress);
      batch.set(doc(db, 'leaderboard', newUid), initialLeaderboard);

      await batch.commit();

      setProfile(newProfile);
      setProgress(initialProgress);
      setNeedsProfileCompletion(false);
    } catch (batchErr) {
      try {
        await userCredential.user.delete();
      } catch (delErr) {
        console.warn('Could not roll back auth user on batch failure:', delErr);
      }
      handleFirestoreError(batchErr, OperationType.WRITE, 'users_batch_registration');
    }
  };

  // LOGIN (Primary Email)
  const loginUser = async (identifier: string, password: string) => {
    if (!isConfigured) {
      throw new Error('Firebase configuration is incomplete. Please check your settings.');
    }

    const trimmed = identifier.trim();
    if (!trimmed || !password) {
      throw new Error('Please enter both your email address and password.');
    }

    if (!trimmed.includes('@')) {
      throw new Error('Please sign in using your registered primary email address (e.g. yourname@example.com).');
    }

    const targetEmail = normalizeEmail(trimmed);

    try {
      await signInWithEmailAndPassword(auth, targetEmail, password);
    } catch (authErr: any) {
      if (authErr.code === 'auth/user-not-found') {
        throw new Error('No Quizzy AI account was found with that email address. Please create an account.');
      } else if (authErr.code === 'auth/wrong-password' || authErr.code === 'auth/invalid-credential') {
        throw new Error('Incorrect email address or password. Please check your details and try again.');
      } else if (authErr.code === 'auth/too-many-requests') {
        throw new Error('Too many unsuccessful attempts. Please try again in a few minutes or reset your password.');
      } else if (authErr.code === 'auth/user-disabled') {
        throw new Error('This student account has been disabled. Please contact support.');
      }
      throw new Error(authErr.message || 'Sign in failed. Please verify your credentials.');
    }
  };

  // GOOGLE SIGN IN
  const loginWithGoogle = async () => {
    if (!isConfigured) {
      throw new Error('Firebase configuration is incomplete. Please check your settings.');
    }
    const cred = await signInWithPopup(auth, googleProvider);
    if (cred.user) {
      await loadUserData(cred.user.uid);
    }
  };

  // COMPLETE GOOGLE PROFILE
  const completeGoogleProfile = async (phoneNumber: string, username: string, alternativeEmail?: string) => {
    if (!user) throw new Error('No authenticated user session found.');

    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const normalizedUser = normalizeUsername(username);
    const normalizedPrimaryEmail = normalizeEmail(user.email || '');
    const normalizedAltEmail = alternativeEmail ? normalizeEmail(alternativeEmail) : undefined;

    if (!/^\+[1-9]\d{6,14}$/.test(normalizedPhone)) {
      throw new Error('Please enter a valid phone number with country code (e.g. +1 555 382 9104).');
    }

    if (normalizedUser.length < 3) {
      throw new Error('Username must be at least 3 characters.');
    }

    // Check username & phone uniqueness
    const userSnap = await getDoc(doc(db, 'usernames', normalizedUser));
    if (userSnap.exists() && userSnap.data()?.uid !== user.uid) {
      throw new Error(`The username "@${normalizedUser}" is already taken.`);
    }

    const phoneSnap = await getDoc(doc(db, 'phones', normalizedPhone));
    if (phoneSnap.exists() && phoneSnap.data()?.uid !== user.uid) {
      throw new Error('This phone number is already registered to another account.');
    }

    const nowIso = new Date().toISOString();
    const newProfile: UserProfile = {
      id: user.uid,
      fullName: user.displayName || 'Quizzy Student',
      primaryEmail: normalizedPrimaryEmail,
      alternativeEmail: normalizedAltEmail,
      phoneNumber: normalizedPhone,
      username: normalizedUser,
      createdAt: nowIso,
      updatedAt: nowIso,
      themePreference: 'pastel-delight',
      colorMode: 'light',
      notificationPreferences: {
        emailAlerts: true,
        streakReminders: true,
        contestAlerts: true,
      },
    };

    const initialProgress: UserProgress = {
      userId: user.uid,
      totalQuizzesCompleted: 0,
      totalEarnedPoints: 0,
      averageAccuracy: 0,
      currentStreakDays: 0,
      lastActiveDate: '',
      topicMastery: {},
      earnedBadgeIds: [],
      updatedAt: nowIso,
    };

    const initialLeaderboard: LeaderboardEntry = {
      userId: user.uid,
      displayName: user.displayName || 'Quizzy Student',
      username: normalizedUser,
      points: 0,
      accuracy: 0,
      quizzesCompleted: 0,
      streakDays: 0,
      updatedAt: nowIso,
    };

    const batch = writeBatch(db);
    batch.set(doc(db, 'users', user.uid), newProfile);
    batch.set(doc(db, 'usernames', normalizedUser), { uid: user.uid, createdAt: nowIso });
    batch.set(doc(db, 'phones', normalizedPhone), { uid: user.uid, createdAt: nowIso });
    batch.set(doc(db, 'emails', normalizedPrimaryEmail), { uid: user.uid, type: 'primary', createdAt: nowIso });
    if (normalizedAltEmail) {
      batch.set(doc(db, 'emails', normalizedAltEmail), { uid: user.uid, type: 'alternative', createdAt: nowIso });
    }
    batch.set(doc(db, 'user_progress', user.uid), initialProgress);
    batch.set(doc(db, 'leaderboard', user.uid), initialLeaderboard);

    await batch.commit();

    setProfile(newProfile);
    setProgress(initialProgress);
    setNeedsProfileCompletion(false);
  };

  // PASSWORD RESET
  const sendResetEmail = async (email: string) => {
    if (!isConfigured) {
      throw new Error('Firebase configuration is incomplete.');
    }
    await sendPasswordResetEmail(auth, normalizeEmail(email));
  };

  // LOGOUT
  const logoutUser = async () => {
    await signOut(auth);
    setProfile(null);
    setProgress(null);
    setNeedsProfileCompletion(false);
  };

  // UPDATE PROFILE
  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!user || !profile) throw new Error('Not authenticated.');

    const userDocRef = doc(db, 'users', user.uid);
    const nowIso = new Date().toISOString();
    const payload = {
      ...data,
      updatedAt: nowIso,
    };

    try {
      await updateDoc(userDocRef, payload);
      setProfile((prev) => (prev ? { ...prev, ...payload } : null));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  // RECORD QUIZ ATTEMPT (Idempotent submission + updates progress & leaderboard)
  const saveQuizAttempt = async (
    attemptData: Omit<QuizAttempt, 'userId' | 'attemptId' | 'startedAt' | 'completedAt'>
  ): Promise<QuizAttempt> => {
    if (!user) throw new Error('Authentication required to save quiz attempts.');

    const attemptId = `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    const fullAttempt: QuizAttempt = {
      ...attemptData,
      attemptId,
      userId: user.uid,
      startedAt: nowIso,
      completedAt: nowIso,
    };

    try {
      // 1. Save Attempt Log
      await setDoc(doc(db, 'quiz_attempts', attemptId), fullAttempt);

      // 2. Compute Updated Progress
      const currentProg = progress || {
        userId: user.uid,
        totalQuizzesCompleted: 0,
        totalEarnedPoints: 0,
        averageAccuracy: 0,
        currentStreakDays: 0,
        lastActiveDate: '',
        topicMastery: {},
        earnedBadgeIds: [],
        updatedAt: nowIso,
      };

      const newTotalQuizzes = currentProg.totalQuizzesCompleted + 1;
      const newTotalPoints = currentProg.totalEarnedPoints + attemptData.earnedPoints;
      const newAvgAccuracy = Math.round(
        (currentProg.averageAccuracy * currentProg.totalQuizzesCompleted + attemptData.accuracy) / newTotalQuizzes
      );

      // Calculate streak
      const todayStr = new Date().toISOString().split('T')[0];
      let newStreak = currentProg.currentStreakDays;
      if (currentProg.lastActiveDate !== todayStr) {
        if (!currentProg.lastActiveDate) {
          newStreak = 1;
        } else {
          const lastDate = new Date(currentProg.lastActiveDate);
          const diffDays = Math.round((new Date(todayStr).getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
          newStreak = diffDays === 1 ? currentProg.currentStreakDays + 1 : 1;
        }
      }

      // Update topic mastery
      const topicKey = attemptData.topic;
      const prevTopic = currentProg.topicMastery?.[topicKey] || { attempts: 0, scoreSum: 0, mastery: 0 };
      const updatedTopicAttempts = prevTopic.attempts + 1;
      const updatedTopicScoreSum = prevTopic.scoreSum + attemptData.accuracy;
      const updatedMastery = Math.round(updatedTopicScoreSum / updatedTopicAttempts);

      const updatedTopicMastery = {
        ...currentProg.topicMastery,
        [topicKey]: {
          attempts: updatedTopicAttempts,
          scoreSum: updatedTopicScoreSum,
          mastery: updatedMastery,
        },
      };

      // Check for badge unlocks
      const badges = [...(currentProg.earnedBadgeIds || [])];
      if (newTotalQuizzes >= 1 && !badges.includes('ach-1')) badges.push('ach-1');
      if (newTotalQuizzes >= 10 && !badges.includes('ach-2')) badges.push('ach-2');
      if (newStreak >= 7 && !badges.includes('ach-4')) badges.push('ach-4');

      const updatedProgData: UserProgress = {
        userId: user.uid,
        totalQuizzesCompleted: newTotalQuizzes,
        totalEarnedPoints: newTotalPoints,
        averageAccuracy: newAvgAccuracy,
        currentStreakDays: newStreak,
        lastActiveDate: todayStr,
        topicMastery: updatedTopicMastery,
        earnedBadgeIds: badges,
        updatedAt: nowIso,
      };

      await setDoc(doc(db, 'user_progress', user.uid), updatedProgData);
      setProgress(updatedProgData);

      // 3. Update Public Leaderboard
      if (profile) {
        const lbDoc: LeaderboardEntry = {
          userId: user.uid,
          displayName: profile.fullName,
          username: profile.username,
          points: newTotalPoints,
          accuracy: newAvgAccuracy,
          quizzesCompleted: newTotalQuizzes,
          streakDays: newStreak,
          updatedAt: nowIso,
        };
        await setDoc(doc(db, 'leaderboard', user.uid), lbDoc);
      }

      return fullAttempt;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `quiz_attempts/${attemptId}`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        progress,
        loading,
        isConfigured,
        needsProfileCompletion,
        registerUser,
        loginUser,
        loginWithGoogle,
        completeGoogleProfile,
        sendResetEmail,
        logoutUser,
        updateProfileData,
        saveQuizAttempt,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
