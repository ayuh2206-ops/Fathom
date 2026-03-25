# FATHOM Software Handoff

## 1. What This Software Is

FATHOM is a maritime operations and freight-audit MVP. The product pitch is:

- monitor fleets in near real time
- ingest shipping invoices
- detect overbilling and fraud patterns
- help operators generate disputes against carriers or port agents
- surface operational and financial risk in a dashboard

In its current form, the repository is a hybrid of:

- a real Next.js application with working registration, login, invoice upload, Firebase persistence, and an internal admin panel
- a real Firebase scheduled worker that syncs vessel data and creates geofence alerts
- a polished but partly simulated dashboard experience where several screens still run on mock data

The most important thing for a new team to understand is that this is not a fully backend-complete product yet. It is an MVP with a production-shaped frontend and a partially production-backed core.

## 2. Business Intent and Product Narrative

The software is built around the idea that maritime operators lose money through:

- detention and demurrage overcharges
- duplicate invoicing
- phantom charges
- route anomalies and risk events
- weak dispute workflows

FATHOM positions itself as the system that cross-references invoice claims against operational evidence such as AIS vessel data, then turns suspicious findings into alerts, analytics, and dispute drafts.

What is truly implemented today:

- account creation and credential login
- multi-tenant organization and user records in Firestore
- invoice file upload and metadata storage
- fleet simulation or live Firestore-backed fleet tracking
- a scheduled Firebase Function that writes vessel positions and generates risk alerts
- an internal admin view over users, organizations, and invoice counts

What is mostly represented in UI but not fully implemented:

- invoice OCR
- AI fraud scoring
- automated dispute drafting from evidence
- analytics driven from real warehouse-grade data
- settings persistence
- Stripe billing flows
- SendGrid email workflows

## 3. Top-Level Architecture

### Runtime shape

The system is split into two deployable parts:

1. `Next.js 14` application
   - Lives at the repo root
   - Uses the App Router
   - Intended for deployment on Vercel
   - Hosts the marketing site, registration, dashboard UI, API routes, and admin panel

2. `Firebase Cloud Functions`
   - Lives in [`functions/`](/Users/antarikshdongare/Desktop/Fathom-main/functions)
   - Intended for deployment through Firebase
   - Currently contains one scheduled worker: fleet ingestion plus geofencing

### Core backend services

- `Firestore`
  - primary application database
  - stores organizations, users, invoice metadata, vessels, alerts

- `Firebase Storage`
  - stores uploaded invoice files

- `NextAuth`
  - credential-based authentication
  - JWT session strategy

- `Firebase Admin SDK`
  - server-side access to Firestore and Storage from API routes and server components

- `Firebase Client SDK`
  - optional client-side realtime sync for vessels on the fleet page
  - only works when public Firebase client env vars are configured

### Supporting frontend stack

- `React 18`
- `TypeScript`
- `Tailwind CSS`
- `Radix UI`
- local reusable UI primitives in [`components/ui/`](/Users/antarikshdongare/Desktop/Fathom-main/components/ui)
- `Recharts` for charts
- `Mapbox` via `react-map-gl` for fleet maps
- `Three.js` for the landing-page ship/ocean scene

## 4. Frameworks and Libraries Used

### Application framework

- `Next.js 14.2.35`
  - App Router structure under [`app/`](/Users/antarikshdongare/Desktop/Fathom-main/app)
  - API routes under [`app/api/`](/Users/antarikshdongare/Desktop/Fathom-main/app/api)

### Authentication

- `next-auth`
  - credentials provider only
  - no OAuth providers configured
  - session is stored as JWT, not database-backed session state

### Database and storage

- `firebase-admin`
  - server-side Firestore and Storage access
- `firebase`
  - client-side Firestore realtime listener support

### Styling and UI

- `tailwindcss`
- `tailwindcss-animate`
- `@radix-ui/*`
- local shadcn-style component wrappers in [`components/ui/`](/Users/antarikshdongare/Desktop/Fathom-main/components/ui)

### Visualization and mapping

