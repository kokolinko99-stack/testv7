"use client";

import Script from "next/script";

declare global {
  interface Window {
    va?: (command: "event", payload: { name: string; data?: Record<string, string | number | boolean> }) => void;
  }
}

export function trackEvent(name: string, data?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined") return;
  window.va?.("event", { name, data });
}

export default function Analytics() {
  return <Script src="/_vercel/insights/script.js" strategy="afterInteractive" />;
}
