import Link from "next/link";

import { DeskIcon } from "@/components/DeskIcon";

export function BackHome() {
  return (
    <Link href="/" className="back-link">
      <DeskIcon name="arrowLeft" className="is-back" />
      กลับหน้าแรก
    </Link>
  );
}
