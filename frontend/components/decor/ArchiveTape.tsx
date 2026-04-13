import { cn } from "@/lib/utils";

const TAPE_TONES = {
  "accent-red": "bg-accent-red",
  "accent-blue": "bg-accent-blue",
  "accent-green": "bg-accent-green",
  "paper-muted": "bg-paper-muted",
  stage: "bg-stage",
} as const;

type ArchiveTapeProps = {
  className?: string;
  tone?: keyof typeof TAPE_TONES;
};

export default function ArchiveTape({
  className,
  tone = "accent-red",
}: ArchiveTapeProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("absolute archive-tape", TAPE_TONES[tone], className)}
    />
  );
}
