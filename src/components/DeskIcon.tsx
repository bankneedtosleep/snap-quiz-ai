import Image from "next/image";

const icons = {
  sparkles: "/icons/mark-pencil.png",
  pen: "/icons/mark-pen.png",
  trash: "/icons/mark-trash.png",
  calendar: "/icons/mark-calendar.png",
  cards: "/icons/mark-cards.png",
  quiz: "/icons/mark-pen.png",
  clip: "/icons/mark-link.png",
  paperclip: "/icons/mark-paperclip.png",
  check: "/icons/mark-check.png",
  cross: "/icons/mark-cross.png",
  cycle: "/icons/mark-cycle.png",
  lock: "/icons/mark-lock.png",
  arrow: "/icons/mark-arrow.png",
  arrowLeft: "/icons/mark-arrow-left.png",
} as const;

export type DeskIconName = keyof typeof icons;

export function DeskIcon({
  name,
  className,
}: {
  name: DeskIconName;
  className?: string;
}) {
  return (
    <span className={className ? `desk-icon ${className}` : "desk-icon"}>
      <Image src={icons[name]} alt="" width={64} height={64} />
    </span>
  );
}
