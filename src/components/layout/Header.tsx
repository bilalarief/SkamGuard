"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, LogOut, Home, ScanSearch, History } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { scaleIn, backdropFade } from "@/lib/motion";
import LanguageSwitcher from "./LanguageSwitcher";
import AuthModal from "@/components/auth/AuthModal";

const NAV_ITEMS = [
  { href: "/", icon: Home, labelKey: "nav.home" },
  { href: "/scan", icon: ScanSearch, labelKey: "nav.scan" },
  { href: "/history", icon: History, labelKey: "nav.history" },
];

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
          fixed top-0 w-full z-50 transition-colors duration-300
          ${isHome 
            ? "bg-transparent text-white md:bg-surface/95 md:backdrop-blur-md md:border-b md:border-border md:text-text-primary" 
            : "bg-surface/80 backdrop-blur-md border-b border-border text-text-primary"}
        `}
      >
        <div className="container-app flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 no-underline md:w-[180px]">
            {isHome ? (
              <>
                <div className="flex md:hidden">
                  <img
                    src="/icons/white Icon Transparant.png"
                    className="w-8 h-8"
                    alt="SkamGuard Logo Mobile"
                  />
                </div>
                <div className="hidden md:flex">
                  <img
                    src="/icons/White BG.png"
                    className="w-8 h-8"
                    alt="SkamGuard Logo Desktop"
                  />
                </div>
              </>
            ) : (
              <img
                src="/icons/White BG.png"
                className="w-8 h-8"
                alt="SkamGuard Logo"
              />
            )}
            <span className={`text-lg font-bold tracking-tight leading-none ${isHome ? "text-white md:text-text-primary" : "text-text-primary"}`}>
              Skam <br /> Guard
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link key={item.href} href={item.href} className="no-underline">
                  <div
                    className={`flex items-center gap-2 px-4 py-2 md:rounded-sm rounded-full transition-colors cursor-pointer ${
                      isActive
                        ? "bg-[#E0F2FE] text-[#00A6F4]"
                        : "text-text-secondary hover:bg-surface-hover"
                    }`}
                  >
                    <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.5 : 2} />
                    <span className={`text-[13px] font-semibold ${isActive ? "text-[#00A6F4]" : ""}`}>
                      {t(item.labelKey)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:w-[180px] justify-end">
            <LanguageSwitcher />

            {/* Auth button */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-colors cursor-pointer ${
                    isHome ? "border-white/30 hover:border-white/60 md:border-primary/20 md:hover:border-primary/50" : "border-primary/20 hover:border-primary/50"
                  }`}
                >
                  <AvatarDisplay user={user} />
                </button>

                {/* Dropdown with AnimatePresence */}
                <AnimatePresence>
                  {showUserMenu && (
                    <>
                      <m.div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowUserMenu(false)}
                        variants={backdropFade}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      />
                      <m.div
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
                      </m.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <m.button
                onClick={() => setShowAuthModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  flex items-center gap-1.5 px-3 py-2 md:rounded-sm rounded-md text-xs font-semibold whitespace-nowrap
                  transition-colors duration-150 cursor-pointer
                  ${isHome
                    ? "bg-white/15 text-white hover:bg-white/25 md:bg-[#00A6F4] md:text-white md:hover:bg-[#0090D6]"
                    : "bg-[#00A6F4] text-white hover:bg-[#0090D6]"
                  }
                `}
              >
                <User className="w-3.5 h-3.5" />
                {t("auth.signIn")}
              </m.button>
            )}
          </div>
        </div>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
