# ------------------------
# Local WB Auto Startup Script
# ------------------------

# Define Paths
$localWB = “C:\Program Files (x86)\Local\Local.exe”  # Change if needed
$websiteURL = "http://localhost"  # Adjust if using a different local address

# Start Local WB
Write-Output "Starting Local WB..."
Start-Process -FilePath $localWB
Start-Sleep -Seconds 10  # Allow Local WB to start properly

# Start Web Server inside Local WB (Simulating the launch)
# If manual input is required, use AutoHotkey or UI Automation (optional)
Write-Output "Starting Web Server..."
# Here you might need to launch a project in Local WB manually or auto-configure it.

# Wait for Web Server to start (Check if Port 80 or 3000 is Open)
Write-Output "Waiting for Web Server to be available..."
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
    Write-Output "Web Server is running!"
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
