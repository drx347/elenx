export async function lookupVirusTotal(target: string) {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;

  if (apiKey) {
    const response = await fetch("https://www.virustotal.com/api/v3/urls", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "x-apikey": apiKey,
      },
      body: new URLSearchParams({ url: target }),
    });

    return response.json();
  }

  return {
    provider: "VirusTotal",
    target,
    available: false,
  };
}