- `recharts`
- `mapbox-gl`
- `react-map-gl`
- `three`
- `@react-three/fiber` and `@react-three/drei`
  - installed, but the active landing page uses native Three.js instead of React Three Fiber

### Validation and forms

- `zod`
- `react-hook-form`
- `@hookform/resolvers`

### Crypto and password handling

- `bcryptjs`
- Node `crypto`

### Present but not materially wired yet

- `stripe`
- `@sendgrid/mail`
- `leaflet` / `react-leaflet`

These are either not used or not fully integrated in the current runtime.

## 5. Repository Layout

### Root app folders

- [`app/`](/Users/antarikshdongare/Desktop/Fathom-main/app)
  - all routes and API endpoints for the Next.js app

- [`components/`](/Users/antarikshdongare/Desktop/Fathom-main/components)
  - feature UI and shared UI primitives

- [`lib/`](/Users/antarikshdongare/Desktop/Fathom-main/lib)
  - auth, Firebase initialization, small utilities

- [`hooks/`](/Users/antarikshdongare/Desktop/Fathom-main/hooks)
  - local hooks, currently minimal

- [`types/`](/Users/antarikshdongare/Desktop/Fathom-main/types)
  - custom NextAuth typing

- [`functions/`](/Users/antarikshdongare/Desktop/Fathom-main/functions)
  - Firebase Functions package

### Notable non-runtime or legacy folders/files

- [`supabase/schema.sql`](/Users/antarikshdongare/Desktop/Fathom-main/supabase/schema.sql)
  - historical schema draft
  - not used by the actual running app

- [`components/landing/`](/Users/antarikshdongare/Desktop/Fathom-main/components/landing)
  - older landing-page component set
  - only a few pieces are still used directly, mainly the modal and the register form

- [`components/landing-new/`](/Users/antarikshdongare/Desktop/Fathom-main/components/landing-new)
  - active home page experience

- [`functions/lib/index.js`](/Users/antarikshdongare/Desktop/Fathom-main/functions/lib/index.js)
  - compiled artifact from TypeScript
  - source of truth is [`functions/src/index.ts`](/Users/antarikshdongare/Desktop/Fathom-main/functions/src/index.ts)

- [`components/dashboard/DashboardContext.tsx`](/Users/antarikshdongare/Desktop/Fathom-main/components/dashboard/DashboardContext.tsx)
  - mock dashboard state provider
  - appears unused by current page wiring

## 6. Route Map

### Public routes

- [`/`](/Users/antarikshdongare/Desktop/Fathom-main/app/page.tsx)
  - landing page
  - uses a custom Three.js ship/ocean scene and long-form product marketing UI
  - contains client login modal
  - contains hidden admin access modal

- [`/register`](/Users/antarikshdongare/Desktop/Fathom-main/app/register/page.tsx)
  - multi-step registration experience
  - writes organization and owner-user records to Firestore

### Dashboard routes

- [`/dashboard`](/Users/antarikshdongare/Desktop/Fathom-main/app/dashboard/page.tsx)
  - overview page
  - currently mock/demo data

- [`/dashboard/fleet`](/Users/antarikshdongare/Desktop/Fathom-main/app/dashboard/fleet/page.tsx)
  - real-time fleet view
  - can use Firestore realtime or mock polling fallback

- [`/dashboard/invoices`](/Users/antarikshdongare/Desktop/Fathom-main/app/dashboard/invoices/page.tsx)
  - invoice list
  - calls real API routes

- [`/dashboard/invoices/[id]`](/Users/antarikshdongare/Desktop/Fathom-main/app/dashboard/invoices/[id]/page.tsx)
  - invoice detail
  - calls real API route for one invoice

- [`/dashboard/alerts`](/Users/antarikshdongare/Desktop/Fathom-main/app/dashboard/alerts/page.tsx)
  - alert review screen
  - mock data today

- [`/dashboard/disputes`](/Users/antarikshdongare/Desktop/Fathom-main/app/dashboard/disputes/page.tsx)
  - dispute list
  - mock data today

- [`/dashboard/disputes/[id]`](/Users/antarikshdongare/Desktop/Fathom-main/app/dashboard/disputes/[id]/page.tsx)
  - dispute detail and communication thread
  - hardcoded example disputes

