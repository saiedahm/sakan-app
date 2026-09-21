---
last_updated: 2026-09-21T06:09:25Z
---

# Architecture Design

## System Overview

SAKAN is a full-stack matchmaking web app: a React SPA (frontend/) talks to an Atoms Cloud FastAPI backend (backend/) over `/api/v1/*` custom routes and entity CRUD. Atoms Cloud provides auth (session tokens), PostgreSQL, object storage (`sakan-media` bucket), and Stripe integration. Premium entitlements are owned and updated by the backend only.

## Tech Stack

- Frontend: React 18 + Vite + TypeScript, Tailwind CSS, shadcn/ui, react-router-dom, lucide-react, sonner, `metagptx/web-sdk` client.
- Backend: FastAPI + SQLAlchemy async, automatic router discovery in `main.py`, Atoms auth dependencies, Stripe SDK via `services/payment.py`.
- Data: PostgreSQL via Atoms Cloud entities; storage via `sakan-media` bucket (object_key-only persistence).

## Module Design
| Module | Responsibility | Key Files |
|--------|---------------|-----------|
| Web SDK client | Auth, storage, custom API calls | `frontend/src/lib/api.ts` |
| SAKAN API layer | Typed helpers, media URL cache, auth state hook | `frontend/src/lib/sakan.ts` |
| Shared UI kit | AppShell, PageGate, avatars, cards, headers | `frontend/src/components/sakan.tsx` |
| Pages | Landing, onboarding, discovery, profile, connections, messaging, subscription, auth callback | `frontend/src/pages/*.tsx` |
| Auth deps | Bearer-token user resolution | `backend/dependencies/auth.py` |
| Core APIs | Profiles, preferences, discovery, media, favorites, visits, blocks, reports, conversations, messages | `backend/routers/sakan_core.py` |
| Payments | Stripe checkout session + verification, entitlement updates | `backend/routers/sakan_payments.py`, `backend/services/payment.py` |
| Entities | 11 SQLAlchemy models + services + CRUD routers | `backend/models/*`, `backend/services/*`, `backend/routers/*` |

## Tech Decisions
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth | Reuse Atoms Cloud auth (`client.auth.me/toLogin`, callback routes) | Platform-mandated; no second auth system |
| Media storage | Store only `object_key` in DB; presign upload/download via web-sdk | Documented object-storage pattern; URLs never persisted |
| Payments | Custom `/api/v1/sakan/payments/*` endpoints calling Stripe service | Backend-owned entitlement; verify on redirect with `session_id` |
| Message quota | `free_message_limit` enforced in backend message create | Real business rule, premium bypass |
| Discovery filters | Single query endpoint with gender/country/city/age/search params + pagination | MVP-simple, avoids N+1 client filtering |
| Messaging | 1:1 conversations with server-side membership check + block filtering | Privacy-safe MVP chat |

## File Tree Plan

```
app/
├── backend/
│   ├── main.py                  # FastAPI app + router autodiscovery
│   ├── dependencies/auth.py     # get_current_user
│   ├── core/config.py
│   ├── services/payment.py      # Stripe service
│   ├── routers/sakan_core.py    # all SAKAN business APIs
│   ├── routers/sakan_payments.py
│   ├── models/ + services/ + routers/   # generated entities
│   └── skills_docs/             # platform SDK guides
└── frontend/
    ├── src/lib/api.ts           # web-sdk client
    ├── src/lib/sakan.ts         # SAKAN helpers
    ├── src/components/sakan.tsx # shared branded kit
    ├── src/pages/*.tsx          # 10 pages + AuthError
    └── public/assets/sakan-brand.png
```

## Implementation Guide

- Frontend calls custom APIs only through `client.apiCall.invoke` (`/api/v1/sakan/...`).
- Media: upload with `client.storage.upload({ bucket_name: 'sakan-media', object_key, file })`; preview with `getDownloadUrl` → `download_url`; DB stores object_key only.
- Premium state refreshes via `reloadMe()` after payment verification and profile changes.
- Run static checks: backend `python3 -m py_compile` on changed files; frontend `pnpm run lint` + `pnpm run build`.
