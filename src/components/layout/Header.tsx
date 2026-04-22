"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header
      id="main-header"
      className={`
        fixed top-0 left-0 right-0 z-50 transition-colors duration-300
        ${isHome ? "bg-transparent text-white" : "bg-surface/80 backdrop-blur-md border-b border-border text-text-primary"}
      `}
    >
      <div className="container-app flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <img src={isHome ? "/icons/white Icon Transparant.png" : "/icons/White BG.png"} className="w-8 h-8" alt="SkamGuard Logo" />
          <span className={`text-lg font-bold tracking-tight leading-none ${isHome ? "text-white" : "text-text-primary"}`}>
            Skam <br /> Guard
          </span>
        </Link>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
