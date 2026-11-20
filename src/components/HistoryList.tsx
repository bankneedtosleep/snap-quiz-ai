"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { removeDeck } from "@/app/deck-actions";
import { DeskIcon } from "@/components/DeskIcon";
import { formatThaiDate } from "@/lib/format";
import type { DeckSummary } from "@/lib/types";

export function HistoryList({ decks }: { decks: DeckSummary[] }) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [leavingId, setLeavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const visible = decks.filter((deck) => !removedIds.includes(deck.id));

  async function confirmDelete(deck: DeckSummary) {
    setPendingId(deck.id);
    setError(null);
    const result = await removeDeck(deck.id);

    if (result.error) {
      setPendingId(null);
      setError(result.error);
      return;
    }

    setLeavingId(deck.id);
    window.setTimeout(() => {
      setRemovedIds((current) => [...current, deck.id]);
      setLeavingId(null);
      setPendingId(null);
      setConfirmingId(null);
    }, 280);
  }

  if (visible.length === 0) {
    return (
      <div className="empty-deck">
        <Image src="/brand-mark.jpg" alt="" width={160} height={160} />
        <p>ยังไม่มีชุดทบทวน วางสรุปทางซ้ายแล้วกดสร้างชุดแรก หรือเปิดตัวอย่างก่อน</p>
      </div>
    );
  }

  return (
    <>
      {error ? <p className="history-error">{error}</p> : null}
      <ol className="history-list">
        {visible.map((deck, index) => {
          const pending = pendingId === deck.id;
          const confirming = confirmingId === deck.id;

          return (
            <li key={deck.id} className={leavingId === deck.id ? "history-item is-leaving" : "history-item"}>
              <Link href={`/deck/${deck.id}`} className="history-link">
                <span className="history-index">{(index + 1).toLocaleString("th-TH")}</span>
                <span>
                  <span className="history-title">{deck.title}</span>
                  <span className="history-meta">
                    <time dateTime={deck.createdAt}>{formatThaiDate(deck.createdAt)}</time>
                    {deck.questionCount > 0 ? <span>{deck.questionCount.toLocaleString("th-TH")} ข้อ</span> : null}
                  </span>
                </span>
                <DeskIcon name="arrow" className="history-go" />
              </Link>
              {confirming ? (
                <span className="history-confirm">
                  <button
                    type="button"
                    className="history-delete"
                    disabled={pending}
                    onClick={() => confirmDelete(deck)}
                  >
                    <DeskIcon name="trash" />
                    {pending ? "กำลังลบ" : "ลบ"}
                  </button>
                  <button
                    type="button"
                    className="history-cancel"
                    disabled={pending}
                    onClick={() => setConfirmingId(null)}
                  >
                    ยกเลิก
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  className="history-delete"
                  aria-label={`ลบชุด ${deck.title}`}
                  disabled={pendingId !== null}
                  onClick={() => {
                    setError(null);
                    setConfirmingId(deck.id);
                  }}
                >
                  <DeskIcon name="trash" />
                  ลบ
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </>
  );
}
