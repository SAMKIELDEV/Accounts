# account.samkiel.tech — PRD & Technical Spec
**Document:** `SAMKIEL-Accounts-PRD.md`
**Version:** 1.0 | April 2026
**Author:** SAMKIEL (Ezekiel)
**Repo:** github.com/SAMKIELDEV/Accounts
**Status:** Ready for Claude Code implementation

---

## 01 — Overview

`account.samkiel.tech` is the user-facing account dashboard for the SAMKIEL platform. It gives users a single place to manage their identity, security, and product access across all SAMKIEL products — similar in spirit to Google's `myaccount.google.com`.

It is a **Next.js app** that talks exclusively to `id.samkiel.tech` via `@samkiel/authsdk`.

---

## 02 — Tech Stack

| Category | Choice |
|----------|--------|
| Framework | Next.js (latest stable, App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Auth | `@samkiel/authsdk` (React + Next subpaths) |
| Icons | Lucide React |
| Toasts | Sonner |
| Animations | Framer Motion |
| Hosting | Render (subdomain: `account.samkiel.tech`) |

---

## 03 — Design System

| Token | Value |
|-------|-------|
| Background | `#0A0A0A` |
| Accent | `#E8FF47` (electric lime) |
| Fonts | Syne or Cabinet Grotesk (NO Inter, Roboto, Space Grotesk) |
| Aesthetic | Dark, sleek, bold, non-generic |

The UI should feel like a premium, intentional product — not a generic dashboard template.

---

## 04 — Pages & Routes

### Public (unauthenticated)

| Route | Page | Description |
|-------|------|-------------|
| `/login` | Login | Email + password login form |
| `/register` | Register | Create account form |
| `/forgot-password` | Forgot Password | Request password reset email |
| `/reset-password` | Reset Password | Set new password via token |
| `/verify-email` | Verify Email | Confirmation screen after email link clicked |

### Protected (authenticated)

| Route | Page | Description |
|-------|------|-------------|
| `/` | Overview | Account summary — name, email, verification status, quick links |
| `/personal-info` | Personal Info | View and update email |
| `/security` | Security | Change password, active sessions, sign out all devices |
| `/products` | Connected Products | SAMKIEL products the user is logged into |
| `/delete-account` | Delete Account | Confirmation flow to permanently delete account |

---

## 05 — Page Specs

### `/` — Overview

The landing page after login. Summarises the account at a glance.

**Sections:**
- User greeting (email, verification badge)
- Quick-action cards linking to each section (Personal Info, Security, Products)
- Account status banner — if email is unverified, show a persistent prompt to verify

---

### `/personal-info` — Personal Info

**Displays:**
- Current email address (read-only display + edit option)

**Actions:**
- **Change email** — input new email → triggers verification email to new address → update on confirmation
  - *Note: requires a new `PATCH /user/email` endpoint on the auth server*

---

### `/security` — Security

**Sections:**

**Password**
- Change password form (current password + new password + confirm)
- Calls `POST /auth/password/change` (add this endpoint to auth server if not present)

**Active Sessions**
- List of all active sessions from the `Session` model on the auth server
- Each session shows: device info, created date, last active
- Current session highlighted
- "Sign out" button per session
- "Sign out all other devices" button

**Calls needed:**
- `GET /user/sessions` — list all sessions for current user
- `DELETE /user/sessions/:id` — revoke a specific session
- `DELETE /user/sessions` — revoke all sessions except current

---

### `/products` — Connected Products

Shows which SAMKIEL products the user has an active session on.

**Display per product:**
- Product name + logo/icon
- Subdomain (e.g. `breezrchat.samkiel.tech`)
- Last active timestamp
- "Sign out of this product" button (revokes that product's session)

**Initial product list (hardcoded for now, dynamic later):**
- BreezrChat — `breezrchat.samkiel.tech`
- SKDL — `skdl.samkiel.tech`

**Implementation note:** Sessions in the `Session` model should store a `product` or `origin` field so they can be filtered by product. If not present, add it to the auth server.

---

### `/delete-account` — Delete Account

Multi-step confirmation flow — never a single click.

**Step 1:** Warning screen — explain what deletion means (all data, all sessions, irreversible)
**Step 2:** Type `DELETE` to confirm
**Step 3:** Enter current password to authenticate the action
**Step 4:** Account deleted → redirected to `samkiel.tech` with a goodbye message

**Auth server endpoint needed:** `DELETE /user/account`

---

## 06 — Auth Server Additions Required

These endpoints need to be added to `id.samkiel.tech` to support this dashboard:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/user/sessions` | GET | List all sessions for current user |
| `/user/sessions/:id` | DELETE | Revoke a specific session |
| `/user/sessions` | DELETE | Revoke all sessions except current |
| `/user/email` | PATCH | Request email change (sends verification) |
| `/user/password` | PATCH | Change password (requires current password) |
| `/user/account` | DELETE | Permanently delete account + all data |

All protected by `authMiddleware`.

---

## 07 — Middleware & Route Protection

```ts
// middleware.ts
import { samkielMiddleware } from '@samkiel/authsdk/next'

export default samkielMiddleware({
  baseUrl: 'https://id.samkiel.tech',
  protectedRoutes: ['/', '/personal-info', '/security', '/products', '/delete-account'],
  loginPage: '/login',
})
```

---

## 08 — Component Structure

```
src/
├── app/
│   ├── layout.tsx              # AuthProvider wrapper, font, global styles
│   ├── page.tsx                # Overview
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── forgot-password/page.tsx
│   ├── reset-password/page.tsx
│   ├── verify-email/page.tsx
│   ├── personal-info/page.tsx
│   ├── security/page.tsx
│   ├── products/page.tsx
│   └── delete-account/page.tsx
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx         # Nav: Overview, Personal Info, Security, Products
│   │   └── TopBar.tsx          # Mobile nav + user avatar
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx           # e.g. "Verified" / "Unverified"
│   │   └── ConfirmDialog.tsx
│   └── sections/
│       ├── SessionCard.tsx
│       └── ProductCard.tsx
├── lib/
│   └── auth.ts                 # SDK client instance
└── middleware.ts
```

---

## 09 — Layout

The authenticated layout uses a **sidebar + main content** structure (like Google Account):

- **Sidebar (desktop):** SAMKIEL logo, nav links, user email at bottom
- **Top bar (mobile):** hamburger + user avatar
- **Main content:** page-specific content, max-width constrained, well-padded

The sidebar is always visible on desktop. On mobile it collapses into a top navigation.

---

## 10 — Implementation Order

**Phase 1 — Project setup**
1. Init Next.js app in `Accounts` repo
2. Install deps: `@samkiel/authsdk`, Tailwind v4, Lucide, Sonner, Framer Motion
3. Configure fonts (Syne / Cabinet Grotesk)
4. Set up `middleware.ts`
5. Build `AuthProvider` wrapper in `layout.tsx`

**Phase 2 — Auth pages (public)**
6. `/login`
7. `/register`
8. `/forgot-password` + `/reset-password`
9. `/verify-email`

**Phase 3 — Layout shell**
10. Sidebar component
11. TopBar (mobile)
12. Authenticated layout wrapper

**Phase 4 — Dashboard pages**
13. `/` Overview
14. `/personal-info`
15. `/security` (password change + sessions)
16. `/products`
17. `/delete-account`

**Phase 5 — Auth server additions**
18. Add missing endpoints to `id.samkiel.tech` (sessions CRUD, email change, password change, delete account)
19. Redeploy auth server

**Phase 6 — Deploy**
20. Deploy to Render
21. Point `account.samkiel.tech` subdomain

---

## 11 — Environment Variables

```env
NEXT_PUBLIC_AUTH_URL=https://id.samkiel.tech
```

---

*SAMKIEL | hello@samkiel.tech | samkiel.tech*
*Confidential — Internal Use Only*