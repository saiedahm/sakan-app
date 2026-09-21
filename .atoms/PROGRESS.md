---
last_updated: 2026-09-21T06:09:25Z
---

# Requirements & Progress

## Requirements Overview

- Build the SAKAN MVP as a real full-stack application per `/workspace/uploads/paste-text.txt`: a premium Arabic-community matchmaking web app with bilingual (AR/EN) branding.
- Atoms Cloud backend for authentication, PostgreSQL data, object storage, and custom APIs; Stripe for premium subscriptions.
- Core flows: sign up/login → onboarding (profile + preferences) → discovery with filters → profile view with favorite/visit/block/report → favorites & visitors → 1:1 messaging → premium upgrade via Stripe checkout.

## User Stories

- As a new member, I can register/login and complete onboarding so my profile and matching preferences are saved.
- As a member, I can browse and filter profiles (gender, country, city, age) in Discover and open any profile.
- As a member, I can favorite profiles, see who visited me, block/report members, and manage all of it from Connections.
- As a member, I can chat 1:1 with other members; free accounts are limited to a message quota while premium is unlimited.
- As a member, I can upload/delete profile photos, set a primary photo, edit my profile and preferences in My Profile.
- As a member, I can subscribe to a premium plan via Stripe and have my premium entitlement verified and applied server-side.

## Task Breakdown
- [x] Initialize full-stack Atoms Cloud project (frontend + backend) and preview
- [x] Create database schema: Profiles, Preferences, ProfilePhotos, Favorites, Blocks, Reports, Visits, Conversations, Messages, Payments, Plans
- [x] Seed subscription plans and demo profiles (including premium examples)
- [x] Provision public `sakan-media` object-storage bucket
- [x] Backend core APIs: me/profiles, discovery, media, favorites, visits, blocks, reports, conversations, messages
- [x] Backend Stripe APIs: create_payment_session + verify_payment with backend-owned entitlement updates
- [x] Frontend pages: Index, Onboarding, Discover, ProfileView, Connections, Messages, MyProfile, Subscription, AuthCallback, AuthError
- [x] Brand styling: deep-navy/electric-blue/metallic-gold theme, Arabic/English treatment, trust cues
- [x] Storage integration: `client.storage.upload` + presigned `getDownloadUrl` preview flow, object_key-only persistence
- [x] Static checks: backend `py_compile` OK, frontend `pnpm run lint` + `pnpm run build` OK
- [x] Final UI validation against the live preview
- [x] Rebuild homepage to match the Arabic wireframe (ad slots, featured ribbon, 99-cent promo, sidebar)
- [x] AR/EN i18n with header language toggle across public and authed shells
- [x] Presence heartbeat (4-min interval) wired into AppShell
- [x] Discovery modes latest/nearby/online with home-tab and sidebar deep links
- [x] Ad-slot API authorization: auth required on /all, owner-scoped listing
- [x] Sync repository to GitHub (saiedahm/sakan-app)

## Progress Log

- Initialized Atoms Cloud full-stack project; preview launched via start_app_v2.sh.
- Created 11 database tables and seeded 3 plans + 12 demo profiles.
- Implemented backend routers `sakan_core.py` and `sakan_payments.py` with automatic router discovery.
- Built all branded frontend pages and route wiring in `src/pages/`.
- Aligned storage calls with SDK docs: `client.storage.upload` and `getDownloadUrl` → `download_url`.
- Fixed lint error (useless regex escape) in MyProfile photo upload; cleaned duplicated checkout call.
- Backend `py_compile` passed; frontend lint and production build passed.
- Round 2: homepage rebuilt to wireframe, AR/EN language toggle added, presence heartbeat + discovery modes wired, deep-link search/mode params handled in Discover.
- Round 2: hardened Adslots router — `/all` now requires auth and returns owner-scoped results.
- Synced the complete repository (frontend, backend, seeds, docs, design uploads) to github.com/saiedahm/sakan-app branch `main` via a writable clone (platform git dir is read-only).
