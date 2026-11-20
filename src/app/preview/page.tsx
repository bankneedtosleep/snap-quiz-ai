import type { Metadata } from "next";

import { BackHome } from "@/components/BackHome";
import { StudySession } from "@/components/StudySession";
import { sampleDeck } from "@/lib/sample-deck";

export const metadata: Metadata = {
  title: "ตัวอย่าง",
};

export default function PreviewPage() {
  return (
    <main className="page-wrap">
      <BackHome />
      <StudySession deckId={null} title={sampleDeck.title} createdLabel={null} content={sampleDeck} sample />
    </main>
  );
}
