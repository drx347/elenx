export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#090909]/86">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-zinc-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <p>ElenX scanner.</p>
        <p className="mono inline-flex items-center gap-2 text-zinc-400">
          <span className="status-dot animate-soft-pulse text-cyan-200" />
          ready
        </p>
      </div>
    </footer>
  );
}
