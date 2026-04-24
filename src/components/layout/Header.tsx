"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { scaleIn, backdropFade } from "@/lib/motion";
import LanguageSwitcher from "./LanguageSwitcher";
import AuthModal from "@/components/auth/AuthModal";

/** Profile avatar with broken-image fallback */
function AvatarDisplay({ user }: { user: import("firebase/auth").User }) {
  const [imgError, setImgError] = useState(false);
  const initial = (user.displayName || user.email || "U").charAt(0).toUpperCase();

  if (user.photoURL && !imgError) {
    return (
      <img
        src={user.photoURL}
        alt="Avatar"
        className="w-full h-full object-cover"
        onError={() => setImgError(true)}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div className="w-full h-full bg-primary flex items-center justify-center">
      <span className="text-xs font-bold text-white">{initial}</span>
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { t } = useLanguage();
  const { user, isAuthenticated, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <>
      <header
        id="main-header"
        className={`
          fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[425px] z-50 transition-colors duration-300
          ${isHome ? "bg-transparent text-white" : "bg-surface/80 backdrop-blur-md border-b border-border text-text-primary"}
        `}
      >
        <div className="container-app flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <img
              src={isHome ? "/icons/white Icon Transparant.png" : "/icons/White BG.png"}
              className="w-8 h-8"
              alt="SkamGuard Logo"
            />
            <span className={`text-lg font-bold tracking-tight leading-none ${isHome ? "text-white" : "text-text-primary"}`}>
              Skam <br /> Guard
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />

            {/* Auth button */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/30 hover:border-white/60 transition-colors cursor-pointer"
                >
                  <AvatarDisplay user={user} />
                </button>

                {/* Dropdown with AnimatePresence */}
                <AnimatePresence>
                  {showUserMenu && (
                    <>
                      <motion.div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowUserMenu(false)}
                        variants={backdropFade}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      />
                      <motion.div
                        className="absolute right-0 top-10 z-50 bg-surface rounded-md shadow-lg border border-border min-w-[160px] py-1"
                        variants={scaleIn}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        style={{ transformOrigin: "top right" }}
                      >
                        <div className="px-3 py-2 border-b border-border">
                          <p className="text-xs font-medium text-text-primary truncate">
                            {user.displayName || user.email}
                          </p>
                        </div>
                        <button
                          onClick={() => { signOut(); setShowUserMenu(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-risk-high hover:bg-surface-hover transition-colors cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          {t("auth.signOut")}
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.button
                onClick={() => setShowAuthModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                  transition-colors duration-150 cursor-pointer
                  ${isHome
                    ? "bg-white/15 text-white hover:bg-white/25"
                    : "bg-primary/10 text-primary hover:bg-primary/20"
                  }
                `}
              >
                <User className="w-3.5 h-3.5" />
                {t("auth.signIn")}
              </motion.button>
            )}
          </div>
        </div>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
