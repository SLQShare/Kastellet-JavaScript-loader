# Define the task name
$TaskName = "ScheduledShutdown"

# Define the shutdown action
$Action = New-ScheduledTaskAction -Execute "shutdown.exe" -Argument "/s /f /t 0"

# Define triggers for different schedules
$WeekdaysTrigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday,Tuesday,Wednesday,Thursday,Friday -At 15:45
$WeekendTrigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Saturday,Sunday -At 17:15

# Define task principal (run with highest privileges)
$Principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

# Register the task with both triggers
Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $WeekdaysTrigger,$WeekendTrigger -Principal $Principal -Description "Shuts down the computer at 15:45 on weekdays and 17:15 on weekends."

Write-Host "Scheduled shutdown task has been created successfully!"