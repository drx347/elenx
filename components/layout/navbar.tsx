"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type HistoryEntry = {
  target: string;
  score: number;
  scannedAt: string;
};

const navItems = [
  { href: "/", label: "Home" },
  { href: "/scanner", label: "Scanner" },
];

export default function Navbar() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function loadHistory() {
      try {
        const saved = window.localStorage.getItem("elenx:scan-history");
        setHistory(saved ? JSON.parse(saved).slice(0, 8) : []);
      } catch {
        setHistory([]);
      }
    }

    loadHistory();
    window.addEventListener("storage", loadHistory);
    window.addEventListener("elenx:history-updated", loadHistory);

    return () => {
      window.removeEventListener("storage", loadHistory);
      window.removeEventListener("elenx:history-updated", loadHistory);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#090909]/78 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded border border-cyan-400/40 bg-cyan-400/10 text-sm font-black text-cyan-200 shadow-[0_0_22px_rgba(0,229,255,0.12)] transition hover:scale-105 hover:border-cyan-300/70">
            EX
          </span>
          <span className="text-lg font-semibold tracking-wide text-white">ElenX</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="relative flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="rounded px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
          >
            History
          </button>

          {open ? (
            <div className="animate-pop absolute right-0 top-12 w-72 rounded-lg border border-white/10 bg-[#101010]/95 p-2 shadow-2xl shadow-black/50 backdrop-blur-xl">
              {history.length ? (
                <div className="space-y-1">
                  {history.map((item) => (
                    <Link
                      key={`${item.target}-${item.scannedAt}`}
                      href={`/scanner?target=${encodeURIComponent(item.target)}`}
                      onClick={() => setOpen(false)}
                      className="block rounded px-3 py-2 transition hover:bg-white/[0.07]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="mono truncate text-xs text-zinc-300">{item.target}</span>
                        <span className="mono text-xs text-cyan-200">{item.score}</span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-600">{new Date(item.scannedAt).toLocaleString()}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="px-3 py-4 text-sm text-zinc-500">Belum ada history.</p>
              )}
            </div>
          ) : null}

          <Link
            href="/scanner"
            className="rounded border border-cyan-400/35 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100 shadow-[0_0_24px_rgba(0,229,255,0.08)] transition hover:-translate-y-0.5 hover:border-cyan-300/70 hover:bg-cyan-400/15"
          >
            Scan
          </Link>
        </div>
      </div>
    </header>
  );
}
