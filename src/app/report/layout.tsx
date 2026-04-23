import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Risk Report",
  description:
    "View your scam analysis results — risk score, red flags, scam type identification, " +
    "and actionable steps to protect yourself. Powered by Gemini AI.",
  openGraph: {
    title: "Risk Report | SkamGuard",
    description: "AI-powered scam analysis results with risk scoring and action plan.",
  },
  robots: {
    index: false,  // Report pages contain user-specific data
    follow: false,
  },
};

export default function ReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
