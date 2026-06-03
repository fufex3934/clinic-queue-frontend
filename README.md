# Clinic Queue — Frontend

Next.js 16 App Router UI for the clinic queue SaaS. Dev server: **port 3001** (`pnpm dev`).

## Setup

```bash
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:4000
pnpm install
pnpm dev
```

## Architecture

- **Auth:** httpOnly cookie + localStorage token for API/WebSocket; BFF at `/api/backend/*`
- **Active clinic:** `ClinicContext` — single source for platform admin operational scope
- **Clinic settings:** `activeClinic` drives booking slots and per-slot capacity (from API, not hardcoded)
- **Realtime:** Socket.IO `/realtime` — queue hooks + `useRealtimeAppointments`

## Key routes

| Path | Role |
|------|------|
| `/dashboard` | Overview & analytics |
| `/dashboard/patients` | Patient registry |
| `/dashboard/queue` | Queue management |
| `/dashboard/appointments` | Schedule by date |
| `/dashboard/appointments/book` | Book appointment |
| `/dashboard/admin` | Clinic & staff administration |
| `/dashboard/billing` | Clinic admin billing |
| `/dashboard/admin/payments` | Platform payment approval + MRR |
| `/dashboard/admin/users` | Platform-wide user directory |

## Testing

```bash
pnpm test:e2e          # Playwright smoke tests (starts dev server if needed)
pnpm exec playwright install chromium  # first-time browser install
```

## Roles

- `admin` — clinic administrator
- `receptionist` — front desk
- `platform_admin` — multi-tenant operator

See `lib/permissions.ts` for nav and route guards.
