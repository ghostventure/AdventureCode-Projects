export default function sitemap() {
  const baseUrl = "https://sample-demo-website-2026.web.app";
  const routes = [
    "",
    "/auth",
    "/client",
    "/users",
    "/operations",
    "/operations-quality",
    "/data-workflow",
    "/communication",
    "/manager",
    "/admin",
    "/security",
    "/platform",
    "/health",
    "/privacy",
    "/terms",
    "/data-request",
    "/maintenance"
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7
  }));
}
