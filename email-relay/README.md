# Email Relay — Ubuntu VPS (bypasses Render SMTP block)

Render free blocks outbound SMTP (your logs: `ETIMEDOUT :587` → `ESOCKET ENETUNREACH 2a00:...:465` IPv6). This relay fixes it:

```
Enrollment site → Render POST /api/enrollment/confirm → (SMTP blocked) → HTTPS POST → VPS :3001/send → Gmail SMTP → inbox
                ↳ if no EMAIL_RELAY_URL: 502/log only
```

VPS has full outbound, so Gmail works there. Render only does HTTPS — never blocked.

## 1. SSH to VPS

```bash
ssh ubuntu@YOUR_VPS_IP
```

## 2. Install

```bash
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx git curl
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt install -y nodejs
sudo npm i -g pm2
```

## 3. Deploy relay

```bash
# from your dev machine, copy the folder
scp -r email-relay ubuntu@YOUR_VPS_IP:~/email-relay

# on VPS
cd ~/email-relay
npm install
cp .env.example .env   # edit it!
nano .env
# set SMTP_USER=spracherwanda@gmail.com, SMTP_PASS=new-16-char-app-password,
# RELAY_SECRET=long-random-string, CORS_ORIGINS as in example

npm run build
pm2 start dist/server.js --name sparch-relay
pm2 save && pm2 startup
curl http://localhost:3001/health  # -> {"success":true,"status":"ok"}
pm2 logs sparch-relay --lines 30   # should say "SMTP verified"
```

**App Password:** Google Account → Security → 2-Step Verification ON → App passwords → Mail / Other → 16 chars (no spaces). The shared `deujwfmgdgdmbjrd` must be rolled — generate a new one.

## 4. Nginx + TLS (so Render can use `https://`)

Pick a subdomain, e.g. `mail.deutshsprache.org` (add A record → YOUR_VPS_IP).

```bash
sudo nano /etc/nginx/sites-available/mail-relay
```
```nginx
server {
    listen 80;
    server_name mail.deutshsprache.org;
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
```bash
sudo ln -s /etc/nginx/sites-available/mail-relay /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d mail.deutshsprache.org
curl https://mail.deutshsprache.org/health
```

No domain? Use IP: set `EMAIL_RELAY_URL=http://YOUR_VPS_IP:3001` and open `ufw allow 3001/tcp`.

## 5. Wire Render

Render Dashboard → Environment:

```
EMAIL_RELAY_URL=https://mail.deutshsprache.org
EMAIL_RELAY_SECRET=same-long-string-as-RELAY_SECRET
SMTP_USER= (can stay, relay uses its own .env — but set anyway)
SMTP_PASS=
SMTP_HOST=smtp.gmail.com
```

Manual Deploy → Deploy latest commit. Logs now show:

```
SMTP blocked — forwarding to VPS relay over HTTPS
Email sent via VPS relay
```

Test:

```bash
curl -X POST https://YOUR_RENDER.onrender.com/api/enrollment/confirm \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Test","last_name":"User","email":"your_gmail@gmail.com","course":"A1","schedule":"Morning"}'
# -> {"success":true,"data":{"sent":true}}
# check inbox + `pm2 logs sparch-relay` on VPS
```

## If you prefer no relay: HTTP email API

Alternative without VPS: Resend/Brevo — set `RESEND_API_KEY` and swap `backend/src/lib/mailer.ts` to `fetch https://api.resend.com/emails`. No SMTP ports needed.
