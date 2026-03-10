#!/usr/bin/env bash
set -euo pipefail

# Usage: sudo bash vps_bootstrap.sh <api_domain> <images_domain>
API_DOMAIN="${1:-api.dreamair.space}"
IMAGES_DOMAIN="${2:-images.dreamair.space}"
APP_DIR="/opt/dreamair"
PY=python3

if [ "${EUID:-$(id -u)}" -ne 0 ]; then
  echo "Please run as root (sudo)" >&2
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y $PY $PY-venv $PY-pip nginx unzip

# Create app directories
mkdir -p "$APP_DIR"
mkdir -p /var/www/dreamair/images

# Deploy application code from /tmp/dreamair_deploy (uploaded by deploy script)
DEPLOY_TMP_DIR="/tmp/dreamair_deploy"
if [ ! -d "$DEPLOY_TMP_DIR" ] && [ -d /tmp/smartair_deploy ]; then
  DEPLOY_TMP_DIR="/tmp/smartair_deploy"
fi

if [ -d "$DEPLOY_TMP_DIR/app" ]; then
  rm -rf "$APP_DIR/app"
  cp -r "$DEPLOY_TMP_DIR/app" "$APP_DIR/app"
fi
if [ -f "$DEPLOY_TMP_DIR/requirements.txt" ]; then
  cp "$DEPLOY_TMP_DIR/requirements.txt" "$APP_DIR/requirements.txt"
fi

# Python venv + deps
if [ ! -d "$APP_DIR/venv" ]; then
  $PY -m venv "$APP_DIR/venv"
fi
"$APP_DIR/venv/bin/pip" install --upgrade pip wheel
if [ -f "$APP_DIR/requirements.txt" ]; then
  "$APP_DIR/venv/bin/pip" install -r "$APP_DIR/requirements.txt"
else
  "$APP_DIR/venv/bin/pip" install fastapi uvicorn[standard]
fi

# Systemd service
cat >/etc/systemd/system/dreamair.service <<SERVICE
[Unit]
Description=DreamAir API (Uvicorn)
After=network.target

[Service]
User=root
WorkingDirectory=$APP_DIR
Environment=PYTHONUNBUFFERED=1
ExecStart=$APP_DIR/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
SERVICE

systemctl daemon-reload
systemctl enable dreamair.service
systemctl restart dreamair.service

# Nginx config
cat >/etc/nginx/sites-available/dreamair_api.conf <<NGINX
server {
  listen 80;
  listen [::]:80;
    server_name $API_DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /health {
        proxy_pass http://127.0.0.1:8000/health;
    }
}

server {
  listen 80;
  listen [::]:80;
    server_name $IMAGES_DOMAIN;

    root /var/www/dreamair;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/dreamair_api.conf /etc/nginx/sites-enabled/dreamair_api.conf
if [ -f /etc/nginx/sites-enabled/default ]; then rm -f /etc/nginx/sites-enabled/default; fi

# Health file for images
mkdir -p /var/www/dreamair
printf "ok\n" > /var/www/dreamair/health.txt

nginx -t
systemctl restart nginx

# UFW (optional)
if command -v ufw >/dev/null 2>&1; then
  ufw allow 80/tcp || true
  ufw allow 443/tcp || true
fi

cat <<POST

Bootstrap dokončený.
Ďalšie kroky (po DNS smerovaní na IP VPS):
  sudo apt-get install -y certbot python3-certbot-nginx
  sudo certbot --nginx -d $API_DOMAIN -d $IMAGES_DOMAIN --redirect --hsts --staple-ocsp -m admin@$API_DOMAIN --agree-tos -n
Skontroluj:
  http://$API_DOMAIN/health
  http://$IMAGES_DOMAIN/health.txt
POST
