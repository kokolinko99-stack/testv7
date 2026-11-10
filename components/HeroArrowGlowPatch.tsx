"use client";

import { useEffect } from "react";

const STYLE_ID = "thrtysix-hero-arrow-glow-pulse-styles";

const styles = `
  .hero-scroll-attractor-arrows {
    color: var(--green, #00ff80) !important;
  }

  .hero-scroll-attractor-arrow {
    color: var(--green, #00ff80) !important;
    border-color: currentColor !important;
    border-width: 2px !important;
    animation: thrtysixHeroArrowGlowPulse 1.45s ease-in-out infinite !important;
    will-change: filter, scale;
  }

  .hero-scroll-attractor-arrow:nth-child(2) {
    animation-delay: 180ms !important;
  }

  @keyframes thrtysixHeroArrowGlowPulse {
    0%, 100% {
      scale: .92;
      filter:
        drop-shadow(0 0 1px rgba(0, 255, 128, .45))
        drop-shadow(0 0 4px rgba(0, 255, 128, .18));
    }
    45% {
      scale: 1.14;
      filter:
        drop-shadow(0 0 4px rgba(0, 255, 128, 1))
        drop-shadow(0 0 10px rgba(0, 255, 128, .92))
        drop-shadow(0 0 20px rgba(0, 255, 128, .55));
    }
    70% {
      scale: 1;
      filter:
        drop-shadow(0 0 3px rgba(0, 255, 128, .82))
        drop-shadow(0 0 8px rgba(0, 255, 128, .48));
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .hero-scroll-attractor-arrow {
      animation-duration: 2.2s !important;
    }
  }
`;

/** Adds a visible green glow pulse to the two arrows created by HeroScrollCuePatch. */
export default function HeroArrowGlowPatch() {
  useEffect(() => {
    let styleNode = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
    let createdStyle = false;

    if (!styleNode) {
      styleNode = document.createElement("style");
      styleNode.id = STYLE_ID;
      styleNode.textContent = styles;
      document.head.appendChild(styleNode);
      createdStyle = true;
    }

    return () => {
      if (createdStyle) styleNode?.remove();
    };
  }, []);

  return null;
}
