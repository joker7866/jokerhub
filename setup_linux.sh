#!/bin/bash

# 1. Detect location
APP_DIR=$(pwd)
APP_USER=$(whoami)

echo "--------------------------------------------------"
echo "🃏 JokerHub Auto-Setup"
echo "   User: $APP_USER"
echo "   Dir : $APP_DIR"
echo "--------------------------------------------------"

# 2. Install Dependencies
echo "📦 Installing Dependencies..."
npm install --production

# 3. Create Systemd Service
SERVICE_FILE="/etc/systemd/system/jokerhub.service"
echo "🔧 Creating Service File: $SERVICE_FILE"

sudo bash -c "cat > $SERVICE_FILE" <<EOF
[Unit]
Description=JokerHub Node.js Application (Auto-Setup)
After=network.target

[Service]
User=$APP_USER
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/node server/server.js
Restart=always
Environment=PORT=3000
Environment=NODE_ENV=production
Environment=SESSION_SECRET=joker_autogen_secret

[Install]
WantedBy=multi-user.target
EOF

# 4. Enable and Restart
echo "🚀 Starting Service..."
sudo systemctl daemon-reload
sudo systemctl enable jokerhub
sudo systemctl restart jokerhub

echo "✅ JokerHub is Live!"
echo "   Check: sudo systemctl status jokerhub"
