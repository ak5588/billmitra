# BillMitra Server

This folder contains the Express + TypeScript backend for BillMitra.

Requirements
- Node.js 18+ (or compatible)
- Local MongoDB running on default port or set `MONGO_URI`

Setup
1. Copy `.env.example` to `.env` and fill in values (see below).
2. From the `server` folder run:

```powershell
npm install
npm run dev
```

Environment variables (in `.env`)
- `MONGO_URI` (e.g. `mongodb://localhost:27017/billmitra`)
- `JWT_SECRET` (strong secret for signing tokens)
- `PORT` (optional, default 5000)
- `CLIENT_URL` (frontend origin, e.g. `http://localhost:3000`)

API Endpoints
- `POST /auth/signup` { name, email, password } → { token, user }
- `POST /auth/login` { email, password } → { token, user }
- `POST /invoice/create` (auth) invoice body → saved invoice
- `GET /invoice/all` (auth) → invoices[]
- `GET /invoice/:id` (auth) → invoice
- `DELETE /invoice/:id` (auth) → { message }
