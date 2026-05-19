import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="animate-fade-up mx-auto flex min-h-[calc(100vh-8rem)] max-w-4xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
        <p className="mono text-xs uppercase tracking-[0.22em] text-cyan-200">ElenX Scanner</p>
        <h1 className="mt-4 text-4xl font-semibold text-white sm:text-6xl">
          Scan website dengan cepat.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400">
          Cek DNS, SSL, header, redirect, port, dan reputasi dalam satu tempat.
        </p>
        <div className="mt-8">
          <Link
            href="/scanner"
            className="inline-flex rounded border border-cyan-300/50 bg-cyan-400/15 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:-translate-y-0.5 hover:bg-cyan-400/20"
          >
            Mulai scan
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
