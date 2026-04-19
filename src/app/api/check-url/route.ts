import { NextRequest, NextResponse } from "next/server";
import { isValidUrl, normalizeUrl, getDomain } from "@/lib/validators/url";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || !isValidUrl(url)) {
      return NextResponse.json(
        { error: "Invalid URL. Please provide a valid URL." },
        { status: 400 }
      );
    }

    const normalizedUrl = normalizeUrl(url);
    const domain = getDomain(normalizedUrl);

    // TODO: Wire up VirusTotal API v3
    // 1. Submit URL to VT for scanning
    // 2. Retrieve analysis report
    // 3. Check against known phishing/malware databases

    const placeholderResponse = {
      url: normalizedUrl,
      domain,
      safe: false,
      riskScore: 72,
      threats: ["phishing", "suspicious_redirect"],
      virusTotalLink: `https://www.virustotal.com/gui/url/${encodeURIComponent(normalizedUrl)}`,
      source: "placeholder",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(placeholderResponse);
  } catch (error) {
    console.error("[/api/check-url] Error:", error);
    return NextResponse.json(
      { error: "URL check failed. Please try again." },
      { status: 500 }
    );
  }
}
