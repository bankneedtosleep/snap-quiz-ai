import "server-only";

import { createHash } from "node:crypto";

export function sourceHash(text: string, count: number) {
  return createHash("sha256").update(`${count}\n${text}`).digest("hex");
}