- [`/dashboard/analytics`](/Users/antarikshdongare/Desktop/Fathom-main/app/dashboard/analytics/page.tsx)
  - charts and performance views
  - mock/demo data

- [`/dashboard/settings`](/Users/antarikshdongare/Desktop/Fathom-main/app/dashboard/settings/page.tsx)
  - settings shell
  - tabs are UI-only today

### Internal admin route

- [`/admin`](/Users/antarikshdongare/Desktop/Fathom-main/app/admin/page.tsx)
  - server-rendered internal admin panel
  - checks custom admin cookie
  - reads Firestore directly

## 7. API Route Map

### Authentication

- [`POST /api/auth/register`](/Users/antarikshdongare/Desktop/Fathom-main/app/api/auth/register/route.ts)
  - validates registration payload with Zod
  - enforces password policy
  - creates organization, user, and email-index documents in a Firestore transaction

- [`GET|POST /api/auth/[...nextauth]`](/Users/antarikshdongare/Desktop/Fathom-main/app/api/auth/[...nextauth]/route.ts)
  - NextAuth entry point
  - uses credentials provider against Firestore users

### Admin

- [`POST /api/admin/login`](/Users/antarikshdongare/Desktop/Fathom-main/app/api/admin/login/route.ts)
  - validates admin login request
  - verifies hardcoded username/password
  - sets signed HTTP-only cookie

- [`POST /api/admin/logout`](/Users/antarikshdongare/Desktop/Fathom-main/app/api/admin/logout/route.ts)
  - clears admin session cookie

### Invoices

- [`GET /api/invoices`](/Users/antarikshdongare/Desktop/Fathom-main/app/api/invoices/route.ts)
  - returns invoices for an organization
  - currently uses a mocked auth context for local testing

- [`POST /api/invoices`](/Users/antarikshdongare/Desktop/Fathom-main/app/api/invoices/route.ts)
  - uploads invoice file
  - validates file type and size
  - writes file to Firebase Storage if available
  - falls back to a mock file URL when Storage upload fails
  - stores invoice metadata in Firestore
  - currently uses a mocked auth context for local testing

- [`GET /api/invoices/:id`](/Users/antarikshdongare/Desktop/Fathom-main/app/api/invoices/[id]/route.ts)
  - uses real NextAuth session
  - checks organization ownership
  - returns signed download URL

- [`DELETE /api/invoices/:id`](/Users/antarikshdongare/Desktop/Fathom-main/app/api/invoices/[id]/route.ts)
  - uses real NextAuth session
  - checks organization ownership
  - deletes storage object and Firestore document

### Mock/demo fleet feed

- [`GET /api/mock/fleet`](/Users/antarikshdongare/Desktop/Fathom-main/app/api/mock/fleet/route.ts)
  - returns in-memory fleet simulation
  - mutates vessel coordinates on each request

- [`POST /api/mock/fleet`](/Users/antarikshdongare/Desktop/Fathom-main/app/api/mock/fleet/route.ts)
  - appends a new vessel into the in-memory fleet array

## 8. How Authentication Works

### User auth

User auth is implemented in [`lib/auth-options.ts`](/Users/antarikshdongare/Desktop/Fathom-main/lib/auth-options.ts).

Flow:

1. user submits email and password
2. email is normalized to lowercase
3. `userEmails/{normalizedEmail}` is checked first
4. that document points to a `users/{userId}` record
5. bcrypt verifies the password against `passwordHash`
6. NextAuth issues a JWT session
7. JWT and session are augmented with:
   - `id`
   - `organizationId`
   - `role`

### Registration

Registration logic lives in [`app/api/auth/register/route.ts`](/Users/antarikshdongare/Desktop/Fathom-main/app/api/auth/register/route.ts).

It creates:

- one organization document
- one owner user document
- one email lookup document in `userEmails`

The email lookup collection acts as a uniqueness index for credentials login.

### Admin auth

Admin auth is custom and separate from NextAuth.

Implementation:

