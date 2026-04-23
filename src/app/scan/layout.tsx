import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scan Message",
  description:
    "Upload a screenshot, paste a message, check a URL, or verify a phone number. " +
    "SkamGuard's Gemini AI analyzes your input in real-time for scam indicators.",
  openGraph: {
    title: "Scan Message | SkamGuard",
    description: "Check suspicious messages, URLs, and phone numbers with AI-powered scam detection.",
  },
};

export default function ScanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
