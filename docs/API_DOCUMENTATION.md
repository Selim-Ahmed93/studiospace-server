# StudioSpace API Documentation

Base URL (production): `https://studiospace-server-7gad.onrender.com`

All responses are JSON. Protected routes use the Better Auth session cookie. Missing or invalid sessions receive `401`.

## Response conventions

Success:

```json
{
  "success": true,
  "message": "Studios fetched successfully",
  "studios": [],
  "pagination": {
    "totalStudios": 0,
    "currentPage": 1,
    "totalPages": 0,
    "limit": 12
  }
}
```

Error:

```json
{
  "success": false,
  "message": "This studio is already booked for the selected time"
}
```

Validation error (`400`):

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "body.hourlyRate", "message": "Hourly rate cannot be negative" }
  ]
}
```

## Health

### `GET /api/health`

Returns the API status.

```json
{
  "success": true,
  "message": "StudioSpace API is running successfully!"
}
```

## Authentication

Better Auth is mounted at `/api/auth/*`. The frontend uses `better-auth/react`.

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/auth/sign-up/email` | Create an account with name, email, password, optional image |
| `POST` | `/api/auth/sign-in/email` | Email/password login |
| `POST` | `/api/auth/sign-in/social` | Social login (`provider: "google"` when configured) |
| `GET` | `/api/auth/get-session` | Current session and user |
| `POST` | `/api/auth/sign-out` | Clear the session |

## Studios

### `GET /api/studios`

Public list with filtering, search, and pagination. Results are sorted newest first.

Query parameters:

| Parameter | Type | Notes |
|---|---|---|
| `category` | string | One of the five studio categories |
| `city` | string | Case-insensitive partial match |
| `search` | string | Matches title, overview, or city |
| `minPrice` | number | Minimum hourly rate |
| `maxPrice` | number | Maximum hourly rate |
| `page` | number | Default `1` |
| `limit` | number | Default `12`, maximum `100` (service caps at `50`) |

Categories:

- `Photography Studio`
- `Sound Stage`
- `Podcast Room`
- `Music Studio`
- `Art Workshop`

### `GET /api/studios/:id`

Returns one studio. Invalid IDs return `400`; missing studios return `404`.

### `POST /api/studios` 🔒

Creates a studio owned by the authenticated user. Owner fields are set by the server from the session and cannot be overridden by the client.

Request body:

```json
{
  "title": "Lumen Photography Loft",
  "category": "Photography Studio",
  "hourlyRate": 45,
  "securityDeposit": 100,
  "maxCapacity": 8,
  "location": {
    "address": "12 Gulshan Avenue",
    "city": "Dhaka",
    "country": "Bangladesh"
  },
  "images": ["https://example.com/studio.jpg"],
  "amenities": ["Lighting", "Backdrop", "Wi-Fi"],
  "overview": "A daylight photography loft with a cyclorama and blackout curtains."
}
```

### `PATCH /api/studios/:id` 🔒

Updates a studio. The authenticated user must be the owner. Only editable studio fields are accepted.

### `DELETE /api/studios/:id` 🔒

Deletes a studio owned by the authenticated user. Returns `409` when the studio has pending or confirmed bookings.

## Bookings

All booking routes require authentication.

### `POST /api/bookings` 🔒

Creates a booking with status `Pending`.

Request body:

```json
{
  "studioId": "507f1f77bcf86cd799439011",
  "bookingDate": "2026-12-15",
  "startTime": "10:00",
  "endTime": "13:00"
}
```

Rules:

- Date format: `YYYY-MM-DD`
- Time format: `HH:mm` (24-hour)
- Minimum duration: 1 hour
- The server calculates `totalHours`, `hourlyRate`, and `totalAmount`.
- Overlapping **Confirmed** bookings return `409`.
- Booking your own studio returns `403`.

### `GET /api/bookings/my-bookings` 🔒

Returns the authenticated user's bookings, newest first, with the studio populated:

```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "studioId": {
        "_id": "...",
        "title": "Lumen Photography Loft",
        "category": "Photography Studio",
        "location": { "city": "Dhaka", "country": "Bangladesh" },
        "images": ["..."]
      },
      "bookingDate": "2026-12-15T00:00:00.000Z",
      "startTime": "10:00",
      "endTime": "13:00",
      "totalHours": 3,
      "hourlyRate": 45,
      "totalAmount": 135,
      "status": "Pending"
    }
  ]
}
```

### `GET /api/bookings/host-bookings` 🔒

Returns bookings for studios owned by the authenticated host.

### `GET /api/bookings/:id` 🔒

Returns one booking if the authenticated user is the creator or the host.

### `PATCH /api/bookings/:id/confirm` 🔒

Confirms a pending booking. Only the studio host can confirm. Returns `409` if the slot is already confirmed for another booking.

### `PATCH /api/bookings/:id/cancel` 🔒

Cancels a pending or confirmed booking. The authenticated user must be the creator or the host.

## Status codes

| Code | Meaning |
|---|---|
| `200` | Success |
| `201` | Created |
| `400` | Validation error or invalid ID |
| `401` | Missing or invalid session |
| `403` | Authenticated but not allowed |
| `404` | Resource or route not found |
| `409` | Booking conflict or studio deletion blocked |
| `500` | Internal server error |
