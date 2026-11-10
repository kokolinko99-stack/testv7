"use client";

import { useEffect } from "react";

const STYLE_ID = "thrtysix-site-fade-up-styles";
const ROOT_CLASS = "thrtysix-fade-up-mode";
const REVEAL_CLASS = "thrtysix-fade-up";
const VISIBLE_CLASS = "is-fade-up-visible";

const styles = `
  /* Stop the older continuous section choreography from fighting this reveal. */
  .site-shell.${ROOT_CLASS} .hero,
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

  .site-shell.${ROOT_CLASS} .hero h1 span,
  .site-shell.${ROOT_CLASS} .hero-name,
  .site-shell.${ROOT_CLASS} .hero-nickname,
  .site-shell.${ROOT_CLASS} .hero-role,
  .site-shell.${ROOT_CLASS} .entity-wrap {
    transform: none !important;
    opacity: 1 !important;
    animation: none !important;
  }

  .site-shell.${ROOT_CLASS} .site-header {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
  }

  .site-shell.${ROOT_CLASS} .${REVEAL_CLASS} {
    --fade-up-distance: 46px;
    --fade-up-delay: 0ms;
    opacity: 0 !important;
    translate: 0 var(--fade-up-distance);
    filter: blur(9px);
    transition:
      opacity 820ms cubic-bezier(.16, .84, .2, 1),
      translate 980ms cubic-bezier(.16, .84, .2, 1),
      filter 760ms ease;
    transition-delay: var(--fade-up-delay);
    will-change: opacity, translate, filter;
  }

  .site-shell.${ROOT_CLASS} .${REVEAL_CLASS}.${VISIBLE_CLASS} {
    opacity: 1 !important;
    translate: 0 0;
    filter: blur(0);
  }

  .site-shell.${ROOT_CLASS} .project-card.${REVEAL_CLASS} {
    --fade-up-distance: 64px;
  }

  .site-shell.${ROOT_CLASS} .manifesto h2.${REVEAL_CLASS},
  .site-shell.${ROOT_CLASS} .contact-heading-button.${REVEAL_CLASS},
  .site-shell.${ROOT_CLASS} .footer-word.${REVEAL_CLASS} {
    --fade-up-distance: 72px;
  }

  .site-shell.${ROOT_CLASS} .service.${REVEAL_CLASS},
  .site-shell.${ROOT_CLASS} .social-secondary a.${REVEAL_CLASS} {
    --fade-up-distance: 30px;
  }

  @media (max-width: 700px) {
    .site-shell.${ROOT_CLASS} .${REVEAL_CLASS} {
      --fade-up-distance: 32px;
      filter: blur(6px);
      transition-duration: 700ms, 820ms, 620ms;
    }

    .site-shell.${ROOT_CLASS} .project-card.${REVEAL_CLASS},
    .site-shell.${ROOT_CLASS} .manifesto h2.${REVEAL_CLASS},
    .site-shell.${ROOT_CLASS} .contact-heading-button.${REVEAL_CLASS},
    .site-shell.${ROOT_CLASS} .footer-word.${REVEAL_CLASS} {
      --fade-up-distance: 42px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .site-shell.${ROOT_CLASS} .${REVEAL_CLASS} {
      translate: none;
      filter: none;
      transition-duration: 260ms;
    }
  }
`;

type RevealGroup = {
  selector: string;
  step?: number;
  base?: number;
};

const groups: RevealGroup[] = [
  { selector: ".site-header .brand, .site-header .desktop-nav, .site-header .header-actions", step: 75 },
  { selector: ".hero h1 span, .hero .entity-wrap", step: 130, base: 70 },
  { selector: ".work .section-intro", base: 20 },
  { selector: ".work .project-card", step: 70 },
  { selector: ".manifesto .manifesto-object, .manifesto h2", step: 120 },
  { selector: ".about .section-intro, .about .about-copy", step: 90 },
  { selector: ".about .service", step: 55 },
  { selector: ".contact .contact-heading-button", base: 20 },
  { selector: ".contact .social-secondary a", step: 70, base: 80 },
  { selector: ".site-footer .footer-mark, .site-footer .footer-word", step: 100 },
  { selector: ".site-footer .footer-bottom > span, .site-footer .footer-bottom > div", step: 80, base: 80 },
];

export default function SiteRevealPatch() {
  useEffect(() => {
    let cancelled = false;
    let setupFrame = 0;
    let observer: IntersectionObserver | undefined;
    let shellObserver: MutationObserver | undefined;
    let styleNode: HTMLStyleElement | null = null;
    let createdStyle = false;
    const prepared = new Set<HTMLElement>();

    const revealVisibleElements = () => {
      prepared.forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.96 && rect.bottom > 0) {
          element.classList.add(VISIBLE_CLASS);
          observer?.unobserve(element);
        }
      });
    };

    const setup = () => {
      if (cancelled) return;

      const shell = document.querySelector<HTMLElement>(".site-shell");
      if (!shell) {
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

      groups.forEach(({ selector, step = 0, base = 0 }) => {
        const elements = Array.from(shell.querySelectorAll<HTMLElement>(selector));
        elements.forEach((element, index) => {
          element.classList.add(REVEAL_CLASS);
          element.style.setProperty("--fade-up-delay", `${Math.min(base + index * step, 320)}ms`);
          prepared.add(element);
        });
      });

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const element = entry.target as HTMLElement;
            element.classList.add(VISIBLE_CLASS);
            observer?.unobserve(element);
          });
        },
        {
          threshold: 0.08,
          rootMargin: "0px 0px -9% 0px",
        },
      );

      prepared.forEach((element) => observer?.observe(element));

      const startReveals = () => {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(revealVisibleElements);
        });
      };

      if (shell.classList.contains("is-entered")) {
        startReveals();
      } else {
        shellObserver = new MutationObserver(() => {
          if (!shell.classList.contains("is-entered")) return;
          shellObserver?.disconnect();
          startReveals();
        });
        shellObserver.observe(shell, { attributes: true, attributeFilter: ["class"] });
      }
    };

    setup();

    return () => {
      cancelled = true;
      if (setupFrame) window.cancelAnimationFrame(setupFrame);
      observer?.disconnect();
      shellObserver?.disconnect();

      const shell = document.querySelector<HTMLElement>(".site-shell");
      shell?.classList.remove(ROOT_CLASS);
      prepared.forEach((element) => {
        element.classList.remove(REVEAL_CLASS, VISIBLE_CLASS);
        element.style.removeProperty("--fade-up-delay");
      });

      if (createdStyle) styleNode?.remove();
    };
  }, []);

  return null;
}
