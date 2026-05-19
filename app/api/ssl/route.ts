import { NextResponse } from "next/server";
import tls from "node:tls";

export const runtime = "nodejs";

function inspectSsl(domain: string) {
  return new Promise((resolve) => {
    const socket = tls.connect({ host: domain, port: 443, servername: domain, rejectUnauthorized: false, timeout: 5000 }, () => {
      const cert = socket.getPeerCertificate();
      resolve({
        domain,
        enabled: true,
        authorized: socket.authorized,
        protocol: socket.getProtocol(),
        validTo: cert.valid_to,
        issuer: cert.issuer,
        subject: cert.subject,
      });
      socket.end();
    });

    socket.on("timeout", () => {
      socket.destroy();
      resolve({ domain, enabled: false });
    });
    socket.on("error", () => resolve({ domain, enabled: false }));
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get("domain");

  if (!domain) {
    return NextResponse.json({ error: "domain query is required." }, { status: 400 });
  }

  return NextResponse.json(await inspectSsl(domain));
}
