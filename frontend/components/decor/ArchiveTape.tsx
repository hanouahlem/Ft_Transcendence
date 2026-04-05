import { cn } from "@/lib/utils";

type ArchiveTapeProps = {
  className?: string;
};

export default function ArchiveTape({ className }: ArchiveTapeProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("absolute bg-accent-orange archive-tape", className)}
    />
  );
}
