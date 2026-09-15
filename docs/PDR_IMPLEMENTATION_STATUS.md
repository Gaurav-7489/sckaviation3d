# SCK Aviation PDR implementation status

This file maps the repaired Digital Experience & Website Development Blueprint to the current codebase.

## Implemented in code

- Dark, black-first editorial system with sharp geometry, negative space and restrained reflective accents.
- Automatic `ALIGNING DETAILS...` loader.
- Cinematic cloud arrival -> final approach -> touchdown -> rollout -> homepage sequence.
- Lenis smooth scrolling synchronized with GSAP / ScrollTrigger.
- Homepage narrative: Hero -> Position -> Black Star -> Materials -> Atelier -> Projects -> Proof -> Access.
- Five-item desktop navigation: Aircraft / Atelier / Projects / Journal / Access.
- Compact mobile menu with large touch targets and no hover dependency.
- Dedicated Aircraft, Atelier, Projects, Design Philosophy, Journal, About and Access routes.
- OE-LSC flagship story with exterior, interior, materials, award proof and responsive gallery.
- Keyboard-operable horizontal gallery on desktop; vertical media narrative on mobile.
- Material modules using real committed SCK media.
- Atelier numbered timeline and process film.
- Projects / selective film and extensible case categories.
- Quiet award proof with source link.
- Qualified access form fields matching the PDR intent.
- Client + server validation and recoverable form states.
- Deep video visibility control; mobile video controls; poster fallback.
- Responsive image/video crops and modern committed WebP media.
- Visible focus states, semantic headings, keyboard controls and reduced-motion behavior.
- Unique route metadata, Open Graph defaults, sitemap and robots policy.
- Branded 404 and runtime recovery state.
- Analytics event hooks for key CTA / 3D / inquiry events (`sck:analytics`).
- Static content architecture in place of premature CMS complexity.

## Approval / external gates — intentionally not fabricated

These PDR items require SCK/client input and cannot be honestly marked complete in code alone:

- Final web font family and license.
- Confirmation of image/video rights for public media.
- Final approved website copy.
- Approved partner names, logos, production references, quotes and exact credit language.
- Final privacy / consent wording and legal requirements.
- Approved CRM / email / webhook destination (`SCK_INQUIRY_WEBHOOK_URL`).
- Analytics provider + privacy configuration.
- Production-quality OE-LSC 3D model and final material textures.
- Final mobile hero crop/poster approval.
- Production deployment, browser/device QA and rollback ownership.

## Launch QA still requires real-device validation

CI proves install, TypeScript and production build. Before launch, run representative mobile/desktop browser QA, keyboard/screen-reader checks, Core Web Vitals tests on constrained networks, inquiry routing test, reduced-motion test and final content/source review.
