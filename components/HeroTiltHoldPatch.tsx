"use client";

import { useEffect } from "react";

const CENTERED_TILT =
  /rotateX\(\s*-?0(?:\.0+)?deg\).*rotateY\(\s*-?0(?:\.0+)?deg\)/;

const REVEAL_STYLE_ID = "thrtysix-native-viewport-reveal-styles";
const REVEAL_ROOT_CLASS = "thrtysix-native-reveal-active";
const REVEAL_ITEM_CLASS = "thrtysix-native-reveal-item";
const REVEAL_VISIBLE_CLASS = "is-thrtysix-native-reveal-visible";

const revealStyles = `
  /*
   * PortfolioExperience writes continuous transform/opacity values while the
   * page scrolls. Neutralize only those non-Hero values so the reveal can own
   * the entrance animation. The fixed header and Hero are not targeted.
   */
  .site-shell.${REVEAL_ROOT_CLASS} .work,
  .site-shell.${REVEAL_ROOT_CLASS} .work .section-intro,
  .site-shell.${REVEAL_ROOT_CLASS} .project-card,
  .site-shell.${REVEAL_ROOT_CLASS} .manifesto,
  .site-shell.${REVEAL_ROOT_CLASS} .about,
  .site-shell.${REVEAL_ROOT_CLASS} .service,
  .site-shell.${REVEAL_ROOT_CLASS} .contact,
  .site-shell.${REVEAL_ROOT_CLASS} .site-footer {
    transform: none !important;
    opacity: 1 !important;
  }

  /*
   * Use the individual translate property, not transform. This preserves the
   * project thumbnail tilt, manifesto artwork rotation and hover animations.
   */
  .site-shell.${REVEAL_ROOT_CLASS} .${REVEAL_ITEM_CLASS} {
    opacity: 0 !important;
    translate: 0 22px;
    transition:
      opacity 680ms cubic-bezier(.16, .84, .2, 1),
      translate 760ms cubic-bezier(.16, .84, .2, 1) !important;
    transition-delay: var(--thrtysix-native-reveal-delay, 0ms) !important;
    will-change: opacity, translate;
  }

  .site-shell.${REVEAL_ROOT_CLASS}
    .${REVEAL_ITEM_CLASS}.${REVEAL_VISIBLE_CLASS} {
    opacity: var(--thrtysix-native-final-opacity, 1) !important;
    translate: 0 0;
  }

  @media (max-width: 700px) {
    .site-shell.${REVEAL_ROOT_CLASS} .${REVEAL_ITEM_CLASS} {
      translate: 0 16px;
      transition-duration: 600ms, 680ms !important;
    }
  }

  /* Keep a small, accessible entrance rather than cancelling it completely. */
  @media (prefers-reduced-motion: reduce) {
    .site-shell.${REVEAL_ROOT_CLASS} .${REVEAL_ITEM_CLASS} {
      translate: 0 6px;
      transition-duration: 240ms, 240ms !important;
    }
  }
`;

type RevealGroup = {
  selector: string;
  delay?: number;
  step?: number;
};

/* The Hero, header, menus and project overlays are deliberately excluded. */
const REVEAL_GROUPS: RevealGroup[] = [
  { selector: "#work > .section-intro" },
  { selector: "#work .project-card", step: 70 },
  { selector: ".manifesto > .manifesto-object, .manifesto > h2", step: 110 },
  { selector: "#about > .about-intro, #about .about-copy", step: 100 },
  { selector: "#about .service", step: 65 },
  { selector: "#contact .contact-heading-button" },
  { selector: "#contact .social-secondary a", delay: 80, step: 70 },
  { selector: ".site-footer > .footer-mark, .site-footer > .footer-word", step: 100 },
  {
    selector: ".site-footer > .footer-bottom > span, .site-footer > .footer-bottom > div",
    delay: 80,
    step: 90,
  },
];

/**
 * Keeps the hero object's most recent mouse-driven rotation when the pointer
 * leaves the hero or browser window. The existing EntityCanvas interaction is
 * left untouched; this component only prevents its leave reset from sticking.
 */
