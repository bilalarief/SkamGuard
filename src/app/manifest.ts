import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SkamGuard — Malaysia's AI Scam Defense",
    short_name: "SkamGuard",
    description: "Detect scams instantly with Gemini AI. Protect Malaysians from fraud.",
    start_url: "/",
    display: "standalone",
    background_color: "#F8F9FA",
    theme_color: "#1B4965",
    icons: [
      {
        src: "/icons/White BG.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/White BG.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
