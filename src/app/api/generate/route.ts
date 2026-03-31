import { NextRequest, NextResponse } from "next/server";

const GATEWAY_URL = process.env.TERMINAL_AI_GATEWAY_URL;

export async function POST(request: NextRequest) {
  if (!GATEWAY_URL) {
    return NextResponse.json(
      { error: "Gateway not configured" },
      { status: 500 }
    );
  }

  const embedToken = request.headers.get("x-embed-token");
  if (!embedToken) {
    return NextResponse.json(
      { error: "Missing embed token" },
      { status: 401 }
    );
  }

  const res = await fetch(`${GATEWAY_URL}/v1/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${embedToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-3-5-haiku",
      messages: [
        {
          role: "system",
          content:
            "You generate creative, fun pet names. Respond ONLY with valid JSON — no markdown, no code fences. Return exactly this format: {\"names\":[{\"name\":\"...\",\"explanation\":\"...\"},{\"name\":\"...\",\"explanation\":\"...\"},{\"name\":\"...\",\"explanation\":\"...\"}]} Each explanation should be a witty one-liner (under 15 words). Be creative, playful, and varied — mix cute, funny, regal, and punny names.",
        },
        {
          role: "user",
          content: "Generate 3 unique and creative pet names with fun explanations.",
        },
      ],
      max_tokens: 300,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    return NextResponse.json(
      { error: `Gateway error: ${res.status}`, details: errorText },
      { status: res.status }
    );
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    return NextResponse.json(
      { error: "No response from model" },
      { status: 502 }
    );
  }

  try {
    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse model response", raw: content },
      { status: 502 }
    );
  }
}
