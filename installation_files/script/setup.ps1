# ------------------------
# Local WP InfoScreen Auto Startup Script (Using Chrome)
# ------------------------

# Maximize PowerShell window
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class Win32 {
    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();
}
"@ -Language CSharp

Start-Sleep -Milliseconds 500  # Give the window time to initialize
[Win32]::ShowWindow([Win32]::GetForegroundWindow(), 3)  # Maximize the window

# Define HomeScreen for this server
$homeScreenPath = ""  # Landing page 
$webpage = "infocenter.local"  # Site domain

# Find LocalWP dynamically
$possiblePaths = @(
    "C:\Program Files (x86)\Local\Local.exe",
    "$env:LOCALAPPDATA\Programs\Local\Local.exe"
)
$localWP = $possiblePaths | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $localWP) {
    Write-Output "Error: LocalWP not found!"
    exit 1
}
Write-Output "Found LocalWP at: $localWP"

# Define the AutoHotkey script path
$ahkScript = "C:\script\startWebServer.ahk"
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
$timeout = 100
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
# Clear Chrome Cache Before Launching
# ------------------------

# Define Chrome cache paths
$chromeCachePath = "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Cache"
$chromeCookiesPath = "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Cookies"
$chromeHistoryPath = "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\History"

# Remove Chrome Cache
Write-Output "Clearing Chrome Cache..."
Remove-Item -Path "$chromeCachePath\*" -Recurse -Force -ErrorAction SilentlyContinue

# Remove Chrome Cookies
Write-Output "Clearing Chrome Cookies..."
Remove-Item -Path "$chromeCookiesPath" -Force -ErrorAction SilentlyContinue

# Remove Chrome Browsing History
Write-Output "Clearing Chrome History..."
Remove-Item -Path "$chromeHistoryPath" -Force -ErrorAction SilentlyContinue

# ------------------------
# Launch Google Chrome in Fullscreen Kiosk Mode
# ------------------------

# Find Chrome's executable
$chromePaths = @(
    "C:\Program Files\Google\Chrome\Application\chrome.exe",
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
)
$chromePath = $chromePaths | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $chromePath) {
    Write-Output "Error: Google Chrome not found!"
    exit 1
}
Write-Output "Launching Chrome in Kiosk Mode..."

Start-Process -FilePath $chromePath -ArgumentList "--kiosk http://$webpage/$homeScreenPath --incognito --disable-popup-blocking --no-first-run"

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
