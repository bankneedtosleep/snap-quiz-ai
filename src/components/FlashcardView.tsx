"use client";

import { useEffect, useState } from "react";

import { DeskIcon } from "@/components/DeskIcon";
import { OutlineButton } from "@/components/OutlineButton";
import { PrimaryButton } from "@/components/PrimaryButton";
import type { Flashcard } from "@/lib/types";

type Mark = "known" | "again" | null;

export function FlashcardView({ cards, active = true }: { cards: Flashcard[]; active?: boolean }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [marks, setMarks] = useState<Mark[]>(() => cards.map(() => null));
  const [done, setDone] = useState(false);
  const [spark, setSpark] = useState(false);

  const card = cards[index];
  const knownCount = marks.filter((mark) => mark === "known").length;
  const againCount = marks.filter((mark) => mark === "again").length;
  const openCount = cards.length - knownCount - againCount;
  const behind = cards.length - index - 1;

  useEffect(() => {
    if (!active) return;

    function onKey(event: KeyboardEvent) {
      const target = event.target;
      const inField = target instanceof HTMLElement && Boolean(target.closest("input, textarea"));
      if (inField) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setDone(false);
        setIndex((current) => Math.max(0, current - 1));
        setFlipped(false);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setDone(false);
        setIndex((current) => Math.min(cards.length - 1, current + 1));
        setFlipped(false);
      }

      const onButton = target instanceof HTMLElement && Boolean(target.closest("button, a"));
      const onCard = target instanceof HTMLElement && Boolean(target.closest(".flip-button"));
      if ((event.key === " " || event.key === "Enter") && (!onButton || onCard)) {
        if (onCard) return;
        event.preventDefault();
        setFlipped((current) => !current);
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, cards.length]);

  if (!card) {
    return <p className="empty-copy">ชุดนี้ยังไม่มีการ์ด</p>;
  }

  function show(nextIndex: number) {
    setDone(false);
    setIndex(nextIndex);
    setFlipped(false);
  }

  function mark(value: Exclude<Mark, null>) {
    const next = marks.map((item, itemIndex) => (itemIndex === index ? value : item));
    setMarks(next);
    if (value === "known") {
      setSpark(true);
      window.setTimeout(() => setSpark(false), 520);
    }
    if (next.every((item) => item !== null)) {
      setDone(true);
      return;
    }
    if (index < cards.length - 1) show(index + 1);
  }

  function reviewAgain() {
    const againIndex = marks.findIndex((item) => item === "again");
    if (againIndex >= 0) show(againIndex);
  }

  return (
    <div className="study-layout">
      <div className="study-main">
        {done ? (
          <div className="done-card">
            <div className="confetti" aria-hidden="true">
              {Array.from({ length: 14 }, (_, piece) => (
                <i key={piece} />
              ))}
            </div>
            <p className="eyebrow">ทวนครบแล้ว</p>
            <p className="done-title">ครบทุกใบในรอบนี้</p>
            <p className="score-caption">
              อธิบายได้ {knownCount.toLocaleString("th-TH")} ใบ · ยังเล่าไม่คล่อง {againCount.toLocaleString("th-TH")} ใบ
            </p>
            {againCount > 0 ? (
              <PrimaryButton type="button" onClick={reviewAgain}>
                <DeskIcon name="cycle" />
                ทวนใบที่ยังเล่าไม่คล่องอีกครั้ง
              </PrimaryButton>
            ) : null}
          </div>
        ) : (
          <div className={behind >= 2 ? "card-stage has-two" : behind === 1 ? "card-stage has-one" : "card-stage"}>
            <button
              type="button"
              className={spark ? "flip-button is-spark" : "flip-button"}
              aria-pressed={flipped}
              onClick={() => setFlipped((current) => !current)}
            >
              <span className={flipped ? "flip-inner is-flipped" : "flip-inner"}>
                <span className="flip-face flip-front" aria-hidden={flipped}>
                  <span className="face-label">
                    จากสรุป {(index + 1).toLocaleString("th-TH")}/{cards.length.toLocaleString("th-TH")}
                  </span>
                  <span className="face-copy">{card.question}</span>
                  <span className="face-hint">แตะการ์ดเพื่อดูว่าต้องเล่าอะไร</span>
                </span>
                <span className="flip-face flip-back" aria-hidden={!flipped}>
                  <span className="face-label">เล่าให้ได้</span>
                  <span className="face-copy">{card.answer}</span>
                  <span className="face-hint">แตะการ์ดเพื่อกลับไปอ่านสรุป</span>
                </span>
              </span>
            </button>
          </div>
        )}

        <div className="card-controls">
          <OutlineButton type="button" onClick={() => show(index - 1)} disabled={index === 0}>
            <DeskIcon name="arrowLeft" />
            ก่อนหน้า
          </OutlineButton>
          <p className="card-count">
            {(index + 1).toLocaleString("th-TH")} / {cards.length.toLocaleString("th-TH")}
          </p>
          <OutlineButton type="button" onClick={() => show(index + 1)} disabled={index === cards.length - 1}>
            ถัดไป
            <DeskIcon name="arrow" />
          </OutlineButton>
        </div>

        <div className="card-controls mark-row">
          <button type="button" className="again-button" onClick={() => mark("again")}>
            <DeskIcon name="cycle" />
            ยังเล่าไม่คล่อง
          </button>
          <PrimaryButton type="button" onClick={() => mark("known")}>
            <DeskIcon name="check" />
            อธิบายได้
          </PrimaryButton>
        </div>
      </div>

      <aside className="progress-panel">
        <h2>ความคืบหน้า</h2>
        <div className="chip-row" aria-live="polite">
          <p className="status-chip is-known">
            อธิบายได้ <strong key={knownCount}>{knownCount.toLocaleString("th-TH")}</strong>
          </p>
          <p className="status-chip is-again">
            ยังเล่าไม่คล่อง <strong key={againCount}>{againCount.toLocaleString("th-TH")}</strong>
          </p>
          <p className="status-chip is-open">
            ยังไม่ตอบ <strong key={openCount}>{openCount.toLocaleString("th-TH")}</strong>
          </p>
        </div>
        <div className="progress-track" aria-hidden="true">
          <i style={{ width: `${cards.length === 0 ? 0 : ((knownCount + againCount) / cards.length) * 100}%` }} />
        </div>
        <ol className="progress-list">
          {cards.map((item, itemIndex) => (
            <li key={item.question}>
              <button
                type="button"
                className={itemIndex === index && !done ? "is-current" : ""}
                onClick={() => show(itemIndex)}
              >
                <span className={`progress-dot is-${marks[itemIndex] ?? "open"}`} />
                <span>{item.question}</span>
              </button>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}
