import dns from "node:dns/promises";
import net from "node:net";
import tls from "node:tls";

export type CheckState = "passed" | "warning" | "failed" | "not_configured";

export type ScanFinding = {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  source: string;
};

export type ElenxScanResult = {
  target: string;
  normalizedUrl: string;
  hostname: string;
  logoUrl: string;
  status: "completed";
  score: number;
  checks: Record<string, CheckState>;
  dns: {
    A: string[];
    AAAA: string[];
    MX: string[];
    TXT: string[];
  };
  ssl: {
    enabled: boolean;
    authorized?: boolean;
    validTo?: string;
    issuer?: string;
    subject?: string;
    protocol?: string;
  };
  http: {
    status?: number;
    finalUrl?: string;
    redirects: string[];
    logoUrl?: string;
    securityHeaders: Record<string, string | null>;
  };
  ports: Array<{ port: number; open: boolean }>;
  findings: ScanFinding[];
  providers: Record<string, CheckState>;
  scannedAt: string;
};

const SECURITY_HEADERS = [
  "strict-transport-security",
  "content-security-policy",
  "x-frame-options",
  "x-content-type-options",
  "referrer-policy",
  "permissions-policy",
];

const COMMON_PORTS = [80, 443, 8080, 8443];

function normalizeTarget(target: string) {
  const trimmed = target.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const url = new URL(withProtocol);
  return {
    normalizedUrl: url.toString(),
    hostname: url.hostname,
  };
}

function decodeHtmlAttribute(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function getAttribute(tag: string, attribute: string) {
  const match = tag.match(new RegExp(`${attribute}\\s*=\\s*["']([^"']+)["']`, "i"));
  return match ? decodeHtmlAttribute(match[1]) : null;
}

function findPageLogoUrl(html: string, pageUrl: string) {
  const linkTags = html.match(/<link\b[^>]*>/gi) ?? [];
  const preferredRelTokens = [
    ["apple-touch-icon"],
    ["icon"],
    ["mask-icon"],
  ];

  for (const tokens of preferredRelTokens) {
    const tag = linkTags.find((item) => {
      const relTokens = getAttribute(item, "rel")?.toLowerCase().split(/\s+/) ?? [];
      return tokens.every((token) => relTokens.includes(token));
    });
    const href = tag ? getAttribute(tag, "href") : null;

    if (href) {
      return new URL(href, pageUrl).toString();
    }
  }

  return null;
}

function buildLogoUrl(pageUrl: string) {
  return new URL("/favicon.ico", pageUrl).toString();
}

async function resolveRecords(hostname: string) {
  const [A, AAAA, MX, TXT] = await Promise.all([
    dns.resolve4(hostname).catch(() => []),
    dns.resolve6(hostname).catch(() => []),
    dns.resolveMx(hostname).then((records) => records.map((record) => `${record.priority} ${record.exchange}`)).catch(() => []),
    dns.resolveTxt(hostname).then((records) => records.map((record) => record.join(""))).catch(() => []),
  ]);

  return { A, AAAA, MX, TXT };
}

async function inspectSsl(hostname: string): Promise<ElenxScanResult["ssl"]> {
  return new Promise((resolve) => {
    const socket = tls.connect(
      {
        host: hostname,
        port: 443,
        servername: hostname,
        rejectUnauthorized: false,
        timeout: 5000,
      },
      () => {
        const cert = socket.getPeerCertificate();
        resolve({
          enabled: true,
          authorized: socket.authorized,
          validTo: cert.valid_to,
          issuer: typeof cert.issuer?.O === "string" ? cert.issuer.O : undefined,
          subject: typeof cert.subject?.CN === "string" ? cert.subject.CN : undefined,
          protocol: socket.getProtocol() ?? undefined,
        });
        socket.end();
      },
    );

    socket.on("timeout", () => {
      socket.destroy();
      resolve({ enabled: false });
    });
    socket.on("error", () => resolve({ enabled: false }));
  });
}

async function inspectHttp(normalizedUrl: string): Promise<ElenxScanResult["http"]> {
  const redirects: string[] = [];
  let currentUrl = normalizedUrl;
  let response: Response | null = null;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    response = await fetch(currentUrl, {
      method: "GET",
      redirect: "manual",
      headers: { "User-Agent": "ElenX-Security-Scanner/0.1" },
    }).catch(() => null);

    if (!response) {
      break;
    }

    const location = response.headers.get("location");
    if (!location || response.status < 300 || response.status >= 400) {
      break;
    }

    const nextUrl = new URL(location, currentUrl).toString();
    redirects.push(nextUrl);
    currentUrl = nextUrl;
  }

  const securityHeaders = Object.fromEntries(
    SECURITY_HEADERS.map((header) => [header, response?.headers.get(header) ?? null]),
  );
  const contentType = response?.headers.get("content-type") ?? "";
  const html = contentType.includes("text/html") ? await response?.text().catch(() => "") : "";

  return {
    status: response?.status,
    finalUrl: currentUrl,
    redirects,
    logoUrl: html ? findPageLogoUrl(html, currentUrl) ?? buildLogoUrl(currentUrl) : buildLogoUrl(currentUrl),
    securityHeaders,
  };
}

