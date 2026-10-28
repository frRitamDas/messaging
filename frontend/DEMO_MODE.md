# Conversa demo deployment

This repository can deploy its React/Vite frontend on Vercel independently of the Express/Socket.IO backend.

## Vercel settings

- Root Directory: `frontend`
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`
- Environment Variable: `VITE_DEMO_MODE=true`

The root `vercel.json` includes a SPA fallback rewrite for React Router routes.

## Demo login

- Email: `demo@gmail.com`
- Password: `demo123`

This demo-only login is client-side UI access, not secure authentication. Never reuse the demo password on any real account and do not use this mode for private information. It does not create a database user or enable cross-device, persistent, or real-time messaging. The standard login/API flow remains available for a separately hosted backend when `VITE_DEMO_MODE` is disabled.

## Real backend later

Host the Express/Socket.IO backend on a service that supports a persistent Node.js process and WebSocket connections, provision MongoDB and any needed email/S3/AI secrets, then set `VITE_API_URL` to the public HTTPS API origin. Configure backend CORS for the Vercel frontend domain. Rebuild/redeploy after changing Vite environment variables.
