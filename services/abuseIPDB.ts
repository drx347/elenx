export async function lookupAbuseIPDB(ipAddress: string) {
  const apiKey = process.env.ABUSEIPDB_API_KEY;

  if (apiKey) {
    const response = await fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${encodeURIComponent(ipAddress)}&maxAgeInDays=90`, {
      headers: {
        Accept: "application/json",
        Key: apiKey,
      },
    });

    return response.json();
  }

  return {
    provider: "AbuseIPDB",
    ipAddress,
    available: false,
  };
}