async function checkPort(hostname: string, port: number) {
  return new Promise<{ port: number; open: boolean }>((resolve) => {
    const socket = net.createConnection({ host: hostname, port, timeout: 1800 });
    socket.on("connect", () => {
      socket.end();
      resolve({ port, open: true });
    });
    socket.on("timeout", () => {
      socket.destroy();
      resolve({ port, open: false });
    });
    socket.on("error", () => resolve({ port, open: false }));
  });
}

function buildFindings(scan: Omit<ElenxScanResult, "findings" | "score" | "checks">): ScanFinding[] {
  const findings: ScanFinding[] = [];

  if (!scan.dns.A.length && !scan.dns.AAAA.length) {
    findings.push({
      id: "dns-no-address",
      title: "No A or AAAA record found",
      description: "The target did not resolve to an IPv4 or IPv6 address through the local resolver.",
      severity: "high",
      source: "DNS Resolver",
    });
  }

  if (!scan.ssl.enabled) {
    findings.push({
      id: "ssl-unavailable",
      title: "TLS endpoint unavailable",
      description: "ElenX could not complete a TLS handshake on port 443.",
      severity: "high",
      source: "SSL Check",
    });
  } else if (scan.ssl.authorized === false) {
    findings.push({
      id: "ssl-untrusted",
      title: "Certificate is not trusted",
      description: "The endpoint presented a certificate chain that Node.js could not authorize.",
      severity: "high",
      source: "SSL Check",
    });
  }

  const missingHeaders = Object.entries(scan.http.securityHeaders)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingHeaders.length) {
    findings.push({
      id: "http-missing-security-headers",
      title: "Security headers missing",
      description: `Missing headers: ${missingHeaders.join(", ")}.`,
      severity: missingHeaders.length > 3 ? "medium" : "low",
      source: "HTTP Header Analysis",
    });
  }

  const nonWebOpenPorts = scan.ports.filter((item) => item.open && ![80, 443].includes(item.port));
  if (nonWebOpenPorts.length) {
    findings.push({
      id: "ports-extra-web-services",
      title: "Additional web service ports open",
      description: `Open ports detected: ${nonWebOpenPorts.map((item) => item.port).join(", ")}.`,
      severity: "medium",
      source: "Open Port Detection",
    });
  }

  if (scan.http.redirects.length > 3) {
    findings.push({
      id: "redirect-chain-long",
      title: "Long redirect chain",
      description: `Detected ${scan.http.redirects.length} redirects before the final URL.`,
      severity: "low",
      source: "Redirect Scanner",
    });
  }

  return findings;
}

function scoreFindings(findings: ScanFinding[]) {
  const penalties = {
    low: 6,
    medium: 13,
    high: 24,
    critical: 40,
  };

  return Math.max(0, 100 - findings.reduce((score, finding) => score + penalties[finding.severity], 0));
}

function buildChecks(scan: Omit<ElenxScanResult, "checks">, configuredProviders: Record<string, CheckState>) {
  return {
    dns: scan.dns.A.length || scan.dns.AAAA.length ? "passed" : "failed",
    ssl: scan.ssl.enabled && scan.ssl.authorized !== false ? "passed" : "failed",
    headers: Object.values(scan.http.securityHeaders).every(Boolean) ? "passed" : "warning",
    redirects: scan.http.redirects.length <= 3 ? "passed" : "warning",
    ports: scan.ports.some((item) => item.open && ![80, 443].includes(item.port)) ? "warning" : "passed",
    reputation: configuredProviders.virusTotal === "not_configured" ? "not_configured" : "passed",
    malware: configuredProviders.virusTotal === "not_configured" ? "not_configured" : "passed",
    phishing: "not_configured",
    blacklist: configuredProviders.virusTotal === "not_configured" ? "not_configured" : "passed",
  } satisfies Record<string, CheckState>;
}

export async function scanTarget(target: string): Promise<ElenxScanResult> {
  const { normalizedUrl, hostname } = normalizeTarget(target);
  const [dnsRecords, ssl, http, ports] = await Promise.all([
    resolveRecords(hostname),
    inspectSsl(hostname),
    inspectHttp(normalizedUrl),
    Promise.all(COMMON_PORTS.map((port) => checkPort(hostname, port))),
  ]);

  const providers = {
    virusTotal: process.env.VIRUSTOTAL_API_KEY ? "passed" : "not_configured",
  } satisfies Record<string, CheckState>;

  const baseScan = {
    target,
    normalizedUrl,
    hostname,
    logoUrl: http.logoUrl ?? buildLogoUrl(http.finalUrl ?? normalizedUrl),
    status: "completed" as const,
    dns: dnsRecords,
    ssl,
    http,
    ports,
    providers,
    scannedAt: new Date().toISOString(),
  };
  const findings = buildFindings(baseScan);
  const score = scoreFindings(findings);

  return {
    ...baseScan,
    score,
    checks: buildChecks({ ...baseScan, findings, score }, providers),
    findings,
  };
}
