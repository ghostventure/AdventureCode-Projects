export const metadata = {
  title: "EstateHat",
  description: "EstateHat verified peer-to-peer real estate platform across web, mobile, and desktop.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/estatehat-icon.svg"
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f6f7f5"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TWW3MG8S');`
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { try { const storedTheme = localStorage.getItem('estatehat-theme'); const legacyDark = localStorage.getItem('estatehat-dark') === 'true'; const theme = storedTheme || (legacyDark ? 'dark' : 'light'); document.documentElement.dataset.estatehatTheme = theme; document.documentElement.classList.toggle('dark', theme !== 'light'); } catch {} })();`
          }}
        />
      </head>
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TWW3MG8S"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
