"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PetName {
  name: string;
  explanation: string;
}

const EMOJIS = ["🐶", "🐱", "🐰", "🦊", "🐼", "🐨", "🦄", "🐸", "🐧", "🦋"];

function getRandomEmoji() {
  return EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
}

export default function Home() {
  const [names, setNames] = useState<PetName[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emojis, setEmojis] = useState<string[]>([]);

  async function handleRandomise() {
    setLoading(true);
    setError(null);

    try {
      const tokenMeta = document.querySelector<HTMLMetaElement>(
        'meta[name="terminal-ai-token"]'
      );
      const embedToken = tokenMeta?.content ?? "";

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-embed-token": embedToken,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? `Request failed (${res.status})`);
      }

      const data = await res.json();
      setNames(data.names);
      setEmojis([getRandomEmoji(), getRandomEmoji(), getRandomEmoji()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-4 py-16">
      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Pet Names Generator
          </h1>
          <p className="text-sm text-zinc-500">
            Tap randomise for 3 creative pet names with witty explanations
          </p>
          <Badge variant="secondary" className="text-xs font-mono">
            1 credit per use
          </Badge>
        </div>

        {/* Randomise Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleRandomise}
            disabled={loading}
            className="px-8 text-base font-semibold"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Generating...
              </span>
            ) : (
              "Randomise"
            )}
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Name Cards */}
        {names.length > 0 && (
          <div className="space-y-3">
            {names.map((pet, i) => (
              <Card
                key={`${pet.name}-${i}`}
                className="border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md"
              >
                <CardContent className="flex items-start gap-4 p-5">
                  <span className="text-3xl leading-none">{emojis[i]}</span>
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-zinc-900">
                      {pet.name}
                    </h2>
                    <p className="text-sm text-zinc-500">{pet.explanation}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {names.length === 0 && !loading && !error && (
          <div className="flex flex-col items-center gap-2 py-8 text-zinc-400">
            <span className="text-5xl">🐾</span>
            <p className="text-sm">Your pet names will appear here</p>
          </div>
        )}
      </div>
    </main>
  );
}
