export async function lookupGoogleSafeBrowsing(target: string) {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;

  if (apiKey) {
    const response = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client: { clientId: "elenx", clientVersion: "0.1.0" },
        threatInfo: {
          threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: [{ url: target }],
        },
      }),
    });

    return response.json();
  }

  return {
    provider: "Google Safe Browsing",
    target,
    available: false,
  };
}
