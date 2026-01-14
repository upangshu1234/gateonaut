import { Subject, Note, StudyProfile, Stream } from "../types";
import { SYLLABUS_DATA } from "../data/syllabusData";

const KEYS = {
  USER: 'gateonaut_user',
  STREAM: 'gateonaut_stream',
  PROGRESS: 'gateonaut_progress',
  NOTES: 'gateonaut_notes',
  PROFILE: 'gateonaut_profile',
};

export const storageService = {
  // --- Syllabus & Progress ---
  getSyllabusWithProgress: (stream: Stream): Subject[] => {
    const staticData = SYLLABUS_DATA[stream] || [];
    const savedProgress = localStorage.getItem(`${KEYS.PROGRESS}_${stream}`);
    
    if (!savedProgress) return staticData;

    const progressMap = JSON.parse(savedProgress);

    return staticData.map(subject => ({
      ...subject,
      chapters: subject.chapters.map(chapter => ({
        ...chapter,
        topics: chapter.topics.map(topic => {
            const savedTopic = progressMap[topic.id];
            return savedTopic ? { ...topic, progress: savedTopic.progress } : topic;
        })
      }))
    }));
  },

  saveProgress: (stream: Stream, syllabus: Subject[]) => {
    const progressMap: Record<string, any> = {};
    syllabus.forEach(sub => 
      sub.chapters.forEach(chap => 
        chap.topics.forEach(topic => {
          if (topic.progress.lecture || topic.progress.revision || topic.progress.pyq || topic.progress.pyqFailed) {
            progressMap[topic.id] = { progress: topic.progress };
          }
        })
      )
    );
    localStorage.setItem(`${KEYS.PROGRESS}_${stream}`, JSON.stringify(progressMap));
  },

  // --- Notes ---
  getNotes: (): Note[] => {
    const data = localStorage.getItem(KEYS.NOTES);
    const parsed = data ? JSON.parse(data) : [];
    
    // Migration logic: Ensure old notes have new fields
    return parsed.map((n: any) => ({
        ...n,
        subject: n.subject || 'General',
        type: n.type || 'general',
        priority: n.priority || 'medium',
        attachments: n.attachments || []
    }));
  },

  saveNotes: (notes: Note[]) => {
    localStorage.setItem(KEYS.NOTES, JSON.stringify(notes));
  },

  // --- Study Profile & Streak ---
  // Fix: Updated getProfile to return a complete StudyProfile object matching the interface in types.ts
  getProfile: (): StudyProfile => {
    const data = localStorage.getItem(KEYS.PROFILE);
    const defaultProfile: StudyProfile = {
      dailyHours: 4,
      streak: 0,
      lastStudyDate: new Date().toISOString(),
      trialStartedAt: new Date().toISOString(),
      isPaid: false
    };

    if (data) {
      const parsed = JSON.parse(data);
      // Migration: Merge defaults with parsed data to ensure trialStartedAt and isPaid exist
      return { ...defaultProfile, ...parsed };
    }
    
    return defaultProfile;
  },

  updateProfile: (profile: StudyProfile) => {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  },

  checkStreak: (): StudyProfile => {
    const profile = storageService.getProfile();
    const lastDate = new Date(profile.lastStudyDate).toDateString();
    const today = new Date().toDateString();
    
    if (lastDate === today) return profile;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastDate === yesterday.toDateString()) {
      return profile;
    } else {
      const newProfile = { ...profile, streak: 0, lastStudyDate: new Date().toISOString() };
      storageService.updateProfile(newProfile);
      return newProfile;
    }
  },

  incrementStreakIfNewDay: (): StudyProfile => {
    const profile = storageService.getProfile();
    const lastDate = new Date(profile.lastStudyDate).toDateString();
    const today = new Date().toDateString();

    if (lastDate !== today) {
        const newProfile = { 
            ...profile, 
            streak: profile.streak + 1, 
            lastStudyDate: new Date().toISOString() 
        };
        storageService.updateProfile(newProfile);
        return newProfile;
    }
    return profile;
  }
};