"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
  return (
    <header
      id="main-header"
      className="
        fixed top-0 left-0 right-0 z-50
        bg-surface/80 backdrop-blur-md
        border-b border-border
      "
    >
      <div className="container-app flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2 no-underline">
          {/* <ShieldCheck className="w-6 h-6 text-primary" /> */}
          <img src="..\icons\White BG.png" className="w-8 h-8" alt="" />
          <span className="text-lg font-bold text-text-primary tracking-tight leading-none">
            Skam <br /> Guard
          </span>
        </Link>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
