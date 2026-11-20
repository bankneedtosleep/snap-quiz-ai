import Image from "next/image";
import Link from "next/link";

import { Highlight } from "@/components/Highlight";
import { HistoryList } from "@/components/HistoryList";
import { NoteInputForm } from "@/components/NoteInputForm";
import { TapeTag } from "@/components/TapeTag";
import { listDecks } from "@/lib/decks";

export default async function HomePage() {
  const history = await listDecks();

  return (
    <main className="page-wrap">
      <div className="home-grid">
        <section className="home-copy">
          <div className="rise">
            <TapeTag>สร้างครั้งเดียว ทวนได้เรื่อย ๆ</TapeTag>
          </div>
          <h1 className="rise rise-2">
            วางสรุป แล้วได้ทั้ง<Highlight>การ์ด</Highlight>และ<Highlight>ข้อสอบ</Highlight>
          </h1>
          <p className="lede rise rise-3">
            แปะใจความจากคาบเรียนได้ไม่เกิน 1,500 ตัวอักษร แล้วได้การ์ดพลิกกับข้อสอบปรนัยให้ทวนก่อนสอบ
            ส่งลิงก์ให้เพื่อนก็เปิดชุดเดิมได้เลย
          </p>
          <div className="rise rise-4">
            <NoteInputForm />
          </div>
        </section>

        <aside className="history-panel rise rise-5">
          <Image
            src="/study-scene.jpg"
            alt=""
            width={1200}
            height={900}
            priority
            className="study-scene"
          />
          <div className="history-head">
            <h2>ชุดที่เคยสร้าง</h2>
            <Link href="/preview" className="preview-link">
              ดูตัวอย่างการ์ดและข้อสอบ
            </Link>
          </div>
          {history.error ? <p className="history-error">{history.error}</p> : null}
          {!history.error ? <HistoryList decks={history.decks} /> : null}
        </aside>
      </div>
    </main>
  );
}
