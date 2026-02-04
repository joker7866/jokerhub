# Start JokerHub on Server
# Runs SSH, connects, installs dependencies, and starts the app.

$ServerIP = "192.168.29.179"
$User = "kishore78"

Write-Host "🚀 Connecting to $User@$ServerIP..." -ForegroundColor Cyan
Write-Host "🔑 (Please enter password 'joker7866' when prompted)" -ForegroundColor Yellow

# Command Breakdown:
# 1. cd jokerhub
# 2. npm install (ensure deps are there)
# 3. sudo systemctl restart jokerhub (Try to start service)
# 4. If service fails or doesn't exist, run 'npm start' directly

$RemoteCommand = "
    cd ~/jokerhub; 
    npm install; 
    if sudo systemctl restart jokerhub; then 
        echo '✅ Service started successfully!'; 
        sudo systemctl status jokerhub --no-pager;
    else 
        echo '⚠️ Service not found or failed. Starting manually...'; 
        npm start; 
    fi
"

ssh -t "$($User)@$($ServerIP)" $RemoteCommand
