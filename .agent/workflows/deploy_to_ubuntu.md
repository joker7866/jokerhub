---
description: How to deploy and start the project on the Ubuntu Server
---

# Deploy and Start on Ubuntu Server

Follow these steps to deploy your code from Windows to your Ubuntu server.

## 1. Prepare the Deployment Script
1. Open `deploy.ps1` in your editor.
2. Update the `$ServerIP` (default: 192.168.29.179) if it has changed.
3. Update `$ServerUser` (default: kishore) to your actual Ubuntu username.
4. Ensure you know your Ubuntu server password.

## 2. Run the Deployment
Open a standard PowerShell terminal in this folder and run:
```powershell
powershell -ExecutionPolicy Bypass -File deploy.ps1
```

This script will:
- Zip your project files.
- Copy them to the server.
- Install dependencies (`npm install`).
- Restart the `jokerhub` service.

## 3. First Time Setup (If not done yet)
If this is your **very first time**, you need to set up the system service on the server manually once.

1. SSH into your server:
   ```bash
   ssh kishore@192.168.29.179
   ```
2. Create the service file (as described in `DEPLOY.md`):
   ```bash
   sudo nano /etc/systemd/system/jokerhub.service
   ```
   (Paste the content from `DEPLOY.md` Section 4)
3. Enable the service:
   ```bash
   sudo systemctl enable jokerhub
   sudo systemctl start jokerhub
   ```

## 4. Verify Status
Check if the app is running:
```bash
sudo systemctl status jokerhub
```
Or view logs:
```bash
sudo journalctl -u jokerhub -f
```
