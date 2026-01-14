
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  query,
  DocumentSnapshot,
  QuerySnapshot,
  DocumentData,
  getDocFromCache,
  getDocsFromCache,
  orderBy,
  limit,
  where
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { Note, Stream, StudyProfile, TopicProgress, UserPreferences, StudySession, Reflection, ResourceLink } from "../types";

// Helper: Wrap promise with timeout
const withTimeout = <T>(promise: Promise<T>, ms: number, errorMsg: string = "Timeout"): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(errorMsg)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (reason) => {
        clearTimeout(timer);
        reject(reason);
      }
    );
  });
};

// Optimized fetch: Cache First -> Network (with short timeout) -> Null
const safeGetDoc = async (ref: any): Promise<DocumentSnapshot<DocumentData> | null> => {
  try {
    return await getDocFromCache(ref);
  } catch (e) {
    try {
       return await withTimeout(getDoc(ref), 1200, "Read Timeout");
    } catch (netError) {
       console.debug("Data fetch skipped (offline/timeout):", netError);
       return null;
    }
  }
};

// Safe Write: Fire and forget from UI perspective, but try to wait a bit for consistency
const safeWrite = async (ref: any, data: any, options?: any) => {
  try {
     await withTimeout(setDoc(ref, data, options), 2000, "Write Timeout");
  } catch (e) {
     console.debug("Write treated as offline/queued:", e);
  }
};

export const persistenceService = {
  // -------- USER PREFERENCES (Intent, Goals) --------
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    const ref = doc(db, "users", userId);
    const snap = await safeGetDoc(ref);
    return snap?.exists() ? (snap.data()?.preferences as UserPreferences) : null;
  },

  async saveUserPreferences(userId: string, preferences: UserPreferences) {
    await safeWrite(doc(db, "users", userId), { preferences }, { merge: true });
  },

  // -------- STUDY PROFILE (Streak, Hours) --------
  async getUserProfile(userId: string): Promise<StudyProfile | null> {
    const ref = doc(db, "users", userId);
    const snap = await safeGetDoc(ref);
    return snap?.exists() ? (snap.data()?.profile as StudyProfile) : null;
  },

  async saveUserProfile(userId: string, profile: StudyProfile) {
    await safeWrite(doc(db, "users", userId), { profile }, { merge: true });
  },

  // -------- STREAM --------
  async getUserStream(userId: string): Promise<Stream | null> {
    const snap = await safeGetDoc(doc(db, "users", userId));
    return snap?.exists() ? (snap.data()?.stream as Stream) ?? null : null;
  },

  async setUserStream(userId: string, stream: Stream) {
    await safeWrite(doc(db, "users", userId), { stream }, { merge: true });
  },

  // -------- PROGRESS --------
  async getProgress(
    userId: string,
    stream: Stream
  ): Promise<Record<string, TopicProgress>> {
    const snap = await safeGetDoc(
      doc(db, "users", userId, "progress", stream)
    );
    return snap?.exists() ? (snap.data() as Record<string, TopicProgress>) : {};
  },

  async updateTopicProgress(
    userId: string,
    stream: Stream,
    topicId: string,
    progress: TopicProgress
  ) {
    await safeWrite(
      doc(db, "users", userId, "progress", stream),
      { [topicId]: progress },
      { merge: true }
    );
  },

  // -------- NOTES --------
  async getNotes(userId: string): Promise<Note[]> {
    const q = query(collection(db, "users", userId, "notes"));
    try {
      const snap = await withTimeout(getDocs(q), 1500, "Notes Fetch Timeout") as QuerySnapshot<DocumentData>;
      return snap.docs
        .map(d => d.data() as Note)
        .sort((a, b) => +new Date(b.lastModified) - +new Date(a.lastModified));
    } catch {
      return [];
    }
  },

  async saveNote(userId: string, note: Note) {
    await safeWrite(doc(db, "users", userId, "notes", note.id), note);
  },

  async deleteNote(userId: string, noteId: string) {
    await deleteDoc(doc(db, "users", userId, "notes", noteId));
  },

  // -------- FOCUS SESSIONS --------
  async logSession(userId: string, session: StudySession) {
    await safeWrite(doc(db, "users", userId, "sessions", session.id), session);
    // Also update daily hours
    const profile = await persistenceService.getUserProfile(userId);
    if (profile) {
      const today = new Date().toDateString();
      const lastStudy = new Date(profile.lastStudyDate).toDateString();
      
      let newHours = profile.dailyHours;
      if (today !== lastStudy) newHours = 0; // Reset if new day
      
      newHours += (session.durationMinutes / 60);
      
      await safeWrite(doc(db, "users", userId), { 
        profile: { ...profile, dailyHours: Number(newHours.toFixed(1)), lastStudyDate: new Date().toISOString() } 
      }, { merge: true });
    }
  },

  async getRecentSessions(userId: string, days: number = 60): Promise<StudySession[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const q = query(
        collection(db, "users", userId, "sessions"),
        where("timestamp", ">=", startDate.toISOString()),
        orderBy("timestamp", "desc")
    );
    
    try {
        const snap = await getDocs(q);
        return snap.docs.map(d => d.data() as StudySession);
    } catch (e) {
        console.warn("Failed to load session history", e);
        return [];
    }
  },

  // -------- REFLECTIONS --------
  async getReflections(userId: string): Promise<Reflection[]> {
    const q = query(collection(db, "users", userId, "reflections"), orderBy("date", "desc"), limit(30));
    try {
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as Reflection);
    } catch { return []; }
  },

  async saveReflection(userId: string, reflection: Reflection) {
    await safeWrite(doc(db, "users", userId, "reflections", reflection.id), reflection);
  },

  // -------- RESOURCES --------
  async getResources(userId: string): Promise<ResourceLink[]> {
    const q = query(collection(db, "users", userId, "resources"));
    try {
       const snap = await getDocs(q);
       return snap.docs.map(d => d.data() as ResourceLink).sort((a,b) => b.addedAt.localeCompare(a.addedAt));
    } catch { return []; }
  },

  async saveResource(userId: string, resource: ResourceLink) {
    await safeWrite(doc(db, "users", userId, "resources", resource.id), resource);
  },

  async deleteResource(userId: string, resourceId: string) {
    await deleteDoc(doc(db, "users", userId, "resources", resourceId));
  }
};
