import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BackHome } from "@/components/BackHome";
import { StudySession } from "@/components/StudySession";
import { getDeck } from "@/lib/decks";
import { formatThaiDate } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const deck = await getDeck(id);
  return { title: deck?.content.title ?? "ไม่พบชุดทบทวน" };
}

export default async function DeckPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const deck = await getDeck(id);
  if (!deck) notFound();

  return (
    <main className="page-wrap">
      <BackHome />
      <StudySession
        deckId={deck.id}
        title={deck.content.title}
        createdLabel={formatThaiDate(deck.createdAt)}
        content={deck.content}
      />
    </main>
  );
}
