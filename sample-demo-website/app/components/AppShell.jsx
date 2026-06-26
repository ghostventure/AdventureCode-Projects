import TopNav from "./TopNav";
import OfflineBanner from "./OfflineBanner";
import GlobalNonstickFooter from "./GlobalNonstickFooter";
import { GlobalBrollStrip } from "./HomeServiceBroll";
import { SessionProvider } from "./SessionProvider";
import RouteAccessGate from "./RouteAccessGate";

export default function AppShell({ children }) {
  return (
    <SessionProvider>
      <div className="app-shell">
        <a className="skip-link" href="#main-content">Skip to content</a>
        <div className="demo-presentation-banner">
          This is a demo presentation website hosted by Black Lion Studios.
        </div>
        <OfflineBanner />
        <TopNav />
        <div className="app-content" id="main-content">
          <RouteAccessGate>{children}</RouteAccessGate>
        </div>
        <GlobalBrollStrip />
        <GlobalNonstickFooter />
      </div>
    </SessionProvider>
  );
}