- username and password are checked in [`lib/admin-auth.ts`](/Users/antarikshdongare/Desktop/Fathom-main/lib/admin-auth.ts)
- a signed token is generated with HMAC-SHA256
- the token is stored in `fathom_admin_session`
- `/admin` validates that cookie on the server before rendering

Important current limitation:

- admin credentials are hardcoded in source code, which is not production-safe

## 9. How Multi-Tenancy Works

The intended tenant boundary is organization-based.

Tenant identifier:

- `organizationId`

Where it appears:

- users belong to one organization
- invoices are stored with `organizationId`
- session contains `organizationId`
- single-invoice `GET` and `DELETE` APIs compare the session org against the invoice org

What is correct today:

- user login yields org context
- invoice detail and delete are tenant scoped
- registration creates a separate organization per signup

What is incomplete today:

- invoice list and upload use mocked auth context instead of the real session
- dashboard page protection is commented out
- middleware is effectively disabled

## 10. Data Model

### Active Firestore collections

#### `organizations`

Observed fields:

- `name`
- `subscriptionPlan`
- `companySize`
- `fleetSize`
- `phone`
- `createdAt`
- `updatedAt`

#### `users`

Observed fields:

- `email`
- `fullName`
- `passwordHash`
- `organizationId`
- `role`
- `emailVerified`
- `verificationToken`
- `createdAt`
- `updatedAt`

#### `userEmails`

Purpose:

- normalized email lookup and uniqueness reservation

Observed fields:

- `userId`
- `email`
- `createdAt`

#### `invoices`

Observed fields:

- `organizationId`
- `uploadedBy`
- `invoiceNumber`
- `vendor`
- `amount`
- `currency`
- `status`
- `fraudScore`
- `filePath`
- `fileName`
- `fileUrl`
- `createdAt`
- `updatedAt`

Status values seen in UI and APIs:

- `uploaded`
- `pending`
- `processed`
- `analyzed`
- `flagged`
- `approved`
- `disputed`
- `paid`

#### `vessels`

Observed fields:

- `id`
- `name`
- `imo`
- `lat`
- `lng`
- `heading`
- `speed`
- `status`
- `nextPort`
- `eta`
- `type`
- `lastUpdated`

#### `alerts`

Written by the Firebase Function.

Observed fields:

- `type`
- `vesselId`
- `vesselName`
- `timestamp`
- `location`
- `severity`
- `status`
- `description`

### Historical or non-active schema

[`supabase/schema.sql`](/Users/antarikshdongare/Desktop/Fathom-main/supabase/schema.sql) defines a PostgreSQL/Supabase schema for:

- organizations
- users
- vessels
- ais_positions
- invoices
- fraud_alerts

This schema does not match the current runtime backend choice. The app is using Firebase, not Supabase. Treat this file as an earlier design artifact unless the team intentionally wants to migrate back.

## 11. End-to-End Feature Flows

### A. Landing page and acquisition flow

Source files:

- [`app/page.tsx`](/Users/antarikshdongare/Desktop/Fathom-main/app/page.tsx)
- [`components/landing-new/LandingUI.tsx`](/Users/antarikshdongare/Desktop/Fathom-main/components/landing-new/LandingUI.tsx)
- [`components/landing-new/ShipSceneNative.tsx`](/Users/antarikshdongare/Desktop/Fathom-main/components/landing-new/ShipSceneNative.tsx)

What happens:

- user lands on a cinematic marketing page
- the background is a custom native Three.js ocean/ship scene
- scroll-driven sections explain platform value, ROI, protocol, pricing, testimonials, etc.
- login is exposed through a modal
- signup CTA routes the user to `/register`
- admin access can be opened through:
  - `Cmd/Ctrl + Shift + K`
  - double-clicking the brand in the navbar

Important implementation detail:

- the active marketing page is the `landing-new` version
- older `components/landing/*` files mostly remain in the repo as legacy assets

### B. Registration flow

Source files:

- [`app/register/page.tsx`](/Users/antarikshdongare/Desktop/Fathom-main/app/register/page.tsx)
- [`components/landing/RegisterForm.tsx`](/Users/antarikshdongare/Desktop/Fathom-main/components/landing/RegisterForm.tsx)
- [`app/api/auth/register/route.ts`](/Users/antarikshdongare/Desktop/Fathom-main/app/api/auth/register/route.ts)

