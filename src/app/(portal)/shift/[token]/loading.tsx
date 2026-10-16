export default function ShiftLoading() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#050A2B] font-sans text-white">
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-300/30 border-t-blue-300" />
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-300">
          LOADING SCHEDULE
        </p>
      </div>
    </div>
  );
}
