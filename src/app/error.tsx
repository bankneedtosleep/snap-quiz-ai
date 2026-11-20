"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="page-wrap missing-page">
      <p className="kicker">เปิดหน้านี้ไม่สำเร็จ</p>
      <h1>ระบบสะดุดระหว่างโหลดข้อมูล</h1>
      <p className="lede">ลองอีกครั้งได้ ถ้าเพิ่งตั้งค่าฐานข้อมูล ให้ตรวจว่าตาราง decks ถูกสร้างแล้ว</p>
      <button type="button" className="button button-primary" onClick={reset}>
        ลองอีกครั้ง
      </button>
    </main>
  );
}
