# Helper to deploy the setup script
$ServerIP = "192.168.29.179"
$User = "kishore"

Write-Host "1. Uploading setup script..." -ForegroundColor Cyan
scp setup_linux.sh "$($User)@$($ServerIP):~/setup_linux.sh"

Write-Host "2. Executing setup on server..." -ForegroundColor Cyan
Write-Host "   (You will simply need to run the script inside)" 

# Connect and run the script
# We make it executable first
ssh -t "$($User)@$($ServerIP)" "chmod +x ~/setup_linux.sh && ~/setup_linux.sh"

Write-Host "Done."