export default function HeroTiltHoldPatch() {
  useEffect(() => {
    let cancelled = false;
    let setupFrame = 0;
    let dispose: (() => void) | undefined;

    const setup = () => {
      if (cancelled) return;
      const hero = document.querySelector<HTMLElement>(".hero");
      const logo = hero?.querySelector<HTMLImageElement>(
        'img[src*="human-logo.png"]',
      );

      if (!hero || !logo) {
        setupFrame = window.requestAnimationFrame(setup);
        return;
      }

      let pointerInside = hero.matches(":hover");
      let lastTransform = logo.style.transform;
      let restoring = false;
      const isCentered = (transform: string) => CENTERED_TILT.test(transform);

      const handlePointerMove = (event: PointerEvent) => {
        if (event.pointerType && event.pointerType !== "mouse") return;
        pointerInside = true;
      };

      const handlePointerLeave = () => {
        pointerInside = false;
      };

      const observer = new MutationObserver(() => {
        const currentTransform = logo.style.transform;
        if (!currentTransform || restoring) return;
        if (pointerInside) {
          lastTransform = currentTransform;
          return;
        }

        if (!isCentered(currentTransform)) {
          lastTransform = currentTransform;
          return;
        }
        if (
          lastTransform &&
          !isCentered(lastTransform) &&
          currentTransform !== lastTransform
        ) {
          restoring = true;
          logo.style.transform = lastTransform;
          queueMicrotask(() => {
            restoring = false;
          });
        }
      });

      observer.observe(logo, {
        attributes: true,
        attributeFilter: ["style"],
      });
      hero.addEventListener("pointermove", handlePointerMove, { passive: true });
      hero.addEventListener("pointerleave", handlePointerLeave, { passive: true });
      hero.addEventListener("pointercancel", handlePointerLeave, { passive: true });
      dispose = () => {
        observer.disconnect();
        hero.removeEventListener("pointermove", handlePointerMove);
        hero.removeEventListener("pointerleave", handlePointerLeave);
        hero.removeEventListener("pointercancel", handlePointerLeave);
      };
    };

    setup();

    return () => {
      cancelled = true;
      if (setupFrame) window.cancelAnimationFrame(setupFrame);
      dispose?.();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let setupFrame = 0;
    let checkFrame = 0;
    let fallbackTimer = 0;
    let shellObserver: MutationObserver | null = null;
    let styleNode: HTMLStyleElement | null = null;
    let createdStyle = false;
    let started = false;
    const prepared = new Set<HTMLElement>();

    const setupReveal = () => {
      if (cancelled) return;

      const shell = document.querySelector<HTMLElement>(".site-shell");
      const work = document.getElementById("work");
      const about = document.getElementById("about");
      const contact = document.getElementById("contact");

      if (!shell || !work || !about || !contact) {
        setupFrame = window.requestAnimationFrame(setupReveal);
        return;
      }

      styleNode = document.getElementById(
        REVEAL_STYLE_ID,
      ) as HTMLStyleElement | null;
      if (!styleNode) {
        styleNode = document.createElement("style");
        styleNode.id = REVEAL_STYLE_ID;
        styleNode.textContent = revealStyles;
        document.head.appendChild(styleNode);
        createdStyle = true;
      }

      shell.classList.add(REVEAL_ROOT_CLASS);
      shell.dataset.viewportReveal = "active";

      REVEAL_GROUPS.forEach(({ selector, delay = 0, step = 0 }) => {
        const elements = Array.from(
          shell.querySelectorAll<HTMLElement>(selector),
        ).filter(
          (element) =>
            !element.closest(".hero") &&
            !element.closest(".site-header") &&
            !element.closest(".mobile-menu") &&
            !element.closest(".project-modal") &&
            !element.closest(".project-image-lightbox"),
        );

        elements.forEach((element, index) => {
          /* Read the intended final opacity before applying the hidden class. */
          const finalOpacity = window.getComputedStyle(element).opacity || "1";
          element.style.setProperty(
            "--thrtysix-native-final-opacity",
            finalOpacity,
          );
          element.style.setProperty(
            "--thrtysix-native-reveal-delay",
            `${Math.min(delay + index * step, 320)}ms`,
          );
          element.classList.remove(REVEAL_VISIBLE_CLASS);
          element.classList.add(REVEAL_ITEM_CLASS);
          prepared.add(element);
        });
      });

      const revealElement = (element: HTMLElement) => {
        if (!prepared.has(element)) return;
        element.classList.add(REVEAL_VISIBLE_CLASS);
        prepared.delete(element);
      };

      const checkViewport = () => {
        checkFrame = 0;
        if (cancelled || !started || prepared.size === 0) return;

        const viewportHeight = Math.max(window.innerHeight, 1);

        prepared.forEach((element) => {
          if (!element.isConnected) {
            prepared.delete(element);
            return;
          }

          const rect = element.getBoundingClientRect();
          const visibleTop = Math.max(rect.top, 0);
          const visibleBottom = Math.min(rect.bottom, viewportHeight);
          const visibleHeight = Math.max(0, visibleBottom - visibleTop);
          const elementHeight = Math.max(rect.height, 1);
          const visibleRatio = visibleHeight / elementHeight;
          const isTall = elementHeight > viewportHeight * 0.82;

          /*
           * Normal elements wait until almost their full shape is visible.
           * Taller cards use a 72% fallback because they cannot physically fit
           * inside some laptop/mobile viewports.
           */
          const fullyInsideViewport =
            rect.top >= viewportHeight * 0.04 &&
            rect.bottom <= viewportHeight * 0.96;
          const tallElementIsReady =
            isTall &&
            visibleHeight >= Math.min(elementHeight * 0.72, viewportHeight * 0.72);
          const fastScrollFallback =
            rect.top < viewportHeight * 0.22 && visibleRatio >= 0.72;

          if (
            rect.bottom > 0 &&
            (fullyInsideViewport || tallElementIsReady || fastScrollFallback)
          ) {
            revealElement(element);
          }
        });
      };

      const requestCheck = () => {
        if (!checkFrame) {
          checkFrame = window.requestAnimationFrame(checkViewport);
        }
      };

      const startReveal = () => {
        if (started || cancelled) return;
        started = true;

        /* Guarantee one painted hidden frame before revealing visible items. */
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            if (cancelled) return;
            checkViewport();
            window.addEventListener("scroll", requestCheck, { passive: true });
            window.addEventListener("resize", requestCheck, { passive: true });
          });
        });
      };

      if (shell.classList.contains("is-entered")) {
        startReveal();
      } else {
        shellObserver = new MutationObserver(() => {
          if (!shell.classList.contains("is-entered")) return;
          shellObserver?.disconnect();
          shellObserver = null;
          startReveal();
        });
        shellObserver.observe(shell, {
          attributes: true,
          attributeFilter: ["class"],
        });

        fallbackTimer = window.setTimeout(startReveal, 2800);
      }

      return () => {
        window.removeEventListener("scroll", requestCheck);
        window.removeEventListener("resize", requestCheck);
      };
    };

    const removeListeners = setupReveal();

    return () => {
      cancelled = true;
      if (setupFrame) window.cancelAnimationFrame(setupFrame);
      if (checkFrame) window.cancelAnimationFrame(checkFrame);
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
      shellObserver?.disconnect();
      removeListeners?.();

      const shell = document.querySelector<HTMLElement>(".site-shell");
      shell?.classList.remove(REVEAL_ROOT_CLASS);
      if (shell) delete shell.dataset.viewportReveal;

      document
        .querySelectorAll<HTMLElement>(`.${REVEAL_ITEM_CLASS}`)
        .forEach((element) => {
          element.classList.remove(REVEAL_ITEM_CLASS, REVEAL_VISIBLE_CLASS);
          element.style.removeProperty("--thrtysix-native-final-opacity");
          element.style.removeProperty("--thrtysix-native-reveal-delay");
        });

      if (createdStyle) styleNode?.remove();
    };
  }, []);

  return null;
}
