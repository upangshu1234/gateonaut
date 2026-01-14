
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  User as FirebaseUser,
  AuthError
} from "firebase/auth";
import { auth } from "../firebase/firebase";
import { User } from "../types";

const googleProvider = new GoogleAuthProvider();

// Mapper: Firebase User -> App User
const mapFirebaseUser = (firebaseUser: FirebaseUser): User => {
  return {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'IITB Aspirant',
    email: firebaseUser.email || '',
    avatarUrl: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${firebaseUser.email?.split('@')[0] || 'User'}&background=2563eb&color=fff&bold=true`
  };
};

// Error Mapper
const getErrorMessage = (error: AuthError): string => {
  console.error("Firebase Auth Error Code:", error.code);
  
  switch (error.code) {
    case 'auth/unauthorized-domain':
      return 'DOMAIN_UNAUTHORIZED: This domain is not authorized in Firebase. Please add your deployment URL (e.g., vercel.app, firebaseapp.com) to the "Authorized Domains" list in the Firebase Console under Authentication > Settings.';
    case 'auth/invalid-credential':
      return 'INVALID_CREDENTIAL: The login credentials expired or are incorrect. If using Google, please try again. If using Email, check your password.';
    case 'auth/email-already-in-use':
      return 'EMAIL_EXISTS: This email is already registered. Please sign in instead of creating a new account.';
    case 'auth/operation-not-allowed':
      return 'CONFIG_ERROR: This sign-in method is disabled. Enable Email/Password or Google in your Firebase Console.';
    case 'auth/weak-password':
      return 'WEAK_PASSWORD: The password must be at least 6 characters long.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'AUTH_FAILED: Invalid email or password.';
    case 'auth/popup-closed-by-user':
      return 'CANCELLED: Sign-in window was closed before completion.';
    case 'auth/network-request-failed':
      return 'NETWORK_ERROR: Connection failed. Check your internet or firewall settings.';
    default:
      return `SYSTEM_ERROR (${error.code}): Please try again later.`;
  }
};

export const authService = {
  loginWithGoogle: async (): Promise<User> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return mapFirebaseUser(result.user);
    } catch (error) {
      throw new Error(getErrorMessage(error as AuthError));
    }
  },

  signupWithEmail: async (email: string, pass: string): Promise<User> => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      return mapFirebaseUser(result.user);
    } catch (error) {
      throw new Error(getErrorMessage(error as AuthError));
    }
  },

  loginWithEmail: async (email: string, pass: string): Promise<User> => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      return mapFirebaseUser(result.user);
    } catch (error) {
      throw new Error(getErrorMessage(error as AuthError));
    }
  },

  logoutUser: async (): Promise<void> => {
    await signOut(auth);
  },
  
  mapUser: mapFirebaseUser
};
