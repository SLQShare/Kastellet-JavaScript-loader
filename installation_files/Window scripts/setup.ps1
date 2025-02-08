# ------------------------
# Local WP InfoScreen Auto Startup Script
# ------------------------

# Define HomeScreen for this server
$homeScreenPath = ""  # landing page
$webpage = "infocenter.local" # site domain

# Find LocalWP dynamically
$possiblePaths = @(
    "C:\Program Files\Local\Local.exe",
    "$env:LOCALAPPDATA\Programs\Local\Local.exe"
)
$localWP = $possiblePaths | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $localWP) {
    Write-Output "Error: LocalWP not found!"
    exit 1
}
Write-Output "Found LocalWP at: $localWP"

# Define the AutoHotkey script path
$ahkScript = "C:\scripts\startWebServer.ahk"
if (-not (Test-Path $ahkScript)) {
    Write-Output "Error: AutoHotkey script not found at $ahkScript"
    exit 1
}

# Start LocalWP
Write-Output "Starting LocalWP..."
Start-Process -FilePath $localWP
Start-Sleep -Seconds 20  # Allow LocalWP to start properly

# Run AutoHotkey script to start the web server inside LocalWP
Write-Output "Starting InfoScreen Server in LocalWP using AutoHotkey..."
Start-Process -FilePath $ahkScript
Start-Sleep -Seconds 10  # Give it time to start

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

# ------------------------
# Clear Edge Cache Before Launching
# ------------------------

# Define Edge cache paths
$edgeCachePath = "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Cache"
$edgeCookiesPath = "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Cookies"
$edgeHistoryPath = "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\History"

# Remove Edge Cache
Write-Output "Clearing Edge Cache..."
Remove-Item -Path "$edgeCachePath\*" -Recurse -Force -ErrorAction SilentlyContinue

# Remove Edge Cookies
Write-Output "Clearing Edge Cookies..."
Remove-Item -Path "$edgeCookiesPath" -Force -ErrorAction SilentlyContinue

# Remove Edge Browsing History
Write-Output "Clearing Edge History..."
Remove-Item -Path "$edgeHistoryPath" -Force -ErrorAction SilentlyContinue

# ------------------------
# Disable Edge Pop-ups
# ------------------------

Write-Output "Disabling Microsoft Edge Translation Prompt..."
New-ItemProperty -Path "HKCU:\Software\Policies\Microsoft\Edge" `
    -Name "TranslateEnabled" -Value 0 -PropertyType DWORD -Force

Write-Output "Disabling Edge First-Run Welcome Page..."
New-ItemProperty -Path "HKCU:\Software\Policies\Microsoft\Edge" `
    -Name "HideFirstRunExperience" -Value 1 -PropertyType DWORD -Force

Write-Output "Disabling Restore Pages Prompt..."
New-ItemProperty -Path "HKCU:\Software\Policies\Microsoft\Edge" `
    -Name "RestoreOnStartup" -Value 4 -PropertyType DWORD -Force

Write-Output "Disabling Autofill Popups..."
New-ItemProperty -Path "HKCU:\Software\Policies\Microsoft\Edge" `
    -Name "AutofillAddressEnabled" -Value 0 -PropertyType DWORD -Force
New-ItemProperty -Path "HKCU:\Software\Policies\Microsoft\Edge" `
    -Name "AutofillCreditCardEnabled" -Value 0 -PropertyType DWORD -Force

Write-Output "Disabling Profile Sync Prompt..."
New-ItemProperty -Path "HKCU:\Software\Policies\Microsoft\Edge" `
    -Name "SyncDisabled" -Value 1 -PropertyType DWORD -Force
# ------------------------
# Launch Microsoft Edge in Fullscreen Kiosk Mode
# ------------------------

Write-Output "Launching Edge..."
Start-Process "msedge.exe" -ArgumentList "--disable-features=TranslateUI,AutofillPopup,SyncPromo --kiosk http://$webpage/$homeScreenPath --edge-kiosk-type=fullscreen"

# ------------------------
# Prevent Sleep Mode & Disable Notifications
# ------------------------

Write-Output "Disabling Sleep Mode..."
powercfg -change -monitor-timeout-ac 0
powercfg -change -standby-timeout-ac 0
powercfg -change -hibernate-timeout-ac 0

Write-Output "Disabling Notifications..."
New-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Notifications\Settings" `
                 -Name "NOC_GLOBAL_SETTING_TOASTS_ENABLED" -Value 0 -PropertyType DWORD -Force

Write-Output "Startup tasks completed!"
