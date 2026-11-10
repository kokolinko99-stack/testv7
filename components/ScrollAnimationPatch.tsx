"use client";

import { useEffect } from "react";

const STYLE_ID = "thrtysix-viewport-reveal-v9-styles";
const SESSION_KEY = "thrtysix-viewport-reveal-played";
const PENDING_ATTRIBUTE = "data-thrtysix-reveal-pending";
const DONE_ATTRIBUTE = "data-thrtysix-reveal-done";
const ANIMATING_ATTRIBUTE = "data-thrtysix-reveal-animating";

const REVEAL_SELECTORS = [
  "#work > .section-intro > h2",
  "#work .project-card > .project-stage",
  "#work .project-card > .project-copy",
  ".manifesto > h2",
  "#about > .section-intro > h2",
  "#about .about-copy > p",
  "#about .service",
  "#contact .contact-heading-button",
  "#contact .socials a",
  ".site-footer .footer-mark",
  ".site-footer .footer-word",
].join(",");

const patchStyles = `
  /*
   * Disable only the old non-hero scroll transforms that are written inline
   * by PortfolioExperience.tsx. The Hero and header are intentionally untouched.
   */
  .site-shell #work,
  .site-shell #work > .section-intro,
  .site-shell #work .project-card,
  .site-shell .manifesto,
  .site-shell #about,
  .site-shell #about .service,
  .site-shell #contact,
  .site-shell .site-footer {
    transform: none !important;
  }

  .site-shell #work,
  .site-shell #work .project-card,
  .site-shell .manifesto,
  .site-shell #about,
  .site-shell #contact,
  .site-shell .site-footer {
    opacity: 1 !important;
  }

  /*
   * The footer utility row must never be hidden by the reveal system.
   */
  .site-shell .site-footer .footer-bottom,
  .site-shell .site-footer .footer-bottom > *,
  .site-shell .site-footer .footer-bottom a,
  .site-shell .site-footer .footer-bottom button,
  .site-shell .site-footer .footer-bottom strong,
  .site-shell .site-footer .footer-bottom small {
    opacity: 1 !important;
    visibility: visible !important;
    translate: none !important;
    transform: none !important;
  }

  [${PENDING_ATTRIBUTE}="true"] {
    opacity: 0;
    translate: 0 24px;
    will-change: opacity, translate;
  }

  /*
   * PortfolioExperience writes opacity directly onto service cards.
   * These more-specific states keep the whole card hidden before reveal
   * and fully visible after reveal without affecting the active animation.
   */
  .site-shell #about .service[${PENDING_ATTRIBUTE}="true"] {
    opacity: 0 !important;
  }

  [${DONE_ATTRIBUTE}="true"] {
    opacity: 1;
    translate: none;
    will-change: auto;
  }

  .site-shell #about .service[${DONE_ATTRIBUTE}="true"] {
    opacity: 1 !important;
  }

  /*
   * Keep the manifesto mouth in its original soft-gray watermark state.
   * Older reveal components add classes with opacity: 1 !important, so this
   * deliberately uses stronger selectors and prevents the solid-black result.
   */
  .site-shell .manifesto .manifesto-object.manifesto-mouth,
  .site-shell.thrtysix-direct-reveal-mode
    .manifesto .manifesto-object.manifesto-mouth.thrtysix-direct-reveal-item,
  .site-shell.thrtysix-native-reveal-active
    .manifesto .manifesto-object.manifesto-mouth.thrtysix-native-reveal-item {
    opacity: .075 !important;
    translate: none !important;
    filter: none !important;
    transition: none !important;
    will-change: auto !important;
  }

  .site-shell .manifesto .manifesto-object.manifesto-mouth img {
    filter: brightness(0) !important;
  }

  @media (max-width: 700px) {
    [${PENDING_ATTRIBUTE}="true"] {
      translate: 0 18px;
    }
  }
`;

function getRevealDelay(element: HTMLElement): number {
  const card = element.closest<HTMLElement>(".project-card");
  if (card) {
    const cards = Array.from(
      document.querySelectorAll<HTMLElement>("#work .project-card"),
    );
    return Math.min(cards.indexOf(card) * 55, 165);
  }

  const service = element.closest<HTMLElement>(".service");
  if (service) {
    const services = Array.from(
      document.querySelectorAll<HTMLElement>("#about .service"),
    );
    return Math.min(services.indexOf(service) * 70, 280);
  }

  if (element.matches("#contact .socials a")) {
    const links = Array.from(
      document.querySelectorAll<HTMLElement>("#contact .socials a"),
    );
    return Math.min(links.indexOf(element) * 70, 140);
  }

  return 0;
}

