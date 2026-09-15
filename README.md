# SCK Aviation 3D Experience

Prototype repository for the cinematic SCK Aviation / OE-LSC Black Star web experience.

## Direction

- Cinematic entry/loading screen inspired by immersive WebGL experiences.
- Persistent Three.js canvas behind semantic HTML content.
- Scroll-driven camera choreography using GSAP ScrollTrigger.
- Production aircraft model will replace the temporary proxy model.
- DOM owns copy, navigation and accessibility; WebGL owns the physical aircraft and atmosphere.
- Mobile and reduced-motion experiences remain first-class fallbacks.

## Stack

Next.js + TypeScript + React Three Fiber + Drei + Three.js + GSAP + Zustand.

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Current milestone — Experience Foundation

The first milestone includes a real loading layer, fixed 3D canvas, temporary aircraft proxy, chapter-based page structure, and scroll-driven camera transitions.

Next: replace the proxy with the optimized OE-LSC GLB, lock camera shots, add material treatments/hotspots, then perform performance and accessibility QA.
