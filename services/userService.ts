
import { User, StudyProfile } from "../types";
import { persistenceService } from "./persistenceService";

// Helper to get default profile (Basic stats only)
const createDefaultProfile = (): StudyProfile => ({
  dailyHours: 0,
  streak: 0,
  lastStudyDate: new Date().toISOString(),
  trialStartedAt: new Date().toISOString(),
  isPaid: false // Default to FALSE to enforce the payment gate
});

export const userService = {
  initializeUser: async (user: User): Promise<{ profile: StudyProfile }> => {
    let profile: StudyProfile | null = null;

    try {
      profile = await persistenceService.getUserProfile(user.id);
    } catch (error) {
      console.warn("Could not fetch profile (offline?), using default.", error);
    }

    if (!profile) {
      profile = createDefaultProfile();
      try {
        await persistenceService.saveUserProfile(user.id, profile);
      } catch (error) {
        console.warn("Could not save new profile (offline mode active).");
      }
      return { profile };
    }

    // Handle missing trial date for existing users (migration)
    if (!profile.trialStartedAt) {
      profile.trialStartedAt = new Date().toISOString();
      await persistenceService.saveUserProfile(user.id, profile);
    }

    // --- Streak Logic ---
    try {
      const lastDate = new Date(profile.lastStudyDate).toDateString();
      const today = new Date().toDateString();

      if (lastDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        let updated = false;
        // If last study was not yesterday (and not today), reset streak
        if (lastDate !== yesterday.toDateString()) {
          profile.streak = 0;
          updated = true;
        }

        // Update last access date if it's a new day
        if (lastDate !== today) {
           profile.lastStudyDate = new Date().toISOString();
           updated = true;
        }
        
        if (updated) {
          await persistenceService.saveUserProfile(user.id, profile);
        }
      }
    } catch (error) {
      console.warn("Failed to update streak (offline mode active).", error);
    }

    return { profile };
  },

  incrementStreak: async (userId: string, currentProfile: StudyProfile): Promise<StudyProfile> => {
    const today = new Date().toDateString();
    const lastDate = new Date(currentProfile.lastStudyDate).toDateString();
    
    if (lastDate !== today) {
        const newProfile = { 
            ...currentProfile, 
            streak: currentProfile.streak + 1, 
            lastStudyDate: new Date().toISOString() 
        };
        try {
          await persistenceService.saveUserProfile(userId, newProfile);
        } catch (error) {
          console.warn("Failed to sync streak increment (offline mode).");
        }
        return newProfile;
    }
    return currentProfile;
  },

  processPayment: async (userId: string, currentProfile: StudyProfile): Promise<StudyProfile> => {
    const newProfile: StudyProfile = { 
        ...currentProfile, 
        isPaid: true
    };
    
    await persistenceService.saveUserProfile(userId, newProfile);
    return newProfile;
  }
};
