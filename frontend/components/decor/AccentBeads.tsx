import { cn } from "@/lib/utils";

const ACCENT_BEAD_COLORS = [
  "var(--color-accent-blue)",
  "var(--color-accent-green)",
  "var(--color-accent-orange)",
];

function Bead({ color, className }: { color: string; className?: string }) {
  return (
    <div
      className={cn(
        "h-3.5 w-3.5 rounded-full border border-black/20 shadow-[0_2px_4px_rgba(0,0,0,0.35)]",
        className,
      )}
      style={{ backgroundColor: color }}
    />
  );
}

type AccentBeadsProps = {
  className?: string;
  vertical?: boolean;
};

export default function AccentBeads({
  className,
  vertical = false,
}: AccentBeadsProps) {
  return (
    <div
      className={cn("flex gap-2", vertical && "flex-col", className)}
      aria-hidden="true"
    >
      {ACCENT_BEAD_COLORS.map((color) => (
        <Bead key={color} color={color} />
      ))}
    </div>
  );
}
