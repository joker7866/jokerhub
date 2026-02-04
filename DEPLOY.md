# JokerHub Deployment Guide (Ubuntu Server)

Follow these steps to deploy the JokerHub Anti-Gravity Platform on your home server.

## 1. Environment Setup

### Install Node.js & NPM
```bash
sudo apt update
sudo apt install -y nodejs npm
sudo npm install -g n
sudo n lts
```

### Install Security Tools
```bash
sudo apt install -y ufw fail2ban nginx
```

## 2. Project Installation

Copy the project files to `/var/www/jokerhub` or your preferred directory.

```bash
# Navigate to directory
cd /var/www/jokerhub

# Install dependencies
npm install

# Setup Environment Variables
cp .env.example .env
nano .env
# Set your SESSION_SECRET and other keys
```

## 3. Security Configuration

### Firewall (UFW)
Only open necessary ports. Since we are using Cloudflare Tunnel, we might not even need 80/443 open to the public internet, but if utilizing local Nginx Proxy:

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh   # CRITICAL: Don't lock yourself out!
# If using Cloudflare Tunnel strictly, you might not need HTTP ports open on WAN, 
# but allow Nginx to talk to localhost.
sudo ufw enable
```

### Fail2Ban
Protect SSH.
```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## 4. Run as a System Service (Systemd)

Create a service file to keep the app running.

`sudo nano /etc/systemd/system/jokerhub.service`

```ini
[Unit]
Description=JokerHub Node.js Application
After=network.target

[Service]
User=your_username
WorkingDirectory=/var/www/jokerhub
ExecStart=/usr/local/bin/node server/server.js
Restart=always
Environment=PORT=3000
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable jokerhub
sudo systemctl start jokerhub
```

## 5. Cloudflare Tunnel Setup (Zero Trust)

1. **Install cloudflared**:
   ```bash
   curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
   sudo dpkg -i cloudflared.deb
   ```

2. **Authenticate & Create Tunnel**:
   ```bash
   cloudflared tunnel login
   cloudflared tunnel create jokerhub-tunnel
   ```

3. **Configure Tunnel**:
   Create a `config.yml` in `~/.cloudflared/`:
   ```yaml
   tunnel: <Tunnel-UUID>
   credentials-file: /home/username/.cloudflared/<Tunnel-UUID>.json
   
   ingress:
     - hostname: jokerhub.online
       service: http://localhost:3000
     - hostname: cockpitapp.jokerhub.online
       service: http://localhost:9090
     - hostname: nextcloud.jokerhub.online
       service: http://localhost:8080
     - hostname: casoapp.jokerhub.online
       service: http://localhost:81
     - service: http_status:404
   ```

4. **Run Tunnel**:
   ```bash
   cloudflared tunnel run jokerhub-tunnel
   ```
   (Ideally, run this as a service too: `sudo cloudflared service install`)

## 6. Application Notes
- **Admin**: The application now supports a JSON-based user management system. The first user or manually configured admin can access `/admin`.
- **SSL**: Cloudflare handles SSL termination. The connection between Cloudflare and your server (via Tunnel) is encrypted.
