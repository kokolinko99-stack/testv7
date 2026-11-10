"use client";

import { useEffect } from "react";
import { smoothScrollTo } from "./SmoothScroll";

const CUE_ID = "thrtysix-hero-scroll-cue";
const STYLE_ID = "thrtysix-direct-viewport-reveal-styles";
const ROOT_CLASS = "thrtysix-direct-reveal-mode";
const REVEAL_CLASS = "thrtysix-direct-reveal-item";
const VISIBLE_CLASS = "is-thrtysix-direct-reveal-visible";

const styles = `
  /* Stop the old continuous transforms outside the Hero. */
  .site-shell.${ROOT_CLASS} .work,
  .site-shell.${ROOT_CLASS} .work .section-intro,
  .site-shell.${ROOT_CLASS} .project-card,
  .site-shell.${ROOT_CLASS} .manifesto,
  .site-shell.${ROOT_CLASS} .about,
  .site-shell.${ROOT_CLASS} .service,
  .site-shell.${ROOT_CLASS} .contact,
  .site-shell.${ROOT_CLASS} .site-footer {
    transform: none !important;
    opacity: 1 !important;
  }

  /* Independent translate keeps card tilt and child hover effects intact. */
  .site-shell.${ROOT_CLASS} .${REVEAL_CLASS} {
    opacity: 0 !important;
    translate: 0 34px;
    filter: blur(3px);
    transition:
      opacity 720ms cubic-bezier(.16, .84, .2, 1),
      translate 820ms cubic-bezier(.16, .84, .2, 1),
      filter 620ms ease !important;
    transition-delay: var(--thrtysix-direct-reveal-delay, 0ms) !important;
    will-change: opacity, translate, filter;
  }

  .site-shell.${ROOT_CLASS} .${REVEAL_CLASS}.${VISIBLE_CLASS} {
    opacity: 1 !important;
    translate: 0 0;
    filter: blur(0);
  }

  .site-shell.${ROOT_CLASS} .project-card.${REVEAL_CLASS} {
    translate: 0 42px;
  }

  .site-shell.${ROOT_CLASS} .project-card.${REVEAL_CLASS}.${VISIBLE_CLASS} {
    translate: 0 0;
  }

  .site-shell.${ROOT_CLASS} .service.${REVEAL_CLASS},
  .site-shell.${ROOT_CLASS} .social-secondary a.${REVEAL_CLASS} {
    translate: 0 24px;
  }

  .site-shell.${ROOT_CLASS} .service.${REVEAL_CLASS}.${VISIBLE_CLASS},
  .site-shell.${ROOT_CLASS} .social-secondary a.${REVEAL_CLASS}.${VISIBLE_CLASS} {
    translate: 0 0;
  }

  .hero-scroll-attractor {
    position: absolute;
    z-index: 12;
    left: 50%;
    bottom: clamp(18px, 2.2vw, 32px);
    display: grid;
    justify-items: center;
    gap: 7px;
    min-width: 78px;
    padding: 0;
    border: 0;
    background: transparent;
    color: rgba(241, 240, 233, .78);
    cursor: pointer;
    opacity: 0;
    transform: translate3d(-50%, 18px, 0);
    filter: blur(6px);
    transition:
      opacity 700ms cubic-bezier(.16, .84, .2, 1),
      transform 700ms cubic-bezier(.16, .84, .2, 1),
      filter 650ms ease,
      color 220ms ease;
  }

  .hero-scroll-attractor.is-visible {
    opacity: 1;
    transform: translate3d(-50%, 0, 0);
    filter: blur(0);
  }

  .hero-scroll-attractor-label {
    font-size: 10px;
    line-height: 1;
    letter-spacing: .22em;
    text-indent: .22em;
    white-space: nowrap;
    opacity: .72;
  }

  .hero-scroll-attractor-arrows {
    position: relative;
    display: block;
    width: 24px;
    height: 30px;
    color: currentColor;
  }

  .hero-scroll-attractor-arrow {
    position: absolute;
    left: 50%;
    width: 11px;
    height: 11px;
    border-right: 1.7px solid currentColor;
    border-bottom: 1.7px solid currentColor;
    transform: translate3d(-50%, 0, 0) rotate(45deg);
    opacity: .2;
  }

  .hero-scroll-attractor-arrow:first-child { top: 0; }
  .hero-scroll-attractor-arrow:last-child { top: 10px; }

  .hero-scroll-attractor:hover,
  .hero-scroll-attractor:focus-visible {
    color: var(--green, #14a234);
  }

  .hero-scroll-attractor:focus-visible {
    outline: 1px solid currentColor;
    outline-offset: 8px;
  }

  @media (max-width: 700px) {
    .site-shell.${ROOT_CLASS} .${REVEAL_CLASS} {
      translate: 0 26px;
      filter: blur(2px);
      transition-duration: 620ms, 720ms, 520ms !important;
    }

    .site-shell.${ROOT_CLASS} .${REVEAL_CLASS}.${VISIBLE_CLASS} {
      translate: 0 0;
    }

    .hero-scroll-attractor {
      bottom: 18px;
    }
  }
`;

