"use client";

import { useState } from "react";

import { DeskIcon } from "@/components/DeskIcon";
import { FlashcardView } from "@/components/FlashcardView";
import { Highlight } from "@/components/Highlight";
import { QuizMode } from "@/components/QuizMode";
import { TapeTag } from "@/components/TapeTag";
import type { DeckContent } from "@/lib/types";

type Mode = "cards" | "quiz";

export function StudySession({
  deckId,
  title,
  createdLabel,
  content,
  sample = false,
}: {
  deckId: string | null;
  title: string;
  createdLabel: string | null;
  content: DeckContent;
  sample?: boolean;
}) {
  const [mode, setMode] = useState<Mode>("cards");
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      const url = `${window.location.origin}${window.location.pathname}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article className="deck-page">
      <header className="deck-heading">
        <TapeTag>{sample ? "ตัวอย่าง" : "ชุดทบทวน"}</TapeTag>
        <h1>
          <Highlight>{title}</Highlight>
        </h1>
        {createdLabel ? (
          <p className="deck-meta">
            <DeskIcon name="calendar" />
            สร้างเมื่อ {createdLabel}
          </p>
        ) : null}
      </header>

      <div className="deck-toolbar">
        <div className="mode-switch" role="tablist" aria-label="โหมดทบทวน">
          <button
            type="button"
            role="tab"
            id="tab-cards"
            aria-selected={mode === "cards"}
            aria-controls="panel-cards"
            className={mode === "cards" ? "is-selected" : ""}
            onClick={() => setMode("cards")}
          >
            <DeskIcon name="cards" />
            แฟลชการ์ด
          </button>
          <button
            type="button"
            role="tab"
            id="tab-quiz"
            aria-selected={mode === "quiz"}
            aria-controls="panel-quiz"
            className={mode === "quiz" ? "is-selected" : ""}
            onClick={() => setMode("quiz")}
          >
            <DeskIcon name="quiz" />
            มินิควิซ
          </button>
        </div>
        {deckId ? (
          <button type="button" className="button button-quiet copy-button" onClick={copyLink} aria-live="polite">
            <DeskIcon name={copied ? "check" : "clip"} />
            {copied ? "คัดลอกแล้ว" : "คัดลอกลิงก์"}
          </button>
        ) : null}
      </div>

      <div id="panel-cards" className="study-panel" role="tabpanel" aria-labelledby="tab-cards" hidden={mode !== "cards"}>
        <FlashcardView cards={content.cards} active={mode === "cards"} />
      </div>
      <div id="panel-quiz" className="study-panel" role="tabpanel" aria-labelledby="tab-quiz" hidden={mode !== "quiz"}>
        <QuizMode quizzes={content.quizzes} onOpenCards={() => setMode("cards")} />
      </div>
    </article>
  );
}
