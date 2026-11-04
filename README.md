# StudioSpace Server

REST API for **StudioSpace**, a peer-to-peer creative workspace and production studio sharing platform. It handles authentication, studio listings, bookings, and double-booking prevention.

## Live API

- Base URL: https://studiospace-server-7gad.onrender.com
- Health check: https://studiospace-server-7gad.onrender.com/api/health
- Studios: https://studiospace-server-7gad.onrender.com/api/studios

## Features

- Email/password authentication with Better Auth and HTTP-only session cookies.
- Optional Google social login (enabled when OAuth credentials are configured).
- Protected studio and booking routes with `401 Unauthorized` responses.
- Studio CRUD with owner-only update/delete.
- Booking creation with server-side price calculation.
- Double-booking prevention against overlapping **Confirmed** bookings.
- Creator "My Bookings", host bookings, confirm and cancel endpoints.
- MongoDB Atlas persistence with Mongoose models and Zod request validation.
- JSON error responses for validation, authorization, conflicts, and unknown routes.

## Technology stack

- Node.js + Express 5
- MongoDB Atlas + Mongoose
- Better Auth + MongoDB adapter
- Zod validation
- Helmet, CORS
- Render deployment

## Local setup

```bash
npm install
cp .env.example .env
# Fill in the values in .env
npm run dev
```

The API runs at `http://localhost:5000` by default.

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `PORT` | No | Server port (default `5000`) |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `MONGODB_DB` | No | Database name (default `studiospace`) |
| `CLIENT_URL` | Yes | Primary frontend origin allowed by CORS and Better Auth |
| `ADDITIONAL_CLIENT_URLS` | No | Comma-separated extra frontend origins (previews, localhost) |
| `BETTER_AUTH_SECRET` | Yes | Random secret, at least 32 characters |
| `BETTER_AUTH_URL` | Yes | Public URL of this API |
| `GOOGLE_CLIENT_ID` | No | Enables Google login when set with the secret |
| `GOOGLE_CLIENT_SECRET` | No | Enables Google login when set with the client ID |

> Never commit `.env`. Only `.env.example` with placeholders belongs in Git.

## Google OAuth setup

1. Create an OAuth 2.0 Web application in Google Cloud Console.
2. Add the authorized redirect URI:
   - Local: `http://localhost:5000/api/auth/callback/google`
   - Production: `https://studiospace-server-7gad.onrender.com/api/auth/callback/google`
3. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in the environment.
4. Add the frontend URL to `CLIENT_URL` or `ADDITIONAL_CLIENT_URLS`.
5. **Redeploy the API.** Environment changes alone are not enough when the
   running build predates the Google provider code.

Google login is disabled automatically when either credential is missing or
blank.

### Verify that Google is actually enabled

After a redeploy, check these three things:

1. The startup log prints `🔐 Google OAuth provider: enabled`. It never prints
   the credential values.
2. `GET /api/config` returns:

   ```json
   { "success": true, "data": { "googleAuthEnabled": true, "providers": ["google"] } }
   ```

3. `POST /api/auth/sign-in/social` with `{ "provider": "google" }` returns a
   Google authorization URL instead of `PROVIDER_NOT_FOUND`.

If the log says `disabled` while the credentials exist in the dashboard, confirm
that the variables are in the environment group used by the deployed service,
that their names are exactly `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, and
that the values are not empty. Values are trimmed by `src/config/env.js`.

## Cross-site authentication notes

When the API and frontend are on different domains (for example Render + Vercel), HTTPS deployments use `SameSite=None; Secure` cookies so the browser can send the session cookie cross-site. Local HTTP development uses `SameSite=Lax`.

Add every frontend origin that should be trusted:

```env
CLIENT_URL=https://your-frontend.vercel.app
ADDITIONAL_CLIENT_URLS=http://localhost:3000
```

## API routes

### Authentication

| Method | Route | Access |
|---|---|---|
| `GET` | `/api/config` | Public capability flags (never secrets) |
| `POST` | `/api/auth/sign-up/email` | Public |
| `POST` | `/api/auth/sign-in/email` | Public |
| `POST` | `/api/auth/sign-in/social` | Public (when provider configured) |
| `GET` | `/api/auth/get-session` | Public |
| `POST` | `/api/auth/sign-out` | Authenticated |

### Studios

| Method | Route | Access |
|---|---|---|
| `GET` | `/api/studios` | Public |
| `GET` | `/api/studios/:id` | Public |
| `POST` | `/api/studios` | Authenticated |
| `PATCH` | `/api/studios/:id` | Owner only |
| `DELETE` | `/api/studios/:id` | Owner only |

Supported studio query parameters: `category`, `city`, `search`, `minPrice`, `maxPrice`, `page`, `limit`.

### Bookings

| Method | Route | Access |
|---|---|---|
| `POST` | `/api/bookings` | Authenticated |
| `GET` | `/api/bookings/my-bookings` | Authenticated |
| `GET` | `/api/bookings/host-bookings` | Authenticated host |
| `GET` | `/api/bookings/:id` | Booking participant |
| `PATCH` | `/api/bookings/:id/confirm` | Booking host |
| `PATCH` | `/api/bookings/:id/cancel` | Booking participant |

## Booking rules

- A booking is created with status `Pending`.
- The server calculates `totalHours`, `hourlyRate`, and `totalAmount`.
- A new booking is rejected with `409` when it overlaps an existing **Confirmed** booking for the same studio, date, and time range.
- Owners cannot book their own studios.
- A studio with pending or confirmed bookings cannot be deleted.

## Testing

The repository includes booking validation and service test scripts:

```bash
node scripts/test-booking-validator.js
node scripts/test-booking-service.js
```

## Deployment

- Hosted on Render.
- Set all environment variables in the Render dashboard.
- Set `BETTER_AUTH_URL` to the public **HTTPS** Render URL. The cookie mode is
  derived from this value: HTTPS enables `SameSite=None; Secure` for cross-site
  Vercel ↔ Render sessions; HTTP keeps `SameSite=Lax` for local development.
- Set `CLIENT_URL` to the production frontend URL and add any preview URLs to `ADDITIONAL_CLIENT_URLS`.
- Redeploy after changing environment variables or authentication settings.
- Confirm the deployed build is current by calling `GET /api/config`; an older
  build returns an HTML `Cannot GET /api/config` page instead of JSON.

### Troubleshooting cross-site login

If email/password sign-in succeeds but the browser is sent back to
`/login?redirect=...`:

1. Open DevTools → Network → the `sign-in/email` response.
2. Inspect the `Set-Cookie` header for the session token. It must contain
   `SameSite=None` and `Secure` in production.
3. If it contains `SameSite=Lax`, either the deployed build predates the
   cross-site cookie support or `BETTER_AUTH_URL` is not an HTTPS URL.
4. Redeploy the latest backend and sign in again.


## License

ISC
