---
last_updated: 2026-09-21T06:09:25Z
status: active
---

# Project Context

## Project Overview

SAKAN (سكن) — a premium Arabic-community matchmaking web app MVP. Members register, complete onboarding (profile + preferences), discover and filter profiles, favorite/visit/block/report members, chat 1:1, and upgrade to premium plans via Stripe. Deep-navy / electric-blue / metallic-gold brand with bilingual Arabic/English treatment.

## Key Decisions
| Date | Decision | By | Rationale |
|------|----------|-----|-----------|
| 2026-09-21 | Use Atoms Cloud as the only backend (auth, DB, storage, custom APIs) | Alex | Platform-mandated; spec requires auth/DB/storage/AI/Stripe |
| 2026-09-21 | Reuse Atoms auth with callback routes `/auth/callback` + `/auth/error` | Alex | No second auth system; platform rule |
| 2026-09-21 | Store only object_key in DB; presign via `client.storage.upload` / `getDownloadUrl` | Alex | Documented object-storage pattern; URLs never persisted |
| 2026-09-21 | Stripe checkout through `/api/v1/sakan/payments/*`; verify on `?session_id=` redirect | Alex | Backend-owned entitlement; no client-trusted premium state |
| 2026-09-21 | Free message quota enforced server-side; premium unlimited | Alex | Real business rule from spec |
| 2026-09-21 | Seeded 3 plans + 12 demo profiles for discovery demo | Alex | MVP needs populated discovery |
| 2026-09-21 | Ad-slot management APIs require auth; `/all` owner-scoped; public ads only via public/home | Alex | Prevent anonymous enumeration and cross-advertiser leakage |

## Constraints

- Brand theme: deep-navy background, electric-blue accents, metallic-gold premium surfaces (`gold-surface`); Arabic display text paired with English labels.
- All custom API calls go through `client.apiCall.invoke` (`/api/v1/sakan/...`); entity CRUD via web-sdk only.
- Media lives in the public `sakan-media` bucket under `profiles/<user_id>/...`; never persist presigned URLs.
- Static checks required before finish: backend `python3 -m py_compile`; frontend `pnpm run lint` + `pnpm run build`.
- Do not modify `.mgx/config.yaml`, `backend/routers/storage.py`, or `backend/services/storage.py`.

