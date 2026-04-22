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
  { key: "statsCases", title: "Online Scam Cases Reported", value: "35K+", subtext: "cases in 2024", icon: TrendingUp },
  { key: "statsLoss", title: "Scam Losses Recorded", value: "RM1.57B", subtext: "in 2024", icon: Banknote },
  { key: "statsDaily", value: "~185", icon: CalendarClock },
  { key: "statsOldLoss", value: "RM2.7B", icon: TrendingDown },
];
