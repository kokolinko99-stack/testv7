"use client";

import { useEffect, useRef } from "react";

const MAX_ROTATE_X = 7;
const MAX_ROTATE_Y = 10;
const PARTICLE_COUNT = 34;
const CUE_ID = "thrtysix-hero-scroll-cue";

export default function EntityCanvas() {
  const areaRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const frameRef = useRef<number | null>(null);
  const targetRef = useRef({ rotateX: 0, rotateY: 0 });
  const pointerInsideHeroRef = useRef(false);

  const renderTilt = () => {
    frameRef.current = null;

    const logo = logoRef.current;
    if (!logo) return;

    const { rotateX, rotateY } = targetRef.current;
    logo.style.transform =
      `perspective(1100px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
  };

  const queueTilt = () => {
    if (frameRef.current === null) {
      frameRef.current = window.requestAnimationFrame(renderTilt);
    }
  };

  const resetTilt = () => {
    targetRef.current = { rotateX: 0, rotateY: 0 };
    queueTilt();
  };

  useEffect(() => {
    const area = areaRef.current;
    const hero = area?.closest<HTMLElement>(".hero");

    if (!hero) return;

    const handleHeroPointerMove = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== "mouse") return;

      const rect = hero.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const normalizedX = Math.min(
        1,
        Math.max(0, (event.clientX - rect.left) / rect.width),
      );
      const normalizedY = Math.min(
        1,
        Math.max(0, (event.clientY - rect.top) / rect.height),
      );

      pointerInsideHeroRef.current = true;
      targetRef.current = {
        rotateX: (0.5 - normalizedY) * MAX_ROTATE_X * 2,
        rotateY: (normalizedX - 0.5) * MAX_ROTATE_Y * 2,
      };

      queueTilt();
    };

    const handleHeroPointerLeave = () => {
      if (!pointerInsideHeroRef.current) return;

      pointerInsideHeroRef.current = false;
      resetTilt();
    };

    hero.addEventListener("pointermove", handleHeroPointerMove, {
      passive: true,
    });
    hero.addEventListener("pointerleave", handleHeroPointerLeave);
    hero.addEventListener("pointercancel", handleHeroPointerLeave);

    return () => {
      hero.removeEventListener("pointermove", handleHeroPointerMove);
      hero.removeEventListener("pointerleave", handleHeroPointerLeave);
      hero.removeEventListener("pointercancel", handleHeroPointerLeave);

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const area = areaRef.current;
    const hero = area?.closest<HTMLElement>(".hero");

    if (!hero) return;
    document.getElementById(CUE_ID)?.remove();

    const cue = document.createElement("div");
    cue.id = CUE_ID;
    cue.className = "thrtysix-hero-scroll-cue";
    cue.setAttribute("aria-hidden", "true");

    const particles = document.createElement("div");
    particles.className = "thrtysix-hero-particles";

    for (let index = 0; index < PARTICLE_COUNT; index += 1) {
      const particle = document.createElement("span");
      const x = (index * 37 + 11) % 101;
      const size = 1.4 + ((index * 17) % 34) / 10;
      const delay = -((index * 0.31) % 6.8);
      const duration = 3.8 + ((index * 13) % 34) / 10;
      const drift = ((index * 29) % 70) - 35;
      const opacity = 0.34 + ((index * 19) % 55) / 100;

      particle.style.setProperty("--particle-x", `${x}%`);
      particle.style.setProperty("--particle-size", `${size}px`);
      particle.style.setProperty("--particle-delay", `${delay}s`);
      particle.style.setProperty("--particle-duration", `${duration}s`);
      particle.style.setProperty("--particle-drift", `${drift}px`);
      particle.style.setProperty("--particle-opacity", `${opacity}`);
      particles.appendChild(particle);
    }

    const prompt = document.createElement("div");
    prompt.className = "thrtysix-hero-scroll-prompt";
    prompt.innerHTML = `
      <span class="thrtysix-hero-scroll-label">SCROLL</span>
      <span class="thrtysix-hero-scroll-arrows">
        <i></i>
        <i></i>
      </span>
    `;

    cue.appendChild(particles);
    cue.appendChild(prompt);
    hero.appendChild(cue);

    const shell = hero.closest<HTMLElement>(".site-shell");
    let introFrame = 0;
    let loaderObserver: MutationObserver | null = null;

    const startCueIntro = () => {
      if (introFrame || cue.classList.contains("is-intro-visible")) return;

      introFrame = window.requestAnimationFrame(() => {
        introFrame = window.requestAnimationFrame(() => {
          introFrame = 0;
          cue.classList.add("is-intro-visible");
        });
      });
    };

    if (!shell?.querySelector(".site-loader")) {
      startCueIntro();
    } else {
      loaderObserver = new MutationObserver(() => {
        if (shell.querySelector(".site-loader")) return;
        loaderObserver?.disconnect();
        loaderObserver = null;
        startCueIntro();
      });
      loaderObserver.observe(shell, { childList: true });
    }

    let scrollFrame = 0;

    const updateCueVisibility = () => {
      scrollFrame = 0;
      const rect = hero.getBoundingClientRect();
      const progress = Math.min(
        1,
        Math.max(0, -rect.top / Math.max(rect.height, 1)),
      );
      cue.style.setProperty("--cue-scroll-progress", `${progress}`);
    };

    const scheduleVisibilityUpdate = () => {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(updateCueVisibility);
    };

    updateCueVisibility();
    window.addEventListener("scroll", scheduleVisibilityUpdate, {
      passive: true,
    });
    window.addEventListener("resize", scheduleVisibilityUpdate, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", scheduleVisibilityUpdate);
      window.removeEventListener("resize", scheduleVisibilityUpdate);
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
      if (introFrame) window.cancelAnimationFrame(introFrame);
      loaderObserver?.disconnect();
      cue.remove();
    };
  }, []);

  return (
    <>
      <div
        ref={areaRef}
        aria-hidden="true"
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "grid",
          placeItems: "center",
          overflow: "visible",
          pointerEvents: "none",
          isolation: "isolate",
        }}
      >
        <img
          ref={logoRef}
          src="/brand/human-logo.png"
          alt=""
          draggable={false}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            maxWidth: "900px",
            maxHeight: "900px",
            objectFit: "contain",
            transform:
              "perspective(1100px) rotateX(0deg) rotateY(0deg) translateZ(0)",
            transformOrigin: "center center",
            transition: "transform 120ms ease-out",
            willChange: "transform",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            pointerEvents: "none",
            userSelect: "none",
          }}
        />
      </div>

      <style>{`
        .hero {
          position: relative !important;
          isolation: isolate;
        }

        .hero::after {
          content: none !important;
          display: none !important;
        }

        .thrtysix-hero-scroll-cue {
          --cue-scroll-progress: 0;
          position: absolute;
          z-index: 12;
          left: 0;
          right: 0;
          bottom: 0;
          height: clamp(130px, 18vh, 210px);
          overflow: hidden;
          pointer-events: none;
          opacity: calc(1 - var(--cue-scroll-progress));
          transform: translate3d(
            0,
            calc(var(--cue-scroll-progress) * 32px),
            0
          );
          transition: opacity 120ms linear;
        }

        .thrtysix-hero-scroll-cue::before {
          content: "";
          position: absolute;
          inset: auto -8% -52px;
          height: 190px;
          background:
            radial-gradient(
              ellipse at 50% 100%,
              rgba(20, 162, 52, 0.42) 0%,
              rgba(20, 162, 52, 0.16) 32%,
              rgba(20, 162, 52, 0.04) 58%,
              transparent 76%
            ),
            linear-gradient(
              to top,
              rgba(20, 162, 52, 0.12),
              transparent 70%
            );
          filter: blur(11px);
          transform: translateZ(0);
          animation: thrtysixHeroGlowPulse 3.4s ease-in-out infinite;
        }

        .thrtysix-hero-scroll-cue::after {
          content: "";
          position: absolute;
          left: 5%;
          right: 5%;
          bottom: 0;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(20, 162, 52, 0.35) 12%,
            #14a234 50%,
            rgba(20, 162, 52, 0.35) 88%,
            transparent
          );
          box-shadow:
            0 0 14px rgba(20, 162, 52, 0.9),
            0 -8px 34px rgba(20, 162, 52, 0.42),
            0 -28px 80px rgba(20, 162, 52, 0.16);
          opacity: 0.92;
        }

        .thrtysix-hero-particles {
          position: absolute;
          inset: 0;
          overflow: hidden;
          mask-image: linear-gradient(
            to top,
            #000 0%,
            rgba(0, 0, 0, 0.92) 58%,
            transparent 100%
          );
          -webkit-mask-image: linear-gradient(
            to top,
            #000 0%,
            rgba(0, 0, 0, 0.92) 58%,
            transparent 100%
          );
        }

        .thrtysix-hero-particles span {
          position: absolute;
          left: var(--particle-x);
          bottom: -8px;
          width: var(--particle-size);
          height: var(--particle-size);
          border-radius: 999px;
          background: #8dffc4;
          box-shadow:
            0 0 6px rgba(20, 162, 52, 0.95),
            0 0 14px rgba(20, 162, 52, 0.58);
          opacity: 0;
          animation: thrtysixHeroParticleRise var(--particle-duration) linear
            var(--particle-delay) infinite;
          will-change: transform, opacity;
        }

        .thrtysix-hero-scroll-prompt {
          position: absolute;
          z-index: 2;
          left: 50%;
          bottom: 19px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          transform: translateX(-50%);
          color: #9effca;
          will-change: transform;
        }

        .thrtysix-hero-scroll-cue.is-intro-visible
          .thrtysix-hero-scroll-prompt {
          animation: thrtysixHeroPromptFloat 1.8s ease-in-out 900ms infinite;
        }

        .thrtysix-hero-scroll-label {
          font-family: inherit;
          font-size: 9px;
          font-weight: 700;
          line-height: 1;
          letter-spacing: 0.28em;
          text-indent: 0.28em;
          opacity: 0;
          translate: 0 14px;
          filter: blur(4px) drop-shadow(0 0 9px rgba(20, 162, 52, 0.42));
          will-change: opacity, translate, filter;
        }

        .thrtysix-hero-scroll-cue.is-intro-visible
          .thrtysix-hero-scroll-label {
          animation: thrtysixHeroCueElementEnter 700ms
            cubic-bezier(0.16, 0.84, 0.2, 1) 60ms both;
        }

        .thrtysix-hero-scroll-arrows {
          position: relative;
          width: 18px;
          height: 18px;
          overflow: visible;
          opacity: 0;
          translate: 0 16px;
          filter: blur(4px);
          will-change: opacity, translate, filter;
        }

        .thrtysix-hero-scroll-cue.is-intro-visible
          .thrtysix-hero-scroll-arrows {
          animation: thrtysixHeroCueElementEnter 700ms
            cubic-bezier(0.16, 0.84, 0.2, 1) 180ms both;
        }

        .thrtysix-hero-scroll-arrows i {
          position: absolute;
          left: 50%;
          width: 8px;
          height: 8px;
          border-right: 2px solid #31c653;
          border-bottom: 2px solid #31c653;
          opacity: 0.9;
          transform: translate(-50%, 0) rotate(45deg);
          transform-origin: center;
          filter: none;
          will-change: transform, opacity, filter, border-color;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .thrtysix-hero-scroll-arrows i:first-child {
          top: 0;
        }

        .thrtysix-hero-scroll-arrows i:last-child {
          top: 6px;
        }

        .thrtysix-hero-scroll-cue.is-intro-visible
          .thrtysix-hero-scroll-arrows i:first-child {
          animation: thrtysixHeroArrowTopSequence 12.7s linear 1.05s infinite both;
        }

        .thrtysix-hero-scroll-cue.is-intro-visible
          .thrtysix-hero-scroll-arrows i:last-child {
          animation: thrtysixHeroArrowBottomSequence 12.7s linear 1.05s infinite both;
        }

        @keyframes thrtysixHeroParticleRise {
          0% {
            opacity: 0;
            transform: translate3d(-50%, 20px, 0) scale(0.55);
          }
          14% {
            opacity: var(--particle-opacity);
          }
          68% {
            opacity: 0.24;
          }
          100% {
            opacity: 0;
            transform: translate3d(
                calc(-50% + var(--particle-drift)),
                -115px,
                0
              )
              scale(0.12);
          }
        }

        @keyframes thrtysixHeroGlowPulse {
          0%,
          100% {
            opacity: 0.7;
            transform: scaleX(0.96) translateZ(0);
          }
          50% {
            opacity: 1;
            transform: scaleX(1.04) translateZ(0);
          }
        }

        @keyframes thrtysixHeroPromptFloat {
          0%,
          100% {
            transform: translate3d(-50%, 0, 0);
          }
          50% {
            transform: translate3d(-50%, 6px, 0);
          }
        }

        @keyframes thrtysixHeroCueElementEnter {
          0% {
            opacity: 0;
            translate: 0 16px;
            filter: blur(4px);
          }
          65% {
            opacity: 1;
            translate: 0 -2px;
            filter: blur(0);
          }
          100% {
            opacity: 1;
            translate: 0 0;
            filter: blur(0);
          }
        }

        /*
         * 12.7-second loop:
         * 0.45s top glow
         * 0.45s bottom glow
         * 0.45s bottom exits downward
         * 0.45s top exits downward
         * 0.45s bottom re-enters from above
         * 0.45s top re-enters from above
         * 10-second cooldown
         */
        @keyframes thrtysixHeroArrowTopSequence {
          0% {
            opacity: 0.9;
            border-color: #31c653;
            transform: translate(-50%, 0) rotate(45deg);
            filter: none;
          }

          1.772% {
            opacity: 1;
            border-color: #00ff66;
            transform: translate(-50%, 0) rotate(45deg);
            filter:
              drop-shadow(0 0 4px rgba(0, 255, 102, 1))
              drop-shadow(0 0 12px rgba(0, 220, 88, 0.95))
              drop-shadow(0 0 24px rgba(0, 170, 68, 0.75));
          }

          3.543%,
          10.63% {
            opacity: 0.9;
            border-color: #31c653;
            transform: translate(-50%, 0) rotate(45deg);
            filter: none;
          }

          14.173% {
            opacity: 0;
            border-color: #31c653;
            transform: translate(-50%, 7px) rotate(45deg);
            filter: none;
          }

          17.716% {
            opacity: 0;
            border-color: #31c653;
            transform: translate(-50%, 7px) rotate(45deg);
            filter: none;
          }

          17.717% {
            opacity: 0;
            border-color: #31c653;
            transform: translate(-50%, -7px) rotate(45deg);
            filter: none;
          }

          21.26%,
          100% {
            opacity: 0.9;
            border-color: #31c653;
            transform: translate(-50%, 0) rotate(45deg);
            filter: none;
          }
        }

        @keyframes thrtysixHeroArrowBottomSequence {
          0%,
          3.543% {
            opacity: 0.9;
            border-color: #31c653;
            transform: translate(-50%, 0) rotate(45deg);
            filter: none;
          }

          5.315% {
            opacity: 1;
            border-color: #00ff66;
            transform: translate(-50%, 0) rotate(45deg);
            filter:
              drop-shadow(0 0 4px rgba(0, 255, 102, 1))
              drop-shadow(0 0 12px rgba(0, 220, 88, 0.95))
              drop-shadow(0 0 24px rgba(0, 170, 68, 0.75));
          }

          7.087% {
            opacity: 0.9;
            border-color: #31c653;
            transform: translate(-50%, 0) rotate(45deg);
            filter: none;
          }

          10.63% {
            opacity: 0;
            border-color: #31c653;
            transform: translate(-50%, 7px) rotate(45deg);
            filter: none;
          }

          14.172% {
            opacity: 0;
            border-color: #31c653;
            transform: translate(-50%, 7px) rotate(45deg);
            filter: none;
          }

          14.173% {
            opacity: 0;
            border-color: #31c653;
            transform: translate(-50%, -7px) rotate(45deg);
            filter: none;
          }

          17.717%,
          100% {
            opacity: 0.9;
            border-color: #31c653;
            transform: translate(-50%, 0) rotate(45deg);
            filter: none;
          }
        }

        @media (max-width: 760px) {
          .thrtysix-hero-scroll-cue {
            height: 128px;
          }

          .thrtysix-hero-scroll-cue::before {
            inset-inline: -28%;
            height: 150px;
            opacity: 0.82;
          }

          .thrtysix-hero-particles span:nth-child(2n) {
            display: none;
          }

          .thrtysix-hero-scroll-prompt {
            bottom: 15px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .thrtysix-hero-scroll-cue::before,
          .thrtysix-hero-particles span,
          .thrtysix-hero-scroll-prompt {
            animation: none !important;
          }

          .thrtysix-hero-scroll-cue.is-intro-visible
            .thrtysix-hero-scroll-label,
          .thrtysix-hero-scroll-cue.is-intro-visible
            .thrtysix-hero-scroll-arrows {
            animation: thrtysixHeroCueElementEnter 360ms ease-out both !important;
          }

          .thrtysix-hero-scroll-cue.is-intro-visible
            .thrtysix-hero-scroll-arrows i:first-child {
            animation: thrtysixHeroArrowTopSequence 12.7s linear 500ms infinite both !important;
          }

          .thrtysix-hero-scroll-cue.is-intro-visible
            .thrtysix-hero-scroll-arrows i:last-child {
            animation: thrtysixHeroArrowBottomSequence 12.7s linear 500ms infinite both !important;
          }

          .thrtysix-hero-particles span {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
