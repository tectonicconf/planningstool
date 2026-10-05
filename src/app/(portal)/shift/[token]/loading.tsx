export default function ShiftLoading() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#050822] font-sans text-white">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 12% 95%, rgba(37,70,235,0.55), transparent 60%)," +
            "radial-gradient(ellipse 55% 45% at 90% 5%, rgba(45,90,235,0.4), transparent 60%)," +
            "linear-gradient(180deg, #060a2e 0%, #050818 55%, #04050f 100%)",
        }}
      />
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-300/30 border-t-blue-300" />
        <p className="font-mono text-sm tracking-[0.3em] text-blue-200/60">
          LOADING SCHEDULE
        </p>
      </div>
    </div>
  );
}