export default function ScrollAnimationPatch() {
  useEffect(() => {
    let cancelled = false;
    let setupFrame = 0;
    let retryTimer = 0;
    let loaderObserver: MutationObserver | null = null;
    let intersectionObserver: IntersectionObserver | null = null;
    const animations = new Set<Animation>();
    const preparedElements = new Set<HTMLElement>();

    const hasPlayedThisSession = () => {
      try {
        return window.sessionStorage.getItem(SESSION_KEY) === "true";
      } catch {
        return false;
      }
    };

    const markPlayedThisSession = () => {
      try {
        window.sessionStorage.setItem(SESSION_KEY, "true");
      } catch {
        // Continue normally when storage is unavailable.
      }
    };

    /*
     * Save only when the current document is leaving. This makes reloads skip
     * the reveals without cancelling the animations during the first visit.
     */
    const saveBeforeLeaving = () => {
      markPlayedThisSession();
    };

    window.addEventListener("pagehide", saveBeforeLeaving);
    window.addEventListener("beforeunload", saveBeforeLeaving);

    const restoreManifestoMouth = () => {
      const mouth = document.querySelector<HTMLElement>(
        ".manifesto .manifesto-object.manifesto-mouth",
      );

      if (!mouth) return;

      mouth.getAnimations().forEach((animation) => animation.cancel());
      mouth.classList.remove(
        "thrtysix-direct-reveal-item",
        "is-thrtysix-direct-reveal-visible",
        "thrtysix-native-reveal-item",
        "is-thrtysix-native-reveal-visible",
      );
      mouth.removeAttribute(PENDING_ATTRIBUTE);
      mouth.removeAttribute(DONE_ATTRIBUTE);
      mouth.removeAttribute(ANIMATING_ATTRIBUTE);
      mouth.style.removeProperty("opacity");
      mouth.style.removeProperty("translate");
      mouth.style.removeProperty("filter");
      mouth.style.removeProperty("transition");
      mouth.style.removeProperty("will-change");
      mouth.style.removeProperty("--thrtysix-direct-reveal-delay");
      mouth.style.removeProperty("--thrtysix-native-reveal-delay");
    };

    const collectTargets = () =>
      Array.from(
        document.querySelectorAll<HTMLElement>(REVEAL_SELECTORS),
      ).filter(
        (element) =>
          !element.closest(".hero") &&
          !element.closest(".site-header") &&
          !element.closest(".mobile-menu") &&
          !element.closest(".project-modal") &&
          !element.closest(".footer-bottom"),
      );

    const showImmediately = () => {
      if (cancelled) return;

      const targets = collectTargets();

      if (!targets.length) {
        retryTimer = window.setTimeout(showImmediately, 80);
        return;
      }

      markPlayedThisSession();

      targets.forEach((element) => {
        preparedElements.add(element);
        element.removeAttribute(PENDING_ATTRIBUTE);
        element.removeAttribute(ANIMATING_ATTRIBUTE);
        element.setAttribute(DONE_ATTRIBUTE, "true");
        element.style.opacity = "1";
        element.style.translate = "none";
        element.style.willChange = "auto";
      });
    };

    const reveal = (element: HTMLElement) => {
      if (
        cancelled ||
        element.getAttribute(DONE_ATTRIBUTE) === "true" ||
        element.getAttribute(ANIMATING_ATTRIBUTE) === "true"
      ) {
        return;
      }

      intersectionObserver?.unobserve(element);
      element.removeAttribute(PENDING_ATTRIBUTE);
      element.setAttribute(ANIMATING_ATTRIBUTE, "true");

      const delay = getRevealDelay(element);
      const startDistance =
        window.matchMedia("(max-width: 700px)").matches ? "18px" : "24px";

      const animation = element.animate(
        [
          {
            opacity: 0,
            translate: `0 ${startDistance}`,
          },
          {
            opacity: 1,
            translate: "0 0",
          },
        ],
        {
          duration: 820,
          delay,
          easing: "cubic-bezier(0.16, 0.84, 0.20, 1)",
          fill: "both",
        },
      );

      animations.add(animation);

      const finish = () => {
        animations.delete(animation);
        element.removeAttribute(ANIMATING_ATTRIBUTE);
        element.setAttribute(DONE_ATTRIBUTE, "true");
        element.style.opacity = "1";
        element.style.translate = "none";
        element.style.willChange = "auto";
        animation.cancel();
      };

      animation.addEventListener("finish", finish, { once: true });
      animation.addEventListener(
        "cancel",
        () => {
          animations.delete(animation);
          element.removeAttribute(ANIMATING_ATTRIBUTE);
        },
        { once: true },
      );
    };

    const prepareAndObserve = () => {
      if (cancelled) return;

      const targets = collectTargets();

      if (!targets.length) {
        retryTimer = window.setTimeout(prepareAndObserve, 80);
        return;
      }

      targets.forEach((element) => {
        preparedElements.add(element);
        element.removeAttribute(DONE_ATTRIBUTE);
        element.setAttribute(PENDING_ATTRIBUTE, "true");
        element.style.opacity = "";
        element.style.translate = "";
        element.style.willChange = "";
      });

      /*
       * Force the browser to paint the hidden state before any reveal starts.
       * This prevents the previous jump-cut behavior.
       */
      void document.documentElement.offsetHeight;

      intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const element = entry.target as HTMLElement;
            const rect = element.getBoundingClientRect();
            const viewportHeight = Math.max(window.innerHeight, 1);
            const visibleHeight =
              Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
            const requiredHeight = Math.min(
              Math.max(rect.height * 0.48, 1),
              viewportHeight * 0.46,
            );

            if (visibleHeight >= requiredHeight) {
              reveal(element);
            }
          });
        },
        {
          threshold: [0, 0.2, 0.35, 0.48, 0.65],
          rootMargin: "0px 0px -7% 0px",
        },
      );

      /*
       * Two frames guarantee that the pending style has been rendered before
       * already-visible elements receive their reveal animation.
       */
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          if (cancelled) return;
          targets.forEach((element) => intersectionObserver?.observe(element));
        });
      });
    };

    const install = () => {
      if (cancelled) return;

      const shell = document.querySelector<HTMLElement>(".site-shell");
      if (!shell) {
        setupFrame = window.requestAnimationFrame(install);
        return;
      }

      restoreManifestoMouth();

      let styleNode = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
      if (!styleNode) {
        styleNode = document.createElement("style");
        styleNode.id = STYLE_ID;
        styleNode.textContent = patchStyles;
        document.head.appendChild(styleNode);
      }

      if (hasPlayedThisSession()) {
        showImmediately();
        return;
      }

      const beginAfterLoader = () => {
        if (cancelled) return;

        const loader = document.querySelector(".site-loader");
        if (!loader) {
          loaderObserver?.disconnect();
          loaderObserver = null;
          prepareAndObserve();
          return;
        }

        loaderObserver = new MutationObserver(() => {
          if (!document.querySelector(".site-loader")) {
            loaderObserver?.disconnect();
            loaderObserver = null;
            prepareAndObserve();
          }
        });

        loaderObserver.observe(document.body, {
          childList: true,
          subtree: true,
        });
      };

      beginAfterLoader();
    };

    setupFrame = window.requestAnimationFrame(install);

    return () => {
      cancelled = true;

      if (setupFrame) window.cancelAnimationFrame(setupFrame);
      if (retryTimer) window.clearTimeout(retryTimer);

      window.removeEventListener("pagehide", saveBeforeLeaving);
      window.removeEventListener("beforeunload", saveBeforeLeaving);

      loaderObserver?.disconnect();
      intersectionObserver?.disconnect();

      animations.forEach((animation) => animation.cancel());
      animations.clear();

      preparedElements.forEach((element) => {
        element.removeAttribute(PENDING_ATTRIBUTE);
        element.removeAttribute(DONE_ATTRIBUTE);
        element.removeAttribute(ANIMATING_ATTRIBUTE);
        element.style.removeProperty("opacity");
        element.style.removeProperty("translate");
        element.style.removeProperty("will-change");
      });

      document.getElementById(STYLE_ID)?.remove();
    };
  }, []);

  return null;
}
