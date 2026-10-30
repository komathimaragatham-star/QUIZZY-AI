export type PageId =
  | 'landing'
  | 'account'
  | 'dashboard'
  | 'create-quiz'
  | 'quiz-player'
  | 'flashcards'
  | 'progress'
  | 'leaderboard'
  | 'contests'
  | 'achievements'
  | 'profile';

export type AccountTab = 'register' | 'login';

export interface UserProfile {
  id: string; // Firebase Auth UID
  fullName: string;
  primaryEmail: string;
  alternativeEmail?: string;
  phoneNumber: string; // Compulsory E.164
  username: string; // Unique lowercase normalized
  createdAt: string;
  updatedAt?: string;
  avatarUrl?: string;
  themePreference?: 'pastel-delight' | 'high-contrast' | 'soft-lavender';
  colorMode?: 'light' | 'dark' | 'system';
  notificationPreferences?: {
    emailAlerts: boolean;
    streakReminders: boolean;
    contestAlerts: boolean;
  };
}

export interface StudentProfile {
  fullName: string;
  username: string;
  primaryEmail: string;
  alternativeEmail?: string;
  phone: string;
  avatarUrl: string;
  level: string;
  streakDays: number;
  totalXp: number;
  quizzesTaken: number;
  averageScore: number;
  topicsPracticed: number;
}

export interface UserProgress {
  userId: string;
  totalQuizzesCompleted: number;
  totalEarnedPoints: number;
  averageAccuracy: number;
  currentStreakDays: number;
  lastActiveDate: string;
  topicMastery: Record<string, { attempts: number; scoreSum: number; mastery: number }>;
  earnedBadgeIds: string[];
  updatedAt: string;
}

export interface QuizSettings {
  topic: string;
  numQuestions: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  learningLevel: 'Middle School' | 'High School' | 'College / Undergrad' | 'Lifelong Learner';
  questionType: 'Multiple Choice' | 'True / False' | 'Mixed';
  sourceNotes?: string;
  sourceFileName?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface QuizAttempt {
  attemptId: string;
  userId: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questionCount: number;
  correctAnswers: number;
  totalScore: number;
  accuracy: number;
  earnedPoints: number;
  completionStatus: 'completed' | 'in-progress';
  startedAt: string;
  completedAt: string;
  submissionId: string; // Idempotency key
}

export interface FlashcardItem {
  id: string;
  userId?: string;
  deck: string;
  topic?: string;
  front: string;
  back: string;
  hint?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  status?: 'unreviewed' | 'known' | 'needs-practice';
  createdAt?: string;
}

export interface ContestEntry {
  id: string;
  userId: string;
  contestId: string;
  score: number;
  pointsEarned: number;
  completedAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  rank?: number;
  displayName: string;
  username: string;
  points: number;
  accuracy: number;
  quizzesCompleted: number;
  streakDays?: number;
  updatedAt?: string;
  isCurrentUser?: boolean;
}

export interface ContestItem {
  id: string;
  title: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  numQuestions: number;
  timeLimitMinutes: number;
  xpReward: number;
  participantsCount: number;
  status: 'active' | 'upcoming' | 'completed';
  endsInHours?: number;
  startDate?: string;
  description: string;
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  category: 'Quiz Completion' | 'Learning Streak' | 'Topic Mastery' | 'Special';
  tier: 'gold' | 'silver' | 'bronze';
  progress: number;
  target: number;
  isUnlocked: boolean;
  unlockedDate?: string;
  iconName: string;
}

export interface CertificateItem {
  id: string;
  title: string;
  topic: string;
  issuedDate: string;
  recipientName: string;
  scorePercent: number;
  certificateCode: string;
  badgeLevel: 'Mastery' | 'Honor' | 'Distinction';
}

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  description?: string;
}
