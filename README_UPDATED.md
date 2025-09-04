
# Live Polling System — with Extended Student Details

This project contains a React (Vite) client and an Express + Socket.IO server.

We've updated the student onboarding to collect more details:
- **Name** (required)
- **Roll No** (required)
- **Class** (e.g., "3rd Year CSE")
- **Section**
- **Email** (optional)

Teachers can view a live table of all connected students (name, roll, class, section, email) and run polls with timers.

---

## Prerequisites
- Node.js 18+ and npm

## 1) Start the Server
```bash
cd server
npm install
npm run dev     # runs on http://localhost:4000
```
(You can also `npm start` without autoreload.)

## 2) Start the Client
```bash
cd ../client
npm install
# set the server URL (optional; defaults to http://localhost:4000)
echo VITE_SERVER_URL=http://localhost:4000 > .env
npm run dev     # open the shown http://localhost:5173 (or similar)
```

### Windows (PowerShell) One‑Click
```powershell
# From repository root:
cd server; npm install; npm run dev
# Open a NEW PowerShell tab in the same folder:
cd ..\client; npm install; Set-Content -Path .env -Value "VITE_SERVER_URL=http://localhost:4000"; npm run dev
```

### macOS/Linux One‑Click
```bash
# Terminal tab 1 (server):
cd server && npm install && npm run dev

# Terminal tab 2 (client):
cd client && npm install && printf "VITE_SERVER_URL=http://localhost:4000\n" > .env && npm run dev
```

## Common Commands
- `npm run dev` — development mode (client or server)
- `npm start` — run server without autoreload
- `npm run build` — client production build

## Notes
- All data is kept **in memory** for demo. For production, store students and polls in a DB (e.g., MongoDB, Postgres, or Redis).
- If you run on different ports or hosts, update the client `.env` accordingly.
