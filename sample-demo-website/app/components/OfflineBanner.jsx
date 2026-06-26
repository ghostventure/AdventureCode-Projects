"use client";

import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const updateStatus = () => setIsOffline(!navigator.onLine);
    updateStatus();
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="offline-banner" role="status">
      <WifiOff size={16} aria-hidden="true" />
      <span>Connection lost. Changes should wait until the browser is online.</span>
    </div>
  );
}
