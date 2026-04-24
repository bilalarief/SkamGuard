"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ScanSearch, History } from "lucide-react";
import { motion } from "framer-motion";
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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[400px] z-50">
      <nav
        id="bottom-nav"
        className="
          bg-white/90 backdrop-blur-md
          border border-gray-100
          rounded-full shadow-xl
          px-2 py-2
          flex items-center justify-around
        "
      >
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex items-center justify-center no-underline"
            >
              <motion.div
                layout
                initial={false}
                animate={{
                  backgroundColor: isActive ? "#E0F2FE" : "transparent",
                  paddingLeft: isActive ? "16px" : "12px",
                  paddingRight: isActive ? "16px" : "12px",
                  paddingTop: "10px",
                  paddingBottom: "10px",
                }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className="flex items-center gap-2 rounded-full cursor-pointer"
              >
                <Icon
                  className={`w-5 h-5 transition-colors duration-200 ${
                    isActive ? "text-[#00A6F4]" : "text-[#64748B]"
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                
                {isActive && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-[13px] font-bold text-[#00A6F4] whitespace-nowrap"
                  >
                    {t(item.labelKey)}
                  </motion.span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
