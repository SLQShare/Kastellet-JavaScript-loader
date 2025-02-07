# ------------------------
# Local WP InfoScreen Auto Startup Script
# ------------------------

# Define Paths
$localWP = "C:\Program Files\Local\Local.exe"
$websiteURL = "http://localhost"  # Change if InfoScreen runs on a different port

# Start LocalWP
Write-Output "Starting LocalWP..."
Start-Process -FilePath $localWP
Start-Sleep -Seconds 10  # Allow LocalWP to start properly

# Start the InfoScreen Server inside LocalWP
Write-Output "Starting InfoScreen Server in LocalWP..."
Start-Process "C:\Program Files\Local\Local.exe" -ArgumentList "start --site InfoScreen" -NoNewWindow -Wait

# Wait for Web Server to start (Check if Port 80 or 3000 is Open)
Write-Output "Waiting for InfoScreen Server to be available..."
$timeout = 60
$started = $false
for ($i=0; $i -lt $timeout; $i++) {
    Start-Sleep -Seconds 2
    if (Test-NetConnection -ComputerName "localhost" -Port 80 -InformationLevel Quiet) {
        $started = $true
        break
    }
}
if ($started) {
    Write-Output "InfoScreen Server is running!"
} else {
    Write-Output "Timeout reached! Web Server might not be running."
}

# Launch Microsoft Edge in Fullscreen Kiosk Mode
Write-Output "Launching Edge..."
Start-Process "msedge.exe" -ArgumentList "--kiosk $websiteURL --edge-kiosk-type=fullscreen"

# Prevent Sleep Mode
Write-Output "Disabling Sleep Mode..."
powercfg -change -monitor-timeout-ac 0
powercfg -change -standby-timeout-ac 0
powercfg -change -hibernate-timeout-ac 0

# Disable Notifications (Focus Assist = Alarms Only)
Write-Output "Disabling Notifications..."
New-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Notifications\Settings" `
                 -Name "NOC_GLOBAL_SETTING_TOASTS_ENABLED" -Value 0 -PropertyType DWORD -Force

Write-Output "Startup tasks completed!"