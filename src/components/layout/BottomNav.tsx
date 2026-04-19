"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ScanSearch, History } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const NAV_ITEMS = [
  { href: "/", icon: Home, labelKey: "nav.home" },
  { href: "/scan", icon: ScanSearch, labelKey: "nav.scan" },
  { href: "/report", icon: History, labelKey: "nav.history" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <nav
      id="bottom-nav"
      className="
        fixed bottom-0 left-0 right-0 z-50
        bg-surface/95 backdrop-blur-md
        border-t border-border
        safe-bottom
      "
    >
      <div className="container-app flex items-center justify-around h-16">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center gap-1
                py-1.5 px-5
                no-underline rounded-radius-sm
                transition-colors duration-150
                touch-target
                ${isActive
                  ? "text-primary"
                  : "text-text-muted hover:text-text-primary"
                }
              `}
            >
              <Icon
                className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.5]"}`}
              />
              <span className={`text-[11px] leading-none ${isActive ? "font-semibold" : "font-medium"}`}>
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
