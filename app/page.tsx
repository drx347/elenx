import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-6xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="animate-fade-up">
            <p className="mono inline-flex items-center gap-2 rounded border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs uppercase tracking-[0.22em] text-cyan-200">
              <span className="status-dot animate-soft-pulse" />
              ElenX Scanner
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-6xl">
              Website security check yang langsung kebaca.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400">
              Cek DNS, SSL, header, redirect, port, dan reputasi tanpa tampilan yang bikin mikir dua kali.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/scanner"
                className="inline-flex items-center justify-center rounded border border-cyan-300/50 bg-cyan-400/15 px-5 py-3 text-sm font-semibold text-cyan-50 shadow-[0_0_30px_rgba(0,229,255,0.09)] transition hover:-translate-y-0.5 hover:bg-cyan-400/20"
              >
                Mulai scan
              </Link>
              <Link
                href="/scanner?target=https%3A%2F%2Fexample.com"
                className="inline-flex items-center justify-center rounded border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:-translate-y-0.5 hover:bg-white/[0.07]"
              >
                Coba contoh
              </Link>
            </div>
          </section>

          <section className="scan-surface shell-panel animate-fade-up rounded-lg p-5 [animation-delay:120ms]">
            <div className="relative">
              <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="mono text-xs uppercase tracking-[0.2em] text-zinc-500">live frame</p>
                  <p className="mt-1 text-lg font-semibold text-white">Risk snapshot</p>
                </div>
                <span className="mono rounded border border-emerald-300/25 bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-200">safe</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {["DNS", "SSL", "HTTP"].map((item, index) => (
                  <div key={item} className="rounded border border-white/10 bg-white/[0.035] p-3">
                    <p className="mono text-xs text-zinc-500">{item}</p>
                    <div className="mt-3 h-1.5 overflow-hidden rounded bg-white/10">
                      <div
                        className="h-full rounded bg-cyan-200"
                        style={{ width: `${92 - index * 12}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                {["Security headers detected", "TLS endpoint active", "No critical signal found"].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded border border-white/10 bg-black/20 px-3 py-2 text-sm text-zinc-300">
                    <span className="status-dot text-emerald-200" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
