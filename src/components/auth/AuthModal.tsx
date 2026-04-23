/**
 * Auth modal component — email + Google sign-in.
 * Appears as a bottom sheet drawer on mobile with Framer Motion animations.
 *
 * @module components/auth/AuthModal
 */

"use client";

import { useState } from "react";
import { X, Mail, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { drawerUp, backdropFade } from "@/lib/motion";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { t } = useLanguage();
  const { signInWithEmail, registerWithEmail, signInWithGoogle, error, clearError } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    clearError();

    try {
      if (mode === "login") {
        await signInWithEmail(email, password);
      } else {
        await registerWithEmail(email, password);
      }
      onClose();
    } catch {
      // Error is set in context
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    clearError();
    try {
      await signInWithGoogle();
      onClose();
    } catch {
      // Error is set in context
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setMode(mode === "login" ? "register" : "login");
    clearError();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            variants={backdropFade}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="relative w-full max-w-md bg-surface rounded-t-3xl sm:rounded-2xl p-6 space-y-5 z-10"
            variants={drawerUp}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-text-primary">
                {mode === "login" ? t("auth.signIn") : t("auth.register")}
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-hover hover:bg-surface-active transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-text-secondary" />
              </button>
            </div>

            {/* Google Sign In */}
            <motion.button
              onClick={handleGoogleSignIn}
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="
                w-full h-12 rounded-xl border border-border
                bg-surface hover:bg-surface-hover
                transition-colors duration-150 cursor-pointer
                flex items-center justify-center gap-3
                text-sm font-semibold text-text-primary
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {t("auth.continueGoogle")}
            </motion.button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-text-muted font-medium">{t("auth.or")}</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-text-secondary">{t("auth.email")}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="
                      w-full h-11 pl-10 pr-3 rounded-xl
                      bg-surface-hover border border-border
                      text-sm text-text-primary placeholder:text-text-muted
                      focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20
                      transition-colors
                    "
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-text-secondary">{t("auth.password")}</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    required
                    minLength={6}
                    className="
                      w-full h-11 pl-3 pr-10 rounded-xl
                      bg-surface-hover border border-border
                      text-sm text-text-primary placeholder:text-text-muted
                      focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20
                      transition-colors
                    "
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-risk-high bg-risk-high-bg/50 px-3 py-2 rounded-lg overflow-hidden"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={loading || !email || !password}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="
                  w-full h-12 rounded-xl
                  bg-primary text-white text-sm font-semibold
                  hover:bg-primary-dark
                  transition-colors duration-200 cursor-pointer
                  disabled:opacity-50 disabled:cursor-not-allowed
                  shadow-sm
                "
              >
                {loading
                  ? t("common.loading")
                  : mode === "login"
                  ? t("auth.signIn")
                  : t("auth.register")
                }
              </motion.button>
            </form>

            {/* Switch mode */}
            <p className="text-center text-xs text-text-secondary">
              {mode === "login" ? t("auth.noAccount") : t("auth.hasAccount")}{" "}
              <button
                onClick={switchMode}
                className="text-primary font-semibold hover:underline cursor-pointer"
              >
                {mode === "login" ? t("auth.register") : t("auth.signIn")}
              </button>
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
