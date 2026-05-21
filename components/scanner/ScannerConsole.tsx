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
  barClassName: string;
};

function getScanVerdict(result: ElenxScanResult): ScanVerdict {
  const hasSeriousFinding = result.findings.some((finding) => ["high", "critical"].includes(finding.severity));

  if (result.score < 60 || hasSeriousFinding) {
    return {
      label: "Danger",
      description: "Risiko tinggi ditemukan. Periksa temuan utama sebelum melanjutkan.",
      className: "border-red-400/30 bg-red-500/10 text-red-200",
      barClassName: "bg-red-300",
    };
  }

  if (result.score < 85 || result.findings.length > 0) {
    return {
      label: "Suspicious",
      description: "Ada beberapa sinyal yang perlu diperiksa lebih lanjut.",
      className: "border-amber-300/30 bg-amber-400/10 text-amber-100",
      barClassName: "bg-amber-200",
    };
  }

  return {
    label: "Safe",
    description: "Tidak ada temuan penting dari pemeriksaan dasar.",
    className: "border-emerald-300/30 bg-emerald-400/10 text-emerald-100",
    barClassName: "bg-emerald-200",
  };
}

function getSeverityCount(result: ElenxScanResult, severity: "low" | "medium" | "high" | "critical") {
  return result.findings.filter((finding) => finding.severity === severity).length;
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
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    const queryTarget = new URLSearchParams(window.location.search).get("target");
    if (queryTarget) {
      setTarget(queryTarget);
    }
  }, []);

  useEffect(() => {
    setLogoFailed(false);
  }, [result?.hostname]);

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
  const failedChecks = result ? Object.values(result.checks).filter((check) => check === "failed").length : 0;
  const warningChecks = result ? Object.values(result.checks).filter((check) => check === "warning").length : 0;
  const passedChecks = result ? Object.values(result.checks).filter((check) => check === "passed").length : 0;

  return (
    <section className="animate-fade-up mx-auto max-w-3xl">
      <div className="mb-8 animate-fade-up">
        <p className="mono inline-flex items-center gap-2 rounded border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs uppercase tracking-[0.22em] text-cyan-200">
          <span className="status-dot animate-soft-pulse" />
          scanner
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-white">Scan target</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-500">
          Masukkan domain atau URL, lalu baca status akhirnya tanpa perlu bongkar detail teknis satu per satu.
        </p>
      </div>

      <div className="scan-surface shell-panel relative rounded-lg p-5">
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
        <div className="mt-4 grid gap-2 text-xs text-zinc-500 sm:grid-cols-3">
          <p className="motion-chip rounded border border-white/10 bg-black/20 px-3 py-2">DNS + records</p>
          <p className="motion-chip stagger-1 rounded border border-white/10 bg-black/20 px-3 py-2">SSL + headers</p>
          <p className="motion-chip stagger-2 rounded border border-white/10 bg-black/20 px-3 py-2">Ports + reputation</p>
        </div>
        {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
      </div>

      {result && verdict ? (
        <div className="ambient-glow scan-surface animate-fade-up mt-5 shell-panel rounded-lg p-5">
          <div className="flex flex-col gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded border border-white/10 bg-white/[0.04]">
                  {logoFailed ? (
                    <span className="text-lg font-semibold uppercase text-cyan-100">
                      {result.hostname.slice(0, 1)}
                    </span>
                  ) : (
                    <img
                      src={result.logoUrl}
                      alt={`${result.hostname} logo`}
                      className="h-10 w-10 object-contain"
                      onError={() => setLogoFailed(true)}
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm text-zinc-500">{result.hostname}</p>
                  <p className="mt-1 text-3xl font-semibold text-cyan-100">{result.score}/100</p>
                </div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full animate-slide-in rounded-full shadow-[0_0_18px_currentColor] transition-all duration-700 ${verdict.barClassName}`}
                  style={{ width: `${result.score}%` }}
                />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                <div className="motion-card animate-rise-in rounded border border-white/10 bg-black/20 px-3 py-2">
                  <p className="mono text-zinc-500">passed</p>
                  <p className="mt-1 text-lg font-semibold text-emerald-100">{passedChecks}</p>
                </div>
                <div className="motion-card animate-rise-in stagger-1 rounded border border-white/10 bg-black/20 px-3 py-2">
                  <p className="mono text-zinc-500">warning</p>
                  <p className="mt-1 text-lg font-semibold text-amber-100">{warningChecks}</p>
                </div>
                <div className="motion-card animate-rise-in stagger-2 rounded border border-white/10 bg-black/20 px-3 py-2">
                  <p className="mono text-zinc-500">failed</p>
                  <p className="mt-1 text-lg font-semibold text-red-100">{failedChecks}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:items-end">
              <div className={`animate-slide-in relative w-full overflow-hidden rounded border px-4 py-3 sm:w-72 ${verdict.className}`}>
                <p className="mono flex items-center gap-2 text-xs uppercase tracking-[0.18em]">
                  <span className="status-dot animate-soft-pulse" />
                  {verdict.label}
                </p>
                <p className="mt-2 text-sm leading-5">{verdict.description}</p>
              </div>
              <p className="mono max-w-full truncate text-sm text-zinc-400 sm:max-w-72">{result.normalizedUrl}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-2 text-xs sm:grid-cols-4">
            <div className="motion-card animate-rise-in rounded border border-white/10 bg-white/[0.025] px-3 py-2">
              <p className="mono text-zinc-500">findings</p>
              <p className="mt-1 text-base font-semibold text-white">{result.findings.length}</p>
            </div>
            <div className="motion-card animate-rise-in stagger-1 rounded border border-white/10 bg-white/[0.025] px-3 py-2">
              <p className="mono text-zinc-500">critical</p>
              <p className="mt-1 text-base font-semibold text-red-100">{getSeverityCount(result, "critical")}</p>
            </div>
            <div className="motion-card animate-rise-in stagger-2 rounded border border-white/10 bg-white/[0.025] px-3 py-2">
              <p className="mono text-zinc-500">high</p>
              <p className="mt-1 text-base font-semibold text-red-100">{getSeverityCount(result, "high")}</p>
            </div>
            <div className="motion-card animate-rise-in stagger-3 rounded border border-white/10 bg-white/[0.025] px-3 py-2">
              <p className="mono text-zinc-500">medium</p>
              <p className="mt-1 text-base font-semibold text-amber-100">{getSeverityCount(result, "medium")}</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {result.findings.length ? (
              result.findings.map((finding) => (
                <div key={finding.id} className="motion-card animate-rise-in rounded border border-white/10 bg-white/[0.03] p-3 hover:border-cyan-300/20 hover:bg-white/[0.045]">
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