What happens:

- user completes a 3-step form:
  - account info
  - company details
  - plan selection
- the form POSTs JSON to `/api/auth/register`
- if registration succeeds, the UI immediately attempts credential login via NextAuth
- on success, the user is redirected to `/dashboard`

Validation rules:

- valid email required
- password minimum 8 chars
- password must include at least one uppercase letter and one number

Plan values supported:

- `scout`
- `navigator`
- `admiral`
- `trial`

### C. Login flow

Source files:

- [`components/landing-new/LandingUI.tsx`](/Users/antarikshdongare/Desktop/Fathom-main/components/landing-new/LandingUI.tsx)
- [`lib/auth-options.ts`](/Users/antarikshdongare/Desktop/Fathom-main/lib/auth-options.ts)

What happens:

- user submits email and password from modal
- `signIn("credentials")` is called client-side
- NextAuth validates against Firestore
- on success the client pushes to `/dashboard`

### D. Dashboard shell

Source files:

- [`app/dashboard/layout.tsx`](/Users/antarikshdongare/Desktop/Fathom-main/app/dashboard/layout.tsx)
- [`components/dashboard/Sidebar.tsx`](/Users/antarikshdongare/Desktop/Fathom-main/components/dashboard/Sidebar.tsx)
- [`components/dashboard/Header.tsx`](/Users/antarikshdongare/Desktop/Fathom-main/components/dashboard/Header.tsx)

What happens:

- layout renders persistent sidebar and header
- header uses `useSession()` to display user name and email
- sign-out is wired through NextAuth in the header dropdown

Important limitation:

- server-side dashboard auth enforcement is commented out
- users can currently reach dashboard routes more easily than intended in local/testing mode

### E. Invoice workflow

Source files:

- [`app/dashboard/invoices/page.tsx`](/Users/antarikshdongare/Desktop/Fathom-main/app/dashboard/invoices/page.tsx)
- [`components/invoices/UploadInvoiceModal.tsx`](/Users/antarikshdongare/Desktop/Fathom-main/components/invoices/UploadInvoiceModal.tsx)
- [`components/invoices/InvoiceList.tsx`](/Users/antarikshdongare/Desktop/Fathom-main/components/invoices/InvoiceList.tsx)
- [`app/api/invoices/route.ts`](/Users/antarikshdongare/Desktop/Fathom-main/app/api/invoices/route.ts)
- [`app/api/invoices/[id]/route.ts`](/Users/antarikshdongare/Desktop/Fathom-main/app/api/invoices/[id]/route.ts)

List flow:

1. invoices page loads
2. client requests `/api/invoices`
3. API queries Firestore for invoices belonging to the current org context
4. UI maps API response into table rows

Upload flow:

1. user opens upload modal
2. user selects or drags PDF/JPG/PNG
3. client sends `multipart/form-data` to `/api/invoices`
4. API validates:
   - file exists
   - type is supported
   - size is under 10 MB
5. API generates invoice ID and storage path
6. API attempts Firebase Storage upload
7. API writes invoice metadata to Firestore
8. UI prepends the new invoice to local state

Detail flow:

1. invoice detail page requests `/api/invoices/:id`
2. API verifies NextAuth session
3. API verifies invoice belongs to session organization
4. API optionally generates a short-lived signed URL for file download
5. page shows metadata and allows "Generate Dispute"

Deletion flow:

1. user clicks delete from list
2. client calls `DELETE /api/invoices/:id`
3. API verifies session and tenant ownership
4. storage file is deleted
5. Firestore invoice document is deleted

Important reality check:

- upload/list route currently uses mocked organization context
- detail/delete route uses real session context
- that inconsistency must be cleaned up before production use

### F. Fleet tracking workflow

Source files:

