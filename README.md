# SCK Aviation Digital Experience

A cinematic, editorial web experience built around OE-LSC / Black Star, the SCK Aviation atelier, materials, projects and selective access.

## Stack

Next.js + TypeScript + React + React Three Fiber + Drei + Three.js + GSAP / ScrollTrigger + Lenis.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Experience architecture

The homepage follows the PDR narrative order:

`ARRIVAL → ATTITUDE → POSITION → BLACK STAR → MATERIALS → ATELIER → PROJECTS → PROOF → ACCESS`

The aircraft intro is automatic. After loading, the aircraft moves continuously through a bright cloud field, the runway is revealed under cloud cover, and the same physical path continues into approach, touchdown, rollout and the live website hero. There is no click-to-enter and no mid-flight position/camera reset.

Routes:

- `/aircraft` — OE-LSC / Black Star flagship story
- `/atelier` — transformation timeline and process media
- `/projects` — productions, selective charter and special projects
- `/design-philosophy` — material / visual system
- `/journal` — editorial framework
- `/about` — founder-led context
- `/access` — qualified inquiry

## Public media

The `public/` directory is discovered at build time. Images and video are used in art-directed placements rather than a generic media dump. Deep video is lazy / visibility controlled on desktop and becomes controls-first on mobile, with a static poster fallback.

## Inquiry routing

The access form validates on the client and server. It intentionally does **not** send personal data anywhere until SCK approves the final destination.

Configure the approved secure endpoint with:

```bash
SCK_INQUIRY_WEBHOOK_URL=https://your-approved-endpoint.example/inquiry
```

Without that variable, the form returns a clear recoverable status instead of silently routing data to an unapproved service.

## Approval-sensitive launch gates

The code is ready for these inputs, but they cannot be truthfully completed by engineering without SCK/client approval:

- final licensed web font
- photography/video usage rights confirmation
- approved production/partner credits and quotes
- final privacy/consent wording
- CRM/email/webhook destination
- analytics provider and privacy configuration
- production-quality OE-LSC 3D model (the current mesh remains a prototype asset)

The site keeps these items separate from factual published content so unsupported claims or invented endorsements are not introduced.

## QA

CI runs dependency install, TypeScript checking and the production Next.js build. Before release, complete representative-device mobile/desktop/browser QA, accessibility checks, reduced-motion testing, Core Web Vitals testing and final content/rights approval.
