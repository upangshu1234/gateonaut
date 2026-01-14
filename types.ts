
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export type AttemptType = 'Serious' | 'Trial' | 'Foundation';
export type TargetGoal = 'Top 100 AIR' | 'IIT Admission' | 'PSU Job' | 'Qualify Only' | 'Knowledge Building';
export type ThemeColor = 'indigo' | 'cyan' | 'emerald' | 'rose' | 'amber' | 'violet';

export interface UserPreferences {
  targetYear: '2026' | '2027' | '2028';
  attemptType: AttemptType;
  primaryGoal: TargetGoal;
  secondaryGoal?: string;
  targetMarks: number; // 0-100
  themeColor?: ThemeColor;
}

export interface StudyProfile {
  dailyHours: number;
  streak: number;
  lastStudyDate: string; // ISO Date string
  trialStartedAt: string; // ISO Date string
  isPaid: boolean;
  subscriptionExpiryDate?: string; // ISO Date string for 30-day validity
}

export enum Stream {
  ECE = 'Electronics & Communication Engineering',
  IN = 'Instrumentation Engineering',
  CS = 'Computer Science & Information Technology',
  EE = 'Electrical Engineering',
  ME = 'Mechanical Engineering',
  CE = 'Civil Engineering',
  DA = 'Data Science & Artificial Intelligence',
}

export interface TopicProgress {
  lecture: boolean;
  revision: boolean;
  pyq: boolean;
  pyqFailed: boolean;
  confidence?: 'low' | 'medium' | 'high';
}

export interface Topic {
  id: string;
  name: string;
  type: 'primary' | 'secondary';
  importance: number;
  progress: TopicProgress;
}

export interface Chapter {
  id: string;
  name: string;
  topics: Topic[];
}

export interface Subject {
  id: string;
  name: string;
  chapters: Chapter[];
}

export interface SyllabusData {
  stream: Stream;
  subjects: Subject[];
}

export type NoteType = 'concept' | 'formula' | 'mistake' | 'general';
export type NotePriority = 'high' | 'medium' | 'low';

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'pdf' | 'other';
  size: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  subject: string;
  type: NoteType;
  priority: NotePriority;
  tags: string[];
  attachments?: Attachment[];
  createdAt: string;
  lastModified: string;
}

export interface DashboardStats {
  totalTopics: number;
  topicsCompleted: number;
  revisionRate: number;
  pyqRate: number;
  weakSubjects: string[];
  daysLeft: number;
  primaryCompletion: number;
}

export interface StudySession {
  id: string;
  durationMinutes: number;
  type: 'pomodoro' | 'deep-work' | 'custom';
  timestamp: string;
  completed: boolean;
  intent?: string; // Goal for the session
  distractions?: number; // Number of focus breaches
}

export interface Reflection {
  id: string;
  date: string;
  wins: string; // Technical successes
  blockers: string; // System vulnerabilities
  mood: number; // 1-5 scale
  tags: string[];
  aiAnalysis?: string;
}

export interface ResourceLink {
  id: string;
  title: string;
  url: string;
  type: 'video' | 'playlist' | 'pdf' | 'article';
  subject: string;
  addedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}