- [`app/dashboard/fleet/page.tsx`](/Users/antarikshdongare/Desktop/Fathom-main/app/dashboard/fleet/page.tsx)
- [`components/fleet/FleetMap.tsx`](/Users/antarikshdongare/Desktop/Fathom-main/components/fleet/FleetMap.tsx)
- [`components/fleet/FleetList.tsx`](/Users/antarikshdongare/Desktop/Fathom-main/components/fleet/FleetList.tsx)
- [`components/fleet/AddVesselModal.tsx`](/Users/antarikshdongare/Desktop/Fathom-main/components/fleet/AddVesselModal.tsx)
- [`app/api/mock/fleet/route.ts`](/Users/antarikshdongare/Desktop/Fathom-main/app/api/mock/fleet/route.ts)
- [`functions/src/index.ts`](/Users/antarikshdongare/Desktop/Fathom-main/functions/src/index.ts)

Runtime modes:

1. Firestore realtime mode
   - active when client Firebase env vars exist
   - page subscribes to `vessels` collection with `onSnapshot`

2. mock polling mode
   - fallback when client Firebase config is absent
   - page polls `/api/mock/fleet` every 2 seconds

Add vessel flow:

- in Firestore mode:
  - modal writes directly to `vessels` collection from the client
- in mock mode:
  - modal POSTs to `/api/mock/fleet`

Map behavior:

- uses Mapbox if `NEXT_PUBLIC_MAPBOX_TOKEN` exists
- otherwise renders an explanatory placeholder

### G. Scheduled fleet ingestion and geofencing

Source file:

- [`functions/src/index.ts`](/Users/antarikshdongare/Desktop/Fathom-main/functions/src/index.ts)

This is the closest thing in the repo to an automated risk engine.

Flow:

1. scheduled function runs every 5 minutes
2. fetches fleet feed from `NEXTAUTH_URL + /api/mock/fleet` or localhost fallback
3. writes/upserts vessel positions into Firestore `vessels`
4. evaluates each vessel against a hardcoded polygon near the Suez Canal
5. when a vessel is inside the polygon, creates a Firestore `alerts` document

This gives the product a real async data pipeline, but it is still demo-grade because:

- the data source is a mock API
- the risk zone is hardcoded
- no deduping strategy exists for alert generation beyond timestamped IDs
- there is no alert consumption path wired into the alerts dashboard page yet

### H. Alerts workflow

Source files:

- [`app/dashboard/alerts/page.tsx`](/Users/antarikshdongare/Desktop/Fathom-main/app/dashboard/alerts/page.tsx)
- [`components/alerts/`](/Users/antarikshdongare/Desktop/Fathom-main/components/alerts)

Current behavior:

- alerts page uses in-memory demo alerts
- user can open a detail sheet and mutate alert status locally in React state
- fraud trend chart is static sample data

Important mismatch:

- backend writes real `alerts` documents
- frontend alerts page does not yet read them

### I. Dispute workflow

Source files:

- [`app/dashboard/disputes/page.tsx`](/Users/antarikshdongare/Desktop/Fathom-main/app/dashboard/disputes/page.tsx)
- [`app/dashboard/disputes/[id]/page.tsx`](/Users/antarikshdongare/Desktop/Fathom-main/app/dashboard/disputes/[id]/page.tsx)
- [`components/disputes/GenerateDisputeModal.tsx`](/Users/antarikshdongare/Desktop/Fathom-main/components/disputes/GenerateDisputeModal.tsx)

Current behavior:

- dispute list is mock state
- "Generate Dispute" simulates drafting with a timeout
- detail page is hardcoded against a local `DISPUTES` object
- communication thread is illustrative only

There is no database-backed dispute model yet.

### J. Analytics workflow

Source files:

- [`app/dashboard/analytics/page.tsx`](/Users/antarikshdongare/Desktop/Fathom-main/app/dashboard/analytics/page.tsx)
- [`components/analytics/`](/Users/antarikshdongare/Desktop/Fathom-main/components/analytics)

Current behavior:

- all charts use embedded sample datasets
- no server queries or warehouse integration exist
- page is a design/demo shell for future real analytics

### K. Settings workflow

Source files:

