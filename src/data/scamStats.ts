import type { LucideIcon } from "lucide-react";
import { TrendingDown, FileWarning, CalendarClock, ShieldAlert } from "lucide-react";

export interface ScamStat {
  key: string;
  value: string;
  icon: LucideIcon;
}

export const SCAM_STATS: ScamStat[] = [
  { key: "statsLoss", value: "RM2.7B", icon: TrendingDown },
  { key: "statsCases", value: "67,735", icon: ShieldAlert },
  { key: "statsDaily", value: "~185", icon: CalendarClock },
];
