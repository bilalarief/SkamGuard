import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let textContent = "";
    let imageBase64: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      textContent = (formData.get("text") as string) || "";
      const imageFile = formData.get("image") as File | null;

      if (imageFile) {
        const buffer = await imageFile.arrayBuffer();
        imageBase64 = Buffer.from(buffer).toString("base64");
      }
    } else {
      const body = await request.json();
      textContent = body.text || "";
    }

    if (!textContent && !imageBase64) {
      return NextResponse.json(
        { error: "No content provided. Send text or an image." },
        { status: 400 }
      );
    }

    // TODO: Wire up Gemini 2.0 Flash via Firebase Genkit
    // 1. Send text/image to Gemini for scam analysis
    // 2. Cross-reference with Vertex AI Search (RAG) for known patterns
    // 3. Calculate risk score from AI response + local red flag matching
    // 4. Return structured analysis result

    const placeholderResponse = {
      riskScore: 85,
      riskLevel: "high",
      scamType: "macauScam",
      redFlags: [
        "impersonation",
        "urgency",
        "money_request",
        "threats",
      ],
      summary: "Placeholder: AI analysis will be implemented in Phase 8.",
      confidence: 0.92,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(placeholderResponse);
  } catch (error) {
    console.error("[/api/analyze] Error:", error);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
