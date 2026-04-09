export default function ArchiveStar() {
  return (
    <svg
      viewBox="0 0 50 50"
      className="h-full w-full fill-none stroke-accent-red"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="25,5 30,20 45,25 30,30 25,45 20,30 5,25 20,20" />
      <line x1="15" y1="15" x2="35" y2="35" />
      <line x1="15" y1="35" x2="35" y2="15" />
    </svg>
  );
}
