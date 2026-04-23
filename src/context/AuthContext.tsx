/**
 * Authentication context — provides auth state to the entire app.
 * Supports email/password, Google sign-in, and anonymous (guest) access.
 *
 * Guest users can use all features except cloud-synced history.
 *
 * @module context/AuthContext
 */

"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/config";

interface AuthContextValue {
  /** Current Firebase user, null if not logged in */
  user: User | null;
  /** True while checking initial auth state */
  isLoading: boolean;
  /** True if user is logged in (non-anonymous) */
  isAuthenticated: boolean;
  /** Sign in with email + password */
  signInWithEmail: (email: string, password: string) => Promise<void>;
  /** Register with email + password */
  registerWithEmail: (email: string, password: string) => Promise<void>;
  /** Sign in with Google popup */
  signInWithGoogle: () => Promise<void>;
  /** Sign out */
  signOut: () => Promise<void>;
  /** Auth error message, if any */
  error: string | null;
  /** Clear error */
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const googleProvider = new GoogleAuthProvider();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const auth = getFirebaseAuth();
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);
        setIsLoading(false);
      });
      return unsubscribe;
    } catch {
      // Firebase not configured — app works without auth
      setIsLoading(false);
      return () => {};
    }
  }, []);

  async function signInWithEmail(email: string, password: string) {
    setError(null);
    try {
      const auth = getFirebaseAuth();
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      setError(mapFirebaseError(message));
      throw err;
    }
  }

  async function registerWithEmail(email: string, password: string) {
    setError(null);
    try {
      const auth = getFirebaseAuth();
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setError(mapFirebaseError(message));
      throw err;
    }
  }

  async function signInWithGoogle() {
    setError(null);
    try {
      const auth = getFirebaseAuth();
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Google sign in failed";
      setError(mapFirebaseError(message));
      throw err;
    }
  }

  async function signOut() {
    try {
      const auth = getFirebaseAuth();
      await firebaseSignOut(auth);
    } catch (err) {
      console.warn("Sign out error:", err);
    }
  }

  function clearError() {
    setError(null);
  }

  const isAuthenticated = !!user && !user.isAnonymous;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        signInWithEmail,
        registerWithEmail,
        signInWithGoogle,
        signOut,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

/** Map Firebase error codes to user-friendly messages */
function mapFirebaseError(message: string): string {
  if (message.includes("auth/email-already-in-use")) return "Email already registered. Try signing in.";
  if (message.includes("auth/invalid-email")) return "Invalid email address.";
  if (message.includes("auth/weak-password")) return "Password must be at least 6 characters.";
  if (message.includes("auth/user-not-found")) return "No account found with this email.";
  if (message.includes("auth/wrong-password")) return "Incorrect password.";
  if (message.includes("auth/invalid-credential")) return "Invalid email or password.";
  if (message.includes("auth/too-many-requests")) return "Too many attempts. Please try again later.";
  if (message.includes("auth/popup-closed-by-user")) return "Sign in cancelled.";
  return "Authentication failed. Please try again.";
}