- [`app/dashboard/settings/page.tsx`](/Users/antarikshdongare/Desktop/Fathom-main/app/dashboard/settings/page.tsx)
- [`components/settings/`](/Users/antarikshdongare/Desktop/Fathom-main/components/settings)

Current behavior:

- tabs cover profile, team, API keys, notifications, billing, security
- most actions update local component state only
- no persistence layer is connected

### L. Internal admin workflow

Source files:

- [`app/admin/page.tsx`](/Users/antarikshdongare/Desktop/Fathom-main/app/admin/page.tsx)
- [`app/api/admin/login/route.ts`](/Users/antarikshdongare/Desktop/Fathom-main/app/api/admin/login/route.ts)
- [`app/api/admin/logout/route.ts`](/Users/antarikshdongare/Desktop/Fathom-main/app/api/admin/logout/route.ts)
- [`lib/admin-auth.ts`](/Users/antarikshdongare/Desktop/Fathom-main/lib/admin-auth.ts)

What the admin page does:

- validates admin session cookie server-side
- reads all `users`, `invoices`, and `organizations` from Firestore
- computes totals and processing counts
- lists every user with org and plan info

What it does not do:

- role management
- invoice moderation
- support tooling
- audit logging
- secure credential rotation

## 12. Environment Variables

### Documented in `.env.example`

Source:

- [`/.env.example`](/Users/antarikshdongare/Desktop/Fathom-main/.env.example)

Listed variables:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_STORAGE_BUCKET`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `ADMIN_PANEL_SECRET`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SENDGRID_API_KEY`
- `SENDGRID_FROM_EMAIL`
- `NEXT_PUBLIC_MAPBOX_TOKEN`

### Used by code but missing from `.env.example`

These are needed for live client-side Firebase sync:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Without them:

- client Firebase app does not initialize
- fleet page falls back to polling the mock API

## 13. Deployment Model

### Next.js app

Configured by:

- [`vercel.json`](/Users/antarikshdongare/Desktop/Fathom-main/vercel.json)

Deployment intent:

- Vercel hosts the Next.js app

### Firebase Functions

Configured by:

- [`firebase.json`](/Users/antarikshdongare/Desktop/Fathom-main/firebase.json)

Deployment intent:

- Firebase hosts scheduled workers from the `functions` package

### Local development

Documented commands:

- `npm install`
- `npm run dev`
- `cd functions && npm run build`

There is also a lightweight local script:

- [`test_mvp.mjs`](/Users/antarikshdongare/Desktop/Fathom-main/test_mvp.mjs)
  - tests mock fleet API and invoice upload against a local Next.js server

## 14. Styling and UX System

### Global styling

Files:

- [`app/globals.css`](/Users/antarikshdongare/Desktop/Fathom-main/app/globals.css)
- [`tailwind.config.ts`](/Users/antarikshdongare/Desktop/Fathom-main/tailwind.config.ts)

Design direction:

- dark-first interface
- blue/ocean accent palette
- cinematic landing page
- dashboard glassmorphism and dark panels

Typography:

- `Inter`
- `Cinzel`
- `JetBrains Mono`

Tailwind customizations:

- `ocean` color family
- custom scroll animation
- custom pulse and shimmer animations
- font variables mapped into Tailwind font families

### UI primitive pattern

`components/ui` contains reusable wrappers for:

- button
- card
- dialog
- dropdown
- tabs
- table
- toast
- form controls

This is effectively the internal design system for the app.

## 15. Feature Maturity Matrix

### Production-backed enough to build on

- registration transaction in Firestore
- credential login
- NextAuth session typing
- invoice upload API and storage pathing
- invoice detail and delete with tenant check
- admin panel Firestore reads
- fleet scheduled function

### Partial or inconsistent

- invoice list/upload auth path
- dashboard access protection
- fleet realtime depending on missing public Firebase config
- backend-generated alerts not connected to alerts UI

### Demo-only today

- overview dashboard data
- alerts page data source
- disputes system
- analytics system
- settings persistence
- billing system
- email automation
- OCR and AI fraud pipeline

## 16. Security and Operational Risks

This section is important for any new team taking ownership.

### High risk

