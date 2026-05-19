"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import type { ElenxScanResult } from "@/lib/scanner";

type HistoryEntry = {
  target: string;
  score: number;
  scannedAt: string;
};

type ScanVerdict = {
  label: "Safe" | "Suspicious" | "Danger";
  description: string;
  className: string;
};

function getScanVerdict(result: ElenxScanResult): ScanVerdict {
  const hasSeriousFinding = result.findings.some((finding) => ["high", "critical"].includes(finding.severity));

  if (result.score < 60 || hasSeriousFinding) {
    return {
      label: "Danger",
      description: "Risiko tinggi ditemukan. Periksa temuan utama sebelum melanjutkan.",
      className: "border-red-400/30 bg-red-500/10 text-red-200",
    };
  }

  if (result.score < 85 || result.findings.length > 0) {
    return {
      label: "Suspicious",
      description: "Ada beberapa sinyal yang perlu diperiksa lebih lanjut.",
      className: "border-amber-300/30 bg-amber-400/10 text-amber-100",
    };
  }

  return {
    label: "Safe",
    description: "Tidak ada temuan penting dari pemeriksaan dasar.",
    className: "border-emerald-300/30 bg-emerald-400/10 text-emerald-100",
  };
}

function saveHistory(entry: HistoryEntry) {
  let current: HistoryEntry[] = [];

  try {
    current = JSON.parse(window.localStorage.getItem("elenx:scan-history") ?? "[]") as HistoryEntry[];
  } catch {
    current = [];
  }

  const next = [entry, ...current.filter((item) => item.target !== entry.target)].slice(0, 8);

  window.localStorage.setItem("elenx:scan-history", JSON.stringify(next));
  window.dispatchEvent(new Event("elenx:history-updated"));
}

export default function ScannerConsole() {
  const [target, setTarget] = useState("https://example.com");
  const [result, setResult] = useState<ElenxScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const queryTarget = new URLSearchParams(window.location.search).get("target");
    if (queryTarget) {
      setTarget(queryTarget);
    }
  }, []);

  async function runScan() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Scan failed.");
      }

      setResult(data);
      saveHistory({
        target: data.normalizedUrl ?? target,
        score: data.score,
        scannedAt: data.scannedAt,
      });
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : "Scan failed.");
    } finally {
      setLoading(false);
    }
  }

  const verdict = result ? getScanVerdict(result) : null;

  return (
    <section className="animate-fade-up mx-auto max-w-3xl">
      <div className="mb-8 animate-fade-up">
        <p className="mono text-xs uppercase tracking-[0.22em] text-cyan-200">scanner</p>
        <h1 className="mt-3 text-4xl font-semibold text-white">Scan target</h1>
      </div>

      <div className="shell-panel relative overflow-hidden rounded-lg p-5">
        {loading ? <div className="scan-line absolute left-0 top-0 h-px w-full" /> : null}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            className="mono"
            placeholder="https://domain.com"
          />
          <Button onClick={runScan} disabled={loading}>
            {loading ? "Scanning..." : "Scan"}
          </Button>
        </div>
        {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
      </div>

      {result && verdict ? (
        <div className="animate-fade-up mt-5 shell-panel rounded-lg p-5">
          <div className="flex flex-col gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-zinc-500">Score</p>
              <p className="mt-1 text-3xl font-semibold text-cyan-100">{result.score}/100</p>
            </div>
            <div className="flex flex-col gap-3 sm:items-end">
              <div className={`w-full rounded border px-4 py-3 sm:w-72 ${verdict.className}`}>
                <p className="mono text-xs uppercase tracking-[0.18em]">{verdict.label}</p>
                <p className="mt-2 text-sm leading-5">{verdict.description}</p>
              </div>
              <p className="mono max-w-full truncate text-sm text-zinc-400 sm:max-w-72">{result.hostname}</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {result.findings.length ? (
              result.findings.map((finding) => (
                <div key={finding.id} className="rounded border border-white/10 bg-white/[0.03] p-3 transition hover:-translate-y-0.5 hover:border-cyan-300/20">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-white">{finding.title}</p>
                    <span className="mono text-xs uppercase text-zinc-500">{finding.severity}</span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-400">{finding.description}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-400">Tidak ada temuan penting.</p>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
