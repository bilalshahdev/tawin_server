# Production Setup Guide

Steps to get the **Tawin** backend and frontend running on a live Ubuntu server with a domain.

---

## 1. Install Node and PM2 on the server

SSH into the server and run:

```bash
sudo apt update && sudo apt upgrade -y

# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx

# PM2 — keeps Node apps running
sudo npm install -g pm2

# verify
node -v   # v20.x
npm -v
```

---

## 2. Backend — clone, env, build, start

```bash
cd ~
git clone https://github.com/bilalshahdev/tawin_server.git
cd tawin_server
```

Create the env file:

```bash
nano .env.production
```

Paste the production env (Mongo URI, JWT secret, mail credentials, port, CORS origin, etc.) — share these privately, don't commit them.

Install, build, start:

```bash
npm install
npm run build
pm2 start dist/server.js --name tawin-api
pm2 save
pm2 startup        # run the command PM2 prints, so apps survive reboot
```

Quick check:

```bash
pm2 status
curl http://localhost:3520/health
```

---

## 3. Frontend — clone, env, build, start

```bash
cd ~
git clone https://github.com/bilalshahdev/tawin-web.git
cd tawin-web
nano .env
```

Paste:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
```

Install, build, start:

```bash
npm install
npm run build
pm2 start npm --name tawin-web -- run start
pm2 save
```

Quick check:

```bash
pm2 status
curl http://localhost:3000
```