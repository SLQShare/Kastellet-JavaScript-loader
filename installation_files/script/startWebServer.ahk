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


; Define the path to the counter file
counterFile := "C:\script\counter.ini"

; Check if the counter file exists, if not, create it with a default value of 0
if !FileExist(counterFile) {
    IniWrite 0, counterFile, "restartCounter", "count"
}

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
        ; Write and reset the value to 0 in the file
        IniWrite count, counterFile, "restartCounter", "0"
        ExitApp()
    }

    ; If LocalWP is not found, wait and try again
    Sleep(retryInterval)
    elapsedTime += retryInterval

    ; Stop trying after 10 minute
    if (elapsedTime >= maxWaitTime) {
        ; Read the current counter value
        ; OutputVar → The variable where the value will be stored (count in this case). Filename → The path to the .ini file (counterFile). Section → The section inside the .ini file ("restartCounter"). Key → The specific key to read ("count"). Default → The default value if the key does not exist (0 in this case). 
        count := IniRead(counterFile, "restartCounter", "count", 0)

        ; checks if the machine has failed 3 times, then it will go into sleep mode.
        if (count > 3){
            MsgBox("⚠ CRITICAL FAILURE! ⚠`nGoing to sleep mode in 30 seconds.`nPlease contact GB.", "Warning", 48)  ; 48 = Exclamation icon            
            Sleep 30000  ; Wait 5 seconds before sleeping
            DllCall("PowrProf\SetSuspendState", "Int", 0, "Int", 0, "Int", 0)
        }
        ; Increment the counter
        count++

        ; Write the updated value back to the file
        IniWrite count, counterFile, "restartCounter", "count"

        ; Short message before restarting
        MsgBox("Could not perform start up, restarting i 10 seconds...")
        Sleep 10000  ; Wait 5 seconds before sleeping

        ; Restart the computer
        Shutdown 6
    }
}
