import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scan History",
  description:
    "Review your past scam checks and analysis results. " +
    "Track suspicious messages, URLs, and phone numbers you've verified with SkamGuard.",
  openGraph: {
    title: "Scan History | SkamGuard",
    description: "Review your past scam analysis results.",
  },
  robots: {
    index: false,  // History pages contain user-specific data
    follow: false,
  },
};

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
