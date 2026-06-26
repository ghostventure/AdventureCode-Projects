function getKbBaseUrl() {
  return String(import.meta.env.VITE_EXCELJET_KB_URL || "").trim();
}

function getKbApiKey() {
  return String(import.meta.env.VITE_EXCELJET_KB_KEY || "").trim();
}

export async function fetchExcelJetContext(query) {
  const baseUrl = getKbBaseUrl();
  if (!baseUrl) return null;

  const endpoint = new URL(baseUrl);
  endpoint.searchParams.set("q", String(query || "").slice(0, 400));
  endpoint.searchParams.set("limit", "6");

  const headers = { "Content-Type": "application/json" };
  const apiKey = getKbApiKey();
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

  try {
    const response = await fetch(endpoint.toString(), { headers });
    if (!response.ok) return null;
    const data = await response.json();
    return {
      source: "exceljet_kb",
      entries: Array.isArray(data?.entries) ? data.entries.slice(0, 6) : [],
      tags: Array.isArray(data?.tags) ? data.tags.slice(0, 10) : []
    };
  } catch {
    return null;
  }
}
