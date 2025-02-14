; ------------------------
; AutoHotkey v2.0 Script - LocalWP Auto Start
; ------------------------

; Define required AutoHotkey version
requiredVersion := 2.0

; Wait for LocalWP to open (Max 10 minute)
maxWaitTime := 600000
elapsedTime := 0
retryInterval := 5000  ; Check every 5 seconds
stepOneDone := false
done := false

While (!done) {
    if (WinExist("ahk_exe Local.exe") and !stepOneDone) {
        WinActivate("ahk_exe Local.exe")  ; Activate LocalWP window
        Sleep(2000)  ; Ensure window is fully active

        ; Select the first site (Tab 11 times)
        Send("{Tab 11}")
        Sleep(500)
        Send("{Enter}")  ; Select the site
        Sleep(2000)

        ; Navigate to "Start Site" (Tab 4 more times)
        Send("{Tab 4}")
        Sleep(500)
        Send("{Enter}")  ; Start the site
        Sleep(3000)

        ; Minimize LocalWP window
        WinMinimize("A")

        ; step one done
        stepOneDone := true
    }

    if (WinExist("ahk_exe chrome.exe") and stepOneDone) {  ;
        WinActivate("ahk_exe chrome.exe")
        done := true
        ExitApp()
    }

    ; If LocalWP is not found, wait and try again
    Sleep(retryInterval)
    elapsedTime += retryInterval

    ; Stop trying after 10 minute
    if (elapsedTime >= maxWaitTime) {
        elapsedMinutes := Round(elapsedTime / 1000 / 60, 1)  ; Convert to minutes
        MsgBox("LocalWP was not found after " elapsedMinutes " minute(s). Exiting script.")
        ExitApp()
    }
}
