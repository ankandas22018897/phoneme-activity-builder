"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function TelemetryTracker() {
  const pathname = usePathname();
  const startTimeRef = useRef(0);

  useEffect(() => {
    startTimeRef.current = Date.now();

    return () => {
      const durationSeconds = (Date.now() - startTimeRef.current) / 1000;
      if (durationSeconds > 1.5) {
        const payload = JSON.stringify({
          type: "session",
          pagePath: pathname,
          durationSeconds,
          deviceType: window.innerWidth < 768 ? "mobile" : window.innerWidth < 1024 ? "tablet" : "desktop",
        });

        if (navigator.sendBeacon) {
          navigator.sendBeacon("/api/telemetry", new Blob([payload], { type: "application/json" }));
        } else {
          fetch("/api/telemetry", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload,
            keepalive: true,
          }).catch(() => {});
        }
      }
    };
  }, [pathname]);

  return null;
}
