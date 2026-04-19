import { NextRequest, NextResponse } from "next/server";
import { isValidMalaysianPhone, normalizeToE164 } from "@/lib/validators/phone";

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone || !isValidMalaysianPhone(phone)) {
      return NextResponse.json(
        { error: "Invalid phone number. Please use Malaysian format (01X-XXXXXXX)." },
        { status: 400 }
      );
    }

    const normalized = normalizeToE164(phone);

    // TODO: Wire up phone number databases
    // 1. Check against PDRM Semak Mule API (if available)
    // 2. Check against community-reported scam numbers in Firestore
    // 3. Cross-reference with known scam number patterns

    const placeholderResponse = {
      phone: normalized,
      reported: true,
      reportCount: 12,
      lastReported: "2025-03-15",
      semakMuleUrl: "https://semakmule.rmp.gov.my",
      source: "placeholder",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(placeholderResponse);
  } catch (error) {
    console.error("[/api/check-phone] Error:", error);
    return NextResponse.json(
      { error: "Phone check failed. Please try again." },
      { status: 500 }
    );
  }
}
