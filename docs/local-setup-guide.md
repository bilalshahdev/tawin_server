# Local Setup Guide

This guide walks you through running the **Tawin** project locally end-to-end (backend + frontend) on your laptop. Should take around 10 minutes.

---

## Prerequisites (one-time)

1. **Node.js v20 LTS** — install from <https://nodejs.org> (this also installs `npm`).
2. **Git** — should already be installed; if not: <https://git-scm.com>.
3. No need to install MongoDB locally — a hosted MongoDB URI will be shared with you privately. Just paste it into the `.env` file in the step below.

Verify Node and npm are installed by running these in a terminal / PowerShell:

```bash
node -v   # should print v20.x or higher
npm -v
```

---

## Step 1 — Backend

Clone the backend repository:

```bash
git clone <BACKEND_REPO_URL>
cd <backend-folder>
```

1. Create a file named `.env.development` in the project root.
2. Paste the contents shared with you privately (Mongo URI, JWT secret, mail credentials, etc.).
3. Install dependencies:

   ```bash
   npm install
   ```

4. Run the dev server:

   ```bash
   npm run dev
   ```

If everything is fine, the terminal will show something like `Server running on port 3520` and `Database connected`.

Keep this terminal open. The backend is now live at:

- API base: <http://localhost:3520>
- Swagger docs (handy for testing): <http://localhost:3520/api-docs>

---

## Step 2 — Frontend (open a NEW terminal)

Clone the frontend repository:

```bash
git clone <FRONTEND_REPO_URL>
cd <frontend-folder>
```

1. Create a file named `.env.local` in the project root.
2. Paste the contents shared with you privately. The key value is:

   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3520/api
   ```

   Adjust the port if your backend ended up on a different one.

3. Install + run:

   ```bash
   npm install
   npm run dev
   ```

The frontend will open at <http://localhost:3000> (or the next available port — the terminal will tell you).

---

## Troubleshooting

### Port 3520 already in use
Change `PORT=` in `.env.development` to e.g. `4000`, restart the backend, and update the frontend's `NEXT_PUBLIC_API_BASE_URL` to match.

### TypeScript errors on `npm run dev`
Try a clean install:

**macOS / Linux:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Windows PowerShell:**
```powershell
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```

### "Cannot find module ..." or unexpected type errors
Make sure you're on **Node v20 or newer**. On older Node versions some dependencies don't resolve cleanly.

### MongoDB connection fails
- Double-check the Mongo URI in `.env.development` is pasted exactly (no extra spaces, no quotes around it).
- Confirm your laptop has internet access (it's a hosted cluster, not a local DB).

### CORS errors from the frontend
- Confirm the backend is actually running.
- Confirm the URL in `NEXT_PUBLIC_API_BASE_URL` matches the backend port.

### Frontend 401 / 403 errors
The API requires a JWT for most endpoints. Make sure you've registered or logged in through the frontend — the token is set automatically once you sign in.

### Multer / file-upload issues
The backend writes uploaded files into `uploads/` at the project root. The folder is created automatically on first upload, but make sure your terminal user has write permission for the project directory.

---

## Project ports — quick reference

| Service  | Default URL                          |
|----------|--------------------------------------|
| Backend  | <http://localhost:3520>              |
| Swagger  | <http://localhost:3520/api-docs>     |
| Frontend | <http://localhost:3000>              |

---

## Need help?

If anything trips up, ping me with a copy of the terminal output and I'll guide you through it.
