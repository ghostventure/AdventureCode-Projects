import "./globals.css";
import AppShell from "./components/AppShell";

const themeBootScript = `
(function () {
  try {
    var key = "sample-demo-theme";
    var stored = window.localStorage.getItem(key);
    var theme = stored === "day" || stored === "night"
      ? stored
      : window.matchMedia("(prefers-color-scheme: dark)").matches ? "night" : "day";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme === "night" ? "dark" : "light";
  } catch (error) {
    document.documentElement.dataset.theme = "day";
  }
})();
`;

export const metadata = {
  metadataBase: new URL("https://sample-demo-website-2026.web.app"),
  title: "Home Services Portal",
  description: "A reusable home services marketplace template for repairs, installs, maintenance, and handyman-style requests.",
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    title: "Home Services Portal",
    description: "A reusable home services marketplace template for repairs, installs, maintenance, and handyman-style requests.",
    url: "https://sample-demo-website-2026.web.app",
    siteName: "Home Services Portal",
    type: "website"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="day" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
