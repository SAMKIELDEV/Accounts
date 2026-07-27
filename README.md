# SAMKIEL Accounts

The official central account management portal for SAMKIEL services, built with Next.js 16, React 19, TailwindCSS v4, and `@samkiel/authsdk`.

## Overview

**SAMKIEL Accounts** (`accounts`) provides users with a unified dashboard to manage their personal profile, security credentials, active sessions, privacy preferences, and connected SAMKIEL ecosystem applications. Authentication and token lifecycle management are powered by `@samkiel/authsdk` and integrated with SAMKIEL ID (`id.samkiel.tech`).

---

## Features

- **Centralized Authentication**:
  - Sign in, registration, email verification, password recovery/reset, and OAuth support.
- **Account Overview & Profile Management**:
  - Update personal information (display name, email, avatar).
  - Manage security settings, active sessions, and password credentials.
  - View connected SAMKIEL products and service permissions.
  - Privacy controls and account deletion options.
- **Automated Token Lifecycle**:
  - Edge/middleware-assisted silent access token refresh (`sk_access_token` and `sk_refresh_token`).
  - Unified client-side auth state protection via `<AccountGuard>`.

---

## Tech Stack & Architecture

- **Framework**: Next.js 16 (App Router)
- **UI & Styling**: React 19, TailwindCSS v4, Framer Motion, Lucide Icons, Sonner (Toast notifications)
- **Authentication**: `@samkiel/authsdk`, `jose` (JWT decoding/validation)
- **Language**: TypeScript 5

---

## Project Structure

```
Accounts/
├── app/
│   ├── (account)/          # Protected account management routes
│   │   ├── page.tsx        # Account Overview page
│   │   ├── personal-info/  # Profile & personal details management
│   │   ├── security/       # Security, password & session management
│   │   ├── products/       # Connected SAMKIEL products
│   │   ├── privacy/        # Privacy preferences
│   │   └── delete-account/ # Account removal page
│   ├── (auth)/             # Public authentication routes
│   │   ├── login/          # Login page
│   │   ├── register/       # Registration page
│   │   ├── verify-email/   # Email verification page
│   │   ├── forgot-password/# Password recovery request page
│   │   └── reset-password/ # Password reset page
│   ├── dashboard/          # Dashboard views
│   ├── layout.tsx          # Root layout and theme providers
│   └── globals.css         # Styling entry point
├── components/
│   ├── layout/             # TopBar, Navbar, Sidebar, Footer components
│   ├── ui/                 # Reusable UI primitives
│   ├── AccountGuard.tsx    # Auth route guard wrapper
│   └── SessionRefresher.tsx# Opportunistic session refresher
├── lib/
│   ├── auth.ts             # Auth SDK configuration
│   ├── datetime.ts         # Date and time formatting helpers
│   └── nav.ts              # Navigation item definitions
└── proxy.ts                # Next.js middleware for token handling
```

---

## Getting Started

### Prerequisites

- **Node.js**: v18.x or later
- **npm** (or preferred package manager)
- SAMKIEL ID server endpoint (`https://id.samkiel.tech`)

### Environment Variables

Configure environment variables in a `.env` or `.env.local` file:

```env
NEXT_PUBLIC_AUTH_URL=https://id.samkiel.tech
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```

### Installation & Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Scripts

- `npm run dev`: Start Next.js development server
- `npm run build`: Build production application
- `npm run start`: Start production server
- `npm run lint`: Run ESLint checks

---

## License

Private codebase — SAMKIEL. All rights reserved.
