import type { ReactNode } from "react";

export function PaperCard({
  tilt = "none",
  className,
  children,
}: {
  tilt?: "none" | "left" | "right";
  className?: string;
  children: ReactNode;
}) {
  const classes = className ? `paper-card ${className}` : "paper-card";

  return (
    <div className={classes} data-tilt={tilt}>
      {children}
    </div>
  );
}
