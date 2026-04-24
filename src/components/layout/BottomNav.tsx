"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ScanSearch, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

const NAV_ITEMS = [
  { href: "/", icon: Home, labelKey: "nav.home" },
  { href: "/scan", icon: ScanSearch, labelKey: "nav.scan" },
  { href: "/history", icon: History, labelKey: "nav.history" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-[88%] max-w-[420px] z-50">
      <nav
        id="bottom-nav"
        className="
          bg-white/90 backdrop-blur-md
          border border-gray-100
          rounded-full shadow-xl
          px-3 py-2
          grid grid-cols-3
        "
      >
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-center no-underline"
            >
              <motion.div
                layout
                initial={false}
                animate={{
                  backgroundColor: isActive ? "#E0F2FE" : "transparent",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="flex items-center justify-center gap-2 rounded-full px-3 py-2.5 cursor-pointer"
              >
                <Icon
                  className={`w-5 h-5 sm:w-[22px] sm:h-[22px] shrink-0 transition-colors duration-200 ${
                    isActive ? "text-[#00A6F4]" : "text-[#64748B]"
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                
                <AnimatePresence mode="wait">
                  {isActive && (
                    <motion.span
                      key={item.href}
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-[13px] sm:text-sm font-bold text-[#00A6F4] whitespace-nowrap overflow-hidden"
                    >
                      {t(item.labelKey)}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

