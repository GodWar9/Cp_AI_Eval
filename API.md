# CP Tracker API Documentation

Base URL: `http://localhost:3001/api`

## Authentication

All protected routes require a JWT token in the `Authorization` header:
`Authorization: Bearer <access_token>`

### `POST /api/auth/register`
Register a new user.
- **Body:** `{ "email": "user@example.com", "password": "password123", "displayName": "User" }`
- **Response:** `{ "accessToken": "ey..." }` (Sets HttpOnly `refreshToken` cookie)

### `POST /api/auth/login`
Log in an existing user.
- **Body:** `{ "email": "user@example.com", "password": "password123" }`
- **Response:** `{ "accessToken": "ey..." }` (Sets HttpOnly `refreshToken` cookie)

### `POST /api/auth/refresh`
Refresh the access token.
- **Headers:** Requires valid HttpOnly `refreshToken` cookie.
- **Response:** `{ "accessToken": "ey..." }`

### `POST /api/auth/logout`
Log out and revoke refresh token.
- **Headers:** Requires valid HttpOnly `refreshToken` cookie.
- **Response:** `{ "message": "Logged out successfully" }`

---

## Profile

### `GET /api/profile/me`
Get the authenticated user's full profile and settings.
- **Headers:** `Authorization: Bearer <access_token>`
- **Response:** User object with linked platforms and CQI score.

### `PATCH /api/profile/me/platforms`
Update the user's linked CP handles.
- **Headers:** `Authorization: Bearer <access_token>`
- **Body:** `{ "codeforces": "tourist", "leetcode": "alex" }`
- **Response:** `{ "message": "Platforms updated successfully" }`

### `GET /api/profile/:userId`
Get a public user profile.
- **Response:** Public user data, avatar, CQI score, and linked platforms.

### `GET /api/profile/:userId/submissions`
Get a user's recent submissions (used for the heatmap). Use `me` for the authenticated user.
- **Response:** Array of submissions sorted by date descending.

---

## Leaderboard & Contests

### `GET /api/leaderboard`
Get the global leaderboard ranked by CQI.
- **Query Params:** `?page=1&limit=50`
- **Response:** `{ "data": [{ rank, id, name, score }], "meta": { ... } }`

### `GET /api/contests`
Get upcoming and recently ended contests from Codeforces, LeetCode, and AtCoder.
- **Response:** Array of contests sorted by start time.

---

## AI Chatbot

### `GET /api/chat/conversations`
Get the user's conversation history.
- **Headers:** `Authorization: Bearer <access_token>`
- **Response:** Array of conversations.

### `POST /api/chat/conversations`
Create a new chat conversation.
- **Headers:** `Authorization: Bearer <access_token>`
- **Body:** `{ "title": "New Chat" }`
- **Response:** The new conversation object.

### `GET /api/chat/conversations/:id`
Get a specific conversation including all messages and attachments.
- **Headers:** `Authorization: Bearer <access_token>`
- **Response:** Conversation object with `messages` array.

### `POST /api/chat/conversations/:id/messages`
Send a message and get an AI response.
- **Headers:** `Authorization: Bearer <access_token>`
- **Body:** `{ "content": "How do I reverse a binary tree?" }`
- **Response:** The assistant's response message object.

### `POST /api/chat/conversations/:id/attachments`
Upload a file to the conversation context.
- **Headers:** `Authorization: Bearer <access_token>` (Note: `Content-Type: multipart/form-data`)
- **Body:** Form data containing `file`.
- **Response:** Attachment object containing extracted summary.

---

## WebSocket Events

Connect to `http://localhost:3001` via Socket.IO.

### `contest:update`
Emitted when a contest's status changes (e.g., `upcoming` -> `live`).
- **Payload:** Contest object.
