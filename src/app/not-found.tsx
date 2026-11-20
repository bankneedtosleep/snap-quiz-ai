import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-wrap missing-page">
      <p className="kicker">ไม่พบชุดทบทวน</p>
      <h1>ลิงก์นี้ไม่มีในสมุด</h1>
      <p className="lede">ชุดข้อสอบอาจหายไป หรือลิงก์ไม่ครบ กลับไปสร้างชุดใหม่จากสรุปได้</p>
      <p>
        <Link href="/" className="button button-primary">
          ไปหน้าแรก
        </Link>
      </p>
    </main>
  );
}
