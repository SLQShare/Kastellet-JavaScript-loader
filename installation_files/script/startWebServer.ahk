; Define required AutoHotkey version
requiredVersion := 2.0

; Wait for LocalWP to open (Max 10 minute)
maxWaitTime := 200000
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

        Send("{Tab 11}") ; Select the first site (Tab 11 times)
        Sleep(500)

        Send("{Enter}")  ; Select the site
        Sleep(2000)

        Send("{Tab 4}") ; Navigate to "Start Site" (Tab 4 more times)
        Sleep(500)

        Send("{Enter}")  ; Start the site
        Sleep(3000)

        WinMinimize("A")  ; Minimize LocalWP window
        stepOneDone := true ; step one done
    }

    if (WinExist("ahk_exe chrome.exe") and stepOneDone) { 
        WinActivate("ahk_exe chrome.exe") ; select the chrome window
        done := true ; 
        IniWrite 0, counterFile, "restartCounter", "count" ; Write and reset the value to 0 in the file
        ;ExitApp() ; close the script, likely never called
    }

    Sleep(retryInterval)  ; If LocalWP is not found, wait and try again
    elapsedTime += retryInterval

    if (elapsedTime >= maxWaitTime) { ; Stop trying after 10 minute
        ; Read the current counter value
        ; OutputVar → The variable where the value will be stored (count in this case). Filename → The path to the .ini file (counterFile). Section → The section inside the .ini file ("restartCounter"). Key → The specific key to read ("count"). Default → The default value if the key does not exist (0 in this case). 
        count := IniRead(counterFile, "restartCounter", "count", 0)

        ; checks if the machine has failed 3 times, then it will go into sleep mode.
        if (count > 3){
            Shutdown 5  ; Force shutdown
            ExitApp() ; close the script, likely never called
        } else {
            count++  ; Increment the counter
            IniWrite count, counterFile, "restartCounter", "count" ; Write the updated value back to the file 
            Shutdown 6 ; Restart the computer
            ExitApp() ; close the script, likely never called
        }
        
    }
}

; while done wait for 10 mins then set chrome in focus to ensure it is the only accessible window
While (done) {
    if (WinExist("ahk_exe chrome.exe")) {
        Sleep(600000) ; wait 10 minutes
        WinActivate("ahk_exe chrome.exe") ; select the chrome window
        WinSetAlwaysOnTop("A", true) ; ensure the chrome window stays on top
        ExitApp()
    } else {
        done := false ; if chrome is not found, exit the loop
    }
}