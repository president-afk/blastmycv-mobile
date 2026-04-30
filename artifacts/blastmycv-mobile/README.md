# BlastMyCV Mobile App

A React Native / Expo mobile client for the [BlastMyCV.com](https://blastmycv.com) platform.

## Architecture

This app is a **pure mobile client** — it does NOT have its own database or backend.
All data comes from the existing BlastMyCV.com backend API.

## API Connection

The app connects to the BlastMyCV production API:

```
API_BASE_URL = https://blastmycv.com
```

This is configured via the environment variable:

```
EXPO_PUBLIC_API_BASE_URL=https://blastmycv.com
```

Set in `.env` and `.env.local` for local development overrides.

## What Shares with BlastMyCV.com

| Feature | Shared with BlastMyCV.com |
|---|---|
| Authentication | Yes — same login/register endpoints |
| User Accounts | Yes — same user records |
| Recruiter/Employer Accounts | Yes — same recruiter records |
| CV Uploads | Yes — same CV storage |
| Packages | Yes — same package catalog |
| Orders | Yes — same order records |
| Notifications | Yes — same notification system |
| Database | Yes — single shared database |

## API Endpoints Used

The app uses these REST endpoints from BlastMyCV.com:

| Endpoint | Purpose |
|---|---|
| `POST /api/auth/login` | User login |
| `POST /api/auth/register` | User registration |
| `GET /api/auth/profile` | Fetch user profile |
| `PUT /api/auth/profile` | Update user profile |
| `GET /api/cv` | List uploaded CVs |
| `POST /api/cv/upload` | Upload a CV document |
| `DELETE /api/cv/:id` | Delete a CV |
| `GET /api/packages` | List available packages |
| `POST /api/orders` | Create a new order / purchase |
| `GET /api/orders` | List user orders |
| `GET /api/orders/stats` | Order statistics |
| `GET /api/dashboard/stats` | Dashboard summary stats |
| `GET /api/notifications` | List notifications |
| `POST /api/notifications/:id/read` | Mark notification read |
| `POST /api/notifications/read-all` | Mark all notifications read |

> If the exact endpoint paths differ from your backend, update the paths in `services/`.

## API Service Layer

All API calls go through a clean service layer in `services/`:

- `services/api.ts` — Base fetch with JWT auth, error handling, file uploads
- `services/auth.ts` — Login, register, profile management
- `services/cv.ts` — CV upload and management
- `services/packages.ts` — Package listing and purchase
- `services/orders.ts` — Order tracking and statistics
- `services/notifications.ts` — Notifications management

## Authentication

- JWT token stored securely in `AsyncStorage`
- Token automatically included in all API requests via `Authorization: Bearer <token>`
- Same token/session system as the web app (if the backend supports shared tokens)

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `EXPO_PUBLIC_API_BASE_URL` | Base URL for the BlastMyCV API | `https://blastmycv.com` |

## Running Locally

```bash
# Install dependencies
pnpm install

# Start the Expo dev server
pnpm run dev

# Scan the QR code in Expo Go to test on your phone
```

## Screens

- **Dashboard** — Overview stats, recent orders, quick actions
- **My CV** — Upload and manage CV documents
- **Packages** — Browse and purchase CV blast packages
- **Orders** — Track order history and status
- **Notifications** — View account activity and alerts
- **Profile** — Account info and settings

## Notes

- This app does NOT create a new database or backend
- All data is shared with the existing BlastMyCV.com platform
- Purchase flows redirect to `blastmycv.com` for payment if needed
- The app is read/write — changes made here reflect on the web platform
