# SchoolFix AI

This repository contains a Vite + React frontend and a Go API backend.

## Start the backend

```bash
cd server
go run .
```

The API listens on `http://localhost:8080/api` by default.

## Start the frontend

```bash
cd client
npm install
npm run dev -- --host 0.0.0.0
```

The UI will attempt to call the Go backend if it is running; otherwise it falls back to the browser-based mock data.

## Backend endpoints

- `POST /api/login`
- `POST /api/accounts`
- `GET /api/issues`
- `POST /api/issues`
- `GET /api/issues/:id`
- `PATCH /api/issues/:id`
- `GET /api/users`
- `POST /api/users`
- `GET /api/categories`
- `POST /api/categories`
- `DELETE /api/categories/:id`
- `GET /api/teams`
- `POST /api/teams`
- `DELETE /api/teams/:id`
- `GET /api/notifications`
- `PATCH /api/notifications/:id`
- `DELETE /api/notifications/:id`
- `GET /api/settings`
- `PUT /api/settings`
- `POST /api/reset-demo-data`

## Default demo login

Email and password are matched against the demo accounts in the seed data.

- Email: `maria.santos@school.demo`
- Password: `demo1234`

You can also create a new account with `POST /api/accounts`.