- Admin credentials are hardcoded in source in [`lib/admin-auth.ts`](/Users/antarikshdongare/Desktop/Fathom-main/lib/admin-auth.ts).
- Dashboard protection is commented out in [`app/dashboard/layout.tsx`](/Users/antarikshdongare/Desktop/Fathom-main/app/dashboard/layout.tsx).
- Middleware protection is disabled in [`middleware.ts`](/Users/antarikshdongare/Desktop/Fathom-main/middleware.ts).
- `next.config.mjs` ignores TypeScript build errors, which can hide shipping issues.

### Medium risk

- Invoice APIs are inconsistent about auth enforcement.
- Firebase client env vars are not documented alongside server vars.
- Storage upload silently falls back to a mock URL, which can mask misconfiguration.
- Alerts created by Cloud Functions are not deduplicated in a durable business-aware way.

### Low-to-medium structural risk

- repo contains legacy landing components and a stale Supabase schema, which can confuse ownership
- several dependencies exist without active usage, which increases surface area without clear value

## 17. Known Codebase Mismatches and Legacy Artifacts

New teams should know these are present:

- `README.md` describes a production baseline, but the actual repo still has multiple mocked feature areas
- `supabase/schema.sql` is not the active database model
- `components/landing/*` is mostly an older landing system
- `components/dashboard/DashboardContext.tsx` looks like a mock data layer but is not the active app state source
- `functions/lib/index.js` is generated output, not hand-maintained source

## 18. Key Files to Read First

If a new team only has a short ramp-up window, start here:

- [`README.md`](/Users/antarikshdongare/Desktop/Fathom-main/README.md)
- [`package.json`](/Users/antarikshdongare/Desktop/Fathom-main/package.json)
- [`app/page.tsx`](/Users/antarikshdongare/Desktop/Fathom-main/app/page.tsx)
- [`components/landing-new/LandingUI.tsx`](/Users/antarikshdongare/Desktop/Fathom-main/components/landing-new/LandingUI.tsx)
- [`app/api/auth/register/route.ts`](/Users/antarikshdongare/Desktop/Fathom-main/app/api/auth/register/route.ts)
- [`lib/auth-options.ts`](/Users/antarikshdongare/Desktop/Fathom-main/lib/auth-options.ts)
- [`app/api/invoices/route.ts`](/Users/antarikshdongare/Desktop/Fathom-main/app/api/invoices/route.ts)
- [`app/api/invoices/[id]/route.ts`](/Users/antarikshdongare/Desktop/Fathom-main/app/api/invoices/[id]/route.ts)
- [`app/dashboard/fleet/page.tsx`](/Users/antarikshdongare/Desktop/Fathom-main/app/dashboard/fleet/page.tsx)
- [`functions/src/index.ts`](/Users/antarikshdongare/Desktop/Fathom-main/functions/src/index.ts)
- [`app/admin/page.tsx`](/Users/antarikshdongare/Desktop/Fathom-main/app/admin/page.tsx)
- [`middleware.ts`](/Users/antarikshdongare/Desktop/Fathom-main/middleware.ts)

## 19. What a New Team Should Probably Do First

Recommended stabilization sequence:

1. Re-enable proper auth and route protection.
2. Remove hardcoded admin credentials and replace with secret-managed identity.
3. Make all invoice routes use the real NextAuth session consistently.
4. Decide whether Firebase is the long-term backend and delete or archive Supabase artifacts if not needed.
5. Wire the alerts page to real Firestore alerts.
6. Decide whether disputes are database-backed workflow objects or remain generated documents.
7. Replace demo analytics with real aggregation sources.
8. Add tests, CI checks, and stop ignoring TypeScript build errors.

## 20. Plain-English Summary

FATHOM is a Next.js + Firebase maritime fraud-intelligence MVP. The real core is account creation, credential auth, invoice storage, a Firestore-backed admin panel, and a scheduled fleet ingestion function. The rest of the product is presented through a strong UI shell that demonstrates the intended future system, but several pages still run on mock data and commented-out protections.

A new team should treat this repo as:

- a strong product prototype
- a partially real application
- not yet a fully hardened production platform

