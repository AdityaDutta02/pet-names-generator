import { NextRequest, NextResponse } from "next/server";
import { callGateway } from "@/lib/terminal-ai";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { embedToken?: string };
  const { embedToken } = body;

  if (!embedToken) {
    return NextResponse.json({ error: "Missing embed token" }, { status: 401 });
  }

  const res = await callGateway(
    [
      {
        role: "system",
        content:
          "You generate creative, fun pet names. Respond ONLY with valid JSON — no markdown, no code fences. Return exactly this format: {\"names\":[{\"name\":\"...\",\"explanation\":\"...\"},{\"name\":\"...\",\"explanation\":\"...\"},{\"name\":\"...\",\"explanation\":\"...\"}]} Each explanation should be a witty one-liner (under 15 words). Be creative, playful, and varied — mix cute, funny, regal, and punny names.",
      },
      {
        role: "user",
        content:
          "Generate 3 unique and creative pet names with fun explanations.",
      },
    ],
    embedToken,
  );

  if (!res.ok) {
    const errorText = await res.text();
    return NextResponse.json(
      { error: `Gateway error: ${res.status}`, details: errorText },
      { status: res.status },
    );
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    return NextResponse.json(
      { error: "No response from model" },
      { status: 502 },
    );
  }

  try {
    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse model response", raw: content },
      { status: 502 },
    );
  }
}
