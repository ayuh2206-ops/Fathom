# FATHOM MVP (Vercel + Firebase)

This codebase is now configured for:
- `Next.js 14` (App Router) on `Vercel`
- `NextAuth` (credentials) for session management
- `Firebase Firestore` for multi-tenant app data
- `Firebase Storage` for invoice file ingestion

## 1. Prerequisites

- Node.js `20+`
- npm `10+`
- A Firebase project (Firestore + Storage enabled)

## 2. Install dependencies

```bash
npm install
```

## 3. Configure environment

Create `.env.local` from `.env.example` and set:

```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-strong-random-secret

STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=
NEXT_PUBLIC_MAPBOX_TOKEN=
```

## 4. Firebase setup checklist

1. Create Firebase project.
2. Enable Firestore (Native mode).
3. Enable Cloud Storage.
4. Create a service account key from Firebase console.
5. Copy service account fields into env vars:
   - `project_id -> FIREBASE_PROJECT_ID`
   - `client_email -> FIREBASE_CLIENT_EMAIL`
   - `private_key -> FIREBASE_PRIVATE_KEY` (keep newlines escaped as `\n`)
6. Set `FIREBASE_STORAGE_BUCKET` from project settings.

## 5. Run locally

```bash
npm run dev
```

## 6. API routes currently implemented

- `POST /api/auth/register`
  - Creates organization + owner user in Firestore transaction.
  - Enforces unique email with `userEmails/{normalizedEmail}` reservation doc.
- `GET|POST /api/auth/[...nextauth]`
  - Credentials login against Firestore `users`.
- `GET /api/invoices`
  - Returns invoices for current organization.
- `POST /api/invoices`
  - Authenticated multipart upload.
  - Saves file to Firebase Storage and metadata to Firestore.
- `GET /api/invoices/:id`
  - Returns single invoice (tenant-scoped).
- `DELETE /api/invoices/:id`
  - Deletes invoice metadata + file (tenant-scoped).

## 7. Collections used

- `organizations/{orgId}`
- `users/{userId}`
- `userEmails/{normalizedEmail}` (unique email index)
- `invoices/{invoiceId}`

## 8. Route protection

- `middleware.ts` protects:
  - `/dashboard/*`
  - `/api/invoices/*`
- `app/dashboard/layout.tsx` also enforces server-side session check.

## 9. Deploy to Vercel

1. Push repo to GitHub.
2. Import project in Vercel.
3. Set all environment variables from `.env.local` in Vercel project settings.
4. Deploy.
5. Set `NEXTAUTH_URL` to your production domain.

## 10. Notes

- This is a production baseline MVP for auth + invoice ingestion + tenant isolation.
- Dispute automation, OCR orchestration, AIS verification, and tariff pipelines should run as async workers behind queue/event triggers (recommended next phase).
