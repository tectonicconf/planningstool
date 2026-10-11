export default function ShiftLoading() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#050A2B] font-sans text-white">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 12% 95%, rgba(17,65,233,0.55), transparent 60%)," +
            "radial-gradient(ellipse 55% 45% at 90% 5%, rgba(118,49,220,0.32), transparent 60%)," +
            "linear-gradient(180deg, #0D1341 0%, #050A2B 55%, #03061C 100%)",
        }}
      />
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-300/30 border-t-blue-300" />
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-300">
          LOADING SCHEDULE
        </p>
      </div>
    </div>
  );
}
