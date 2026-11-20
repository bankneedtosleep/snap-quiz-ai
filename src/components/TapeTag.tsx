import type { ReactNode } from "react";

export function TapeTag({ children }: { children: ReactNode }) {
  return <span className="tape-tag">{children}</span>;
}
