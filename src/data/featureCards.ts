import type { LucideIcon } from "lucide-react";
import { ScanSearch, Link2, Phone } from "lucide-react";

export interface FeatureCard {
  id: string;
  icon: LucideIcon;
  labelKey: string;
  descKey: string;
  href: string;
  iconBg: string;
}

export const FEATURE_CARDS: FeatureCard[] = [
  {
    id: "scan-screenshot",
    icon: ScanSearch,
    labelKey: "home.ctaScan",
    descKey: "home.ctaScanDesc",
    href: "/scan?mode=screenshot",
    iconBg: "bg-primary/10 text-primary",
  },
  {
    id: "check-url",
    icon: Link2,
    labelKey: "home.ctaUrl",
    descKey: "home.ctaUrlDesc",
    href: "/scan?mode=url",
    iconBg: "bg-accent/10 text-accent-dark",
  },
  {
    id: "check-phone",
    icon: Phone,
    labelKey: "home.ctaPhone",
    descKey: "home.ctaPhoneDesc",
    href: "/scan?mode=phone",
    iconBg: "bg-risk-low/10 text-risk-low",
  },
];
