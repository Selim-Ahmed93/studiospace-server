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

The API runs at `http://localhost:5000` by default. The browser-facing auth
origin is the client (`http://localhost:3000`), which proxies `/api/*` to this
server; see the client README for its matching `.env.local` values.

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `PORT` | No | Server port (default `5000`) |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `MONGODB_DB` | No | Database name (default `studiospace`) |
| `CLIENT_URL` | Yes | Primary frontend origin allowed by CORS and Better Auth |
| `ADDITIONAL_CLIENT_URLS` | No | Comma-separated extra frontend origins (previews, localhost) |
| `BETTER_AUTH_SECRET` | Yes | Random secret, at least 32 characters |
| `BETTER_AUTH_URL` | Yes | Public frontend origin used to build Auth URLs (see OAuth setup) |
| `GOOGLE_CLIENT_ID` | No | Enables Google login when set with the secret |
| `GOOGLE_CLIENT_SECRET` | No | Enables Google login when set with the client ID |

> Never commit `.env`. Only `.env.example` with placeholders belongs in Git.

## Google OAuth setup

1. Create an OAuth 2.0 Web application in Google Cloud Console.
2. Add the authorized redirect URI. It lives on the **frontend** origin because
   the frontend proxies `/api/*` to this API:
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://studiospace-client-g428.vercel.app/api/auth/callback/google`
3. Set `BETTER_AUTH_URL` to the same frontend origin used above. Better Auth
   builds the OAuth redirect URI from `BETTER_AUTH_URL`, so leaving it set to the
   Render URL produces a cross-origin callback and can drop the state cookie in
   browsers that block third-party cookies.
4. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in the environment.
5. Add the frontend URL to `CLIENT_URL` or `ADDITIONAL_CLIENT_URLS`.
6. **Redeploy the API.** Environment changes alone are not enough when the
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

## Same-origin authentication proxy

The browser does **not** call this API directly. The frontend rewrites
`/api/:path*` to the Render API URL, so browser requests and cookies stay on the
frontend origin. This is required for OAuth: Better Auth's state cookie is set
when sign-in starts and read again on the Google callback. In browsers that
block third-party cookies, a cross-site state cookie is dropped, and Better Auth
correctly fails the callback with `state_mismatch`.

With the proxy in place:

- `BETTER_AUTH_URL` is the public frontend origin, so the Google redirect URI is
  `https://<frontend>/api/auth/callback/google`.
- `CLIENT_URL` is the frontend origin trusted by CORS and Better Auth.
- The API still sets `SameSite=None; Secure` for HTTPS compatibility with direct
  callers; the browser sees those cookies as first-party because of the proxy.
- Local HTTP development keeps `SameSite=Lax`.

Add every frontend origin that should be trusted:

```env
BETTER_AUTH_URL=https://your-frontend.vercel.app
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
- Set `BETTER_AUTH_URL` to the public **frontend** origin, e.g.
  `https://studiospace-client-g428.vercel.app`. Better Auth uses it to build the
  Google redirect URI and auth URLs. The browser reaches this API through the
  frontend's same-origin `/api/*` proxy.
- Set `CLIENT_URL` to the production frontend URL and add any preview URLs to
  `ADDITIONAL_CLIENT_URLS`.
- On Vercel, set `API_PROXY_TARGET` to this Render service URL and leave
  `NEXT_PUBLIC_API_URL` empty.
- Redeploy after changing environment variables or authentication settings.
- Confirm the deployed build is current by calling `GET /api/config` through the
  frontend (or directly); an older build returns an HTML `Cannot GET /api/config`
  page instead of JSON.

### Troubleshooting state_mismatch

If Google login returns `?error=state_mismatch`:

1. In DevTools → Application → Cookies, confirm the frontend origin stores the
   Better Auth state cookie when sign-in starts. If it is missing, the browser
   is blocking it as a third-party cookie: verify the frontend is using the
   same-origin proxy and that `NEXT_PUBLIC_API_URL` is empty.
2. Confirm the Google Cloud **Authorized redirect URI** exactly matches
   `BETTER_AUTH_URL + /api/auth/callback/google`.
3. Confirm `BETTER_AUTH_URL` is the frontend origin, not the Render URL.
4. Confirm `BETTER_AUTH_SECRET` has not changed between starting sign-in and
   completing the callback.
5. Retry in a single tab. Starting a second Google sign-in overwrites the state
   cookie, so the first tab's callback will fail validation.


## License

ISC
