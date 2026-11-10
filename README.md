# THRTYSIX Portfolio — Interactive 3D Version

A clean but non-generic portfolio for Kristiyan Yordanov / THRTYSIX.

## What is included

- Interactive pseudo-3D particle entity rendered on canvas
- Pointer-reactive 3D project cards
- Clickable fullscreen project case-study overlays
- Responsive mobile navigation and touch-friendly layouts
- Optional procedural ambient sound, off by default
- Custom cursor on desktop
- Next.js App Router, ready for Vercel
- No animation or 3D dependencies

## Required font step

The entire site is configured to use **Kids Word** through:

`public/fonts/KidsWord.woff2`

The font is not bundled because available listings describe it as personal-use-only unless separately licensed. Purchase the correct commercial/web license, then place the licensed WOFF2 file at that exact path. Until then, the site uses a rounded fallback font.

## Run locally

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Deploy to Vercel

Import the repository into Vercel with:

- Framework preset: Next.js
- Root directory: `./`
- Build command: default
- Install command: default
- Output directory: default
- Node.js: 24.x

No environment variables are required.

## Replace before launch

- Replace `hello@thrtysix.com` in `components/PortfolioExperience.tsx`.
- Replace the placeholder projects in the `projects` array.
- Put real project images or videos in `public/projects/`.
- Update metadata in `app/layout.tsx` if needed.
