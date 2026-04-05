export default function WaxSeal() {
  return (
    <div className="relative -mt-4 mr-2 flex h-12 w-12 rotate-15 items-center justify-center rounded-full bg-accent-red font-display text-base font-bold shadow-[inset_2px_2px_6px_rgba(0,0,0,0.5),2px_3px_5px_rgba(0,0,0,0.3)] sm:h-14 sm:w-14 sm:text-2xl">
      <span
        className="text-accent-red opacity-70"
        style={{
          textShadow:
            "-0.75px -0.75px 0 rgba(255,255,255,0.22), 1px 1px 0 rgba(90,20,20,0.42)",
        }}
      >
        42
      </span>
      <div className="absolute inset-0.5 rounded-full border border-white/20" />
    </div>
  );
}
