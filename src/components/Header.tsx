import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="site-header">
      <Link href="/" className="brand">
        <Image src="/brand-mark.jpg" alt="" width={96} height={96} className="brand-mark" />
        <span className="brand-name">SnapQuiz</span>
        <span className="ai-sticker">AI</span>
      </Link>
      <p className="tagline">เปลี่ยนสรุปสั้นๆ ให้เป็นการทวนใจความในคลิกเดียว</p>
    </header>
  );
}
