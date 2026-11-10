"use client";

import { useEffect, useRef } from "react";

const NOISE_PIXEL_SIZE = 4;

export default function NoiseOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    let resizeTimer = 0;

    const paint = () => {
      const width = Math.max(120, Math.ceil(window.innerWidth / NOISE_PIXEL_SIZE));
      const height = Math.max(80, Math.ceil(window.innerHeight / NOISE_PIXEL_SIZE));
      canvas.width = width;
      canvas.height = height;

      const image = context.createImageData(width, height);
      const data = image.data;

      for (let index = 0; index < data.length; index += 4) {
        const value = Math.random() * 255;
        data[index] = value;
        data[index + 1] = value;
        data[index + 2] = value;
        data[index + 3] = 92;
      }

      context.putImageData(image, 0, 0);
    };

    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(paint, 150);
    };

    paint();
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="noise-overlay" aria-hidden="true" />;
}