type RevealGroup = {
  selector: string;
  base?: number;
  step?: number;
};

/* Hero and header are intentionally excluded. */
const revealGroups: RevealGroup[] = [
  { selector: ".work .section-intro" },
  { selector: ".work .project-card", step: 75 },
  { selector: ".manifesto .manifesto-object, .manifesto h2", step: 110 },
  { selector: ".about .about-intro, .about .about-copy", step: 100 },
  { selector: ".about .service", step: 65 },
  { selector: ".contact .contact-heading-button" },
  { selector: ".contact .social-secondary a", base: 70, step: 70 },
  { selector: ".site-footer .footer-mark, .site-footer .footer-word", step: 100 },
  {
    selector: ".site-footer .footer-bottom > span, .site-footer .footer-bottom > div",
    base: 70,
    step: 90,
  },
];

export default function HeroScrollCuePatch() {
  useEffect(() => {
    let cancelled = false;
    let setupFrame = 0;
    let revealFrame = 0;
    let loaderObserver: MutationObserver | undefined;
    let styleNode: HTMLStyleElement | null = null;
    let createdStyle = false;
    let button: HTMLButtonElement | undefined;
    let handleClick: (() => void) | undefined;
    const prepared = new Set<HTMLElement>();
    const animations: Animation[] = [];

    const setup = () => {
      if (cancelled) return;

      const shell = document.querySelector<HTMLElement>(".site-shell");
      const hero = document.querySelector<HTMLElement>(".hero#top");
      const work = document.getElementById("work");

      if (!shell || !hero || !work) {
        setupFrame = window.requestAnimationFrame(setup);
        return;
      }

      styleNode = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
      if (!styleNode) {
        styleNode = document.createElement("style");
        styleNode.id = STYLE_ID;
        styleNode.textContent = styles;
        document.head.appendChild(styleNode);
        createdStyle = true;
      }

      shell.classList.add(ROOT_CLASS);

      revealGroups.forEach(({ selector, base = 0, step = 0 }) => {
        const elements = Array.from(shell.querySelectorAll<HTMLElement>(selector));
        elements.forEach((element, index) => {
          element.classList.remove(VISIBLE_CLASS);
          element.classList.add(REVEAL_CLASS);
          element.style.setProperty(
            "--thrtysix-direct-reveal-delay",
            `${Math.min(base + index * step, 320)}ms`,
          );
          prepared.add(element);
        });
      });

      document.getElementById(CUE_ID)?.remove();
      button = document.createElement("button");
      button.id = CUE_ID;
      button.type = "button";
      button.className = "hero-scroll-attractor";
      button.setAttribute("aria-label", "Scroll to selected work");

      const label = document.createElement("span");
      label.className = "hero-scroll-attractor-label";
      label.textContent = "SCROLL";

      const arrows = document.createElement("span");
      arrows.className = "hero-scroll-attractor-arrows";
      arrows.setAttribute("aria-hidden", "true");

      const firstArrow = document.createElement("span");
      firstArrow.className = "hero-scroll-attractor-arrow";
      const secondArrow = document.createElement("span");
      secondArrow.className = "hero-scroll-attractor-arrow";
      arrows.append(firstArrow, secondArrow);
      button.append(label, arrows);

      handleClick = () => {
        const destination = work.getBoundingClientRect().top + window.scrollY;
        smoothScrollTo(destination);
      };
      button.addEventListener("click", handleClick);
      hero.appendChild(button);

      const reveal = (element: HTMLElement) => {
        if (element.classList.contains(VISIBLE_CLASS)) return;
        element.classList.add(VISIBLE_CLASS);
        prepared.delete(element);
      };

      const checkViewport = () => {
        revealFrame = 0;
        if (cancelled || prepared.size === 0) return;

        const viewportHeight = Math.max(window.innerHeight, 1);
        prepared.forEach((element) => {
          const rect = element.getBoundingClientRect();
          const visibleTop = Math.max(rect.top, 0);
          const visibleBottom = Math.min(rect.bottom, viewportHeight);
          const visiblePixels = Math.max(0, visibleBottom - visibleTop);
          const requiredPixels = Math.min(150, Math.max(44, rect.height * 0.2));
          const crossedRevealLine = rect.top <= viewportHeight * 0.86;

          if (visiblePixels >= requiredPixels && crossedRevealLine && rect.bottom > 0) {
            reveal(element);
          }
        });
      };

      const requestCheck = () => {
        if (!revealFrame) revealFrame = window.requestAnimationFrame(checkViewport);
      };

      const start = () => {
        if (cancelled) return;

        /* Paint the hidden state first, then begin checking the viewport. */
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            if (cancelled) return;
            button?.classList.add("is-visible");
            checkViewport();
            window.addEventListener("scroll", requestCheck, { passive: true });
            window.addEventListener("resize", requestCheck, { passive: true });

            [firstArrow, secondArrow].forEach((arrow, index) => {
              const animation = arrow.animate(
                [
                  {
                    opacity: 0.28,
                    transform: "translate3d(-50%, 0, 0) rotate(45deg)",
                  },
                  {
                    opacity: 1,
                    offset: 0.36,
                    transform: "translate3d(-50%, 2px, 0) rotate(45deg)",
                  },
                  {
                    opacity: 0.28,
                    transform: "translate3d(-50%, 0, 0) rotate(45deg)",
                  },
                ],
                {
                  duration: 1550,
                  delay: index * 190,
                  iterations: Infinity,
                  easing: "cubic-bezier(.42, 0, .24, 1)",
                },
              );
              animations.push(animation);
            });
          });
        });
      };

      const loaderIsGone = () => !document.querySelector(".site-loader");
      if (loaderIsGone()) {
        start();
      } else {
        loaderObserver = new MutationObserver(() => {
          if (!loaderIsGone()) return;
          loaderObserver?.disconnect();
          start();
        });
        loaderObserver.observe(document.body, { childList: true, subtree: true });
      }

      return () => {
        window.removeEventListener("scroll", requestCheck);
        window.removeEventListener("resize", requestCheck);
      };
    };

    const removeListeners = setup();

    return () => {
      cancelled = true;
      if (setupFrame) window.cancelAnimationFrame(setupFrame);
      if (revealFrame) window.cancelAnimationFrame(revealFrame);
      loaderObserver?.disconnect();
      removeListeners?.();
      animations.forEach((animation) => animation.cancel());

      if (button && handleClick) button.removeEventListener("click", handleClick);
      button?.remove();

      const shell = document.querySelector<HTMLElement>(".site-shell");
      shell?.classList.remove(ROOT_CLASS);
      prepared.forEach((element) => {
        element.classList.remove(REVEAL_CLASS, VISIBLE_CLASS);
        element.style.removeProperty("--thrtysix-direct-reveal-delay");
      });

      if (createdStyle) styleNode?.remove();
    };
  }, []);

  return null;
}
