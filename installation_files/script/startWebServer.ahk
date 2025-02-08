; Max wait time: 2 minute (120 seconds)
maxWaitTime := 120000
elapsedTime := 0
retryInterval := 5000  ; Check every 5 seconds

Loop
{
    ; Check if LocalWP is running
    if WinExist("ahk_exe Local.exe")  
    {
        WinActivate, ahk_exe Local.exe  ; Activate LocalWP window
        Sleep, 2000  ; Ensure the window is fully active

        ; Navigate and start the site
        Send, {Tab 11}
        Sleep, 500
        Send, {Enter}
        Sleep, 2000

        Send, {Tab 4} ; this will likely need to be changed to 4
        Sleep, 500
        Send, {Enter}

        ExitApp  ; Close script after completing the actions
    }

    ; If LocalWP is not found, wait and try again
    Sleep, %retryInterval%
    elapsedTime += retryInterval

    ; Stop trying after 1 minute
    if (elapsedTime >= maxWaitTime)
    {
        MsgBox, LocalWP was not found after 1 minute. Exiting script.
        ExitApp
    }
}
