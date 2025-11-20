<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1EJB1cL9ksYhS0GrPnkW2N2HwKfb2al8I

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Backend (Express + MongoDB)

The project now includes a backend in the `server` folder that provides authentication and invoice persistence using MongoDB.

Quick start (from workspace root):

```powershell
cd server
npm install
copy .env.example .env
# Edit .env to set a strong JWT_SECRET if desired
npm run dev
```

Default backend values (in `server/.env.example`):
- `MONGO_URI` = `mongodb://localhost:27017/billmitra`
- `JWT_SECRET` = change this to a strong secret
- `PORT` = `5000`
- `CLIENT_URL` = `http://localhost:3000`

API endpoints are documented in `server/README.md`.
