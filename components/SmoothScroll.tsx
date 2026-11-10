"use client";

import { useEffect } from "react";

const EASE = 0.11;
const STOP_THRESHOLD = 0.35;

function maxScrollY() {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function hasScrollableParent(target: EventTarget | null, deltaY: number) {
  let node = target instanceof HTMLElement ? target : null;

  while (node && node !== document.body) {
    const style = window.getComputedStyle(node);
    const canScroll = /(auto|scroll|overlay)/.test(style.overflowY) && node.scrollHeight > node.clientHeight;

    if (canScroll) {
      const movingDown = deltaY > 0;
      const canMoveDown = node.scrollTop + node.clientHeight < node.scrollHeight - 1;
      const canMoveUp = node.scrollTop > 1;
      if ((movingDown && canMoveDown) || (!movingDown && canMoveUp)) return true;
    }

    node = node.parentElement;
  }

  return false;
}

export function smoothScrollTo(targetY: number, duration = 760) {
  const startY = window.scrollY;
  const destination = clamp(targetY, 0, maxScrollY());
  const distance = destination - startY;
  const startedAt = performance.now();

  const easeInOutCubic = (progress: number) =>
    progress < 0.5 ? 4 * progress ** 3 : 1 - Math.pow(-2 * progress + 2, 3) / 2;

  const step = (now: number) => {
    const progress = Math.min(1, (now - startedAt) / duration);
    window.scrollTo(0, startY + distance * easeInOutCubic(progress));
    if (progress < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
}

export default function SmoothScroll() {
  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (!finePointer) return;

    let current = window.scrollY;
    let target = current;
    let frame = 0;
    let running = false;

    const animate = () => {
      current += (target - current) * EASE;

      if (Math.abs(target - current) < STOP_THRESHOLD) {
        current = target;
        window.scrollTo(0, current);
        running = false;
        frame = 0;
        return;
      }

      window.scrollTo(0, current);
      frame = requestAnimationFrame(animate);
    };

    const start = () => {
      if (running) return;
      running = true;
      current = window.scrollY;
      frame = requestAnimationFrame(animate);
    };

    const onWheel = (event: WheelEvent) => {
      if (
        event.ctrlKey ||
        document.body.classList.contains("locked") ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ||
        hasScrollableParent(event.target, event.deltaY)
      ) {
        return;
      }

      event.preventDefault();

      const modeMultiplier = event.deltaMode === 1 ? 18 : event.deltaMode === 2 ? window.innerHeight : 1;
      const delta = clamp(event.deltaY * modeMultiplier, -180, 180);
      target = clamp(target + delta, 0, maxScrollY());
      start();
    };

    const onNativeScroll = () => {
      if (!running) {
        current = window.scrollY;
        target = current;
      }
    };

    const onResize = () => {
      target = clamp(target, 0, maxScrollY());
      current = clamp(current, 0, maxScrollY());
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onNativeScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onNativeScroll);
      window.removeEventListener("resize", onResize);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
