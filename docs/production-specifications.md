# Production Environment Specifications

Specs to provision the server and supporting services before deploying the **Tawin** project.

---

## Server (VPS / Cloud instance)

| Resource    | Minimum            | Recommended         |
|-------------|--------------------|---------------------|
| OS          | Ubuntu 22.04 LTS   | Ubuntu 22.04 / 24.04 LTS |
| CPU         | 2 vCPU             | 4 vCPU              |
| RAM         | 4 GB               | 8 GB                |
| Storage     | 40 GB SSD          | 80 GB SSD           |
| Public IPv4 | 1                  | 1                   |

> Storage note: uploaded files (product images, profile pictures, brand logos, category thumbnails) live on the server disk. Plan storage based on expected media volume.

---

## Software requirements (installed on the server)

- **Node.js** v20 LTS (or v22 LTS)
- **npm** (bundled with Node.js)
- **PM2** (Node process manager)
- **Nginx** (reverse proxy + SSL termination)
- **Certbot** (Let's Encrypt SSL certificates)
- **Git**

---

## Database

- **MongoDB** v7.x
- Hosted MongoDB Atlas cluster recommended (free tier works for staging; M10+ for production)
- If self-hosting, the server above will need an extra **2 GB RAM** and Mongo on a separate disk

---

## Network

| Port | Purpose             | Exposure        |
|------|---------------------|-----------------|
| 22   | SSH                 | Restricted IPs  |
| 80   | HTTP (redirects to HTTPS) | Public    |
| 443  | HTTPS               | Public          |
| 3520 | Backend API (internal) | localhost only |
| 3000 | Frontend (internal) | localhost only  |
| 27017 | MongoDB (if self-hosted) | private network only |

---

## Domain & DNS

- One domain (e.g. `example.com`)
- Two A records pointing to the server's public IP:
  - `example.com` → frontend
  - `api.example.com` → backend
- SSL via Let's Encrypt (free, auto-renewing — handled by Certbot during setup)

---

## Email (SMTP)

The backend sends transactional emails (OTP verification, password reset, order updates).

- SMTP host, port, username, password (any provider — Gmail SMTP, SendGrid, Mailgun, your hosting's SMTP, etc.)
- A sender address like `no-reply@yourdomain.com`

---

## Environment variables (provided privately)

The backend needs a `.env.production` file with:

- `MONGO_URI` — connection string
- `JWT_ACCESS_SECRET` — 48+ random bytes
- `PORT` — default `3520`
- `CORS_ORIGIN` — frontend URL
- `ADMIN_PASSWORD` — for the seeded admin account
- SMTP credentials (`MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, etc.)
- `LOW_STOCK_THRESHOLD`

The frontend needs a `.env` file with:

- `NEXT_PUBLIC_API_BASE_URL` — public API URL (e.g. `https://api.example.com`)

I'll share the actual values via a private channel.

---

## Backup recommendation

- **Uploads folder** — daily tar.gz to S3 / R2 / Google Drive
- **MongoDB** — daily `mongodump` (or Atlas built-in backups if using Atlas)
- Retention: at least 14 days

---

## Summary checklist for provisioning

- [ ] Ubuntu 22.04 LTS server (2 vCPU / 4 GB RAM / 40 GB SSD minimum)
- [ ] Public IP + SSH access
- [ ] Domain with DNS access
- [ ] MongoDB (hosted Atlas cluster or self-hosted)
- [ ] SMTP credentials for transactional emails

Once these are ready, follow `production-setup-guide.md` to deploy.
