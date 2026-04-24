import type { LucideIcon } from "lucide-react";
import { TrendingUp, Banknote, TrendingDown, FileWarning, CalendarClock, ShieldAlert } from "lucide-react";

export interface ScamStat {
  key: string;
  value: string;
  icon: LucideIcon;
  title?: string;
  subtext?: string;
}

export const SCAM_STATS: ScamStat[] = [
  { key: "statsCases", value: "35K+", icon: TrendingUp },
  { key: "statsLoss", value: "RM1.57B", icon: Banknote },
  { key: "statsDaily", value: "~185", icon: CalendarClock },
  { key: "statsOldLoss", value: "RM2.7B", icon: TrendingDown },
];
