@echo off
setlocal enabledelayedexpansion

echo Starting file commit process...

REM Get current date for reference
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"

echo Current date: %YYYY%-%MM%-%DD%

REM Generate dates for last 2 weeks (morning time - 9 AM)
for /l %%i in (14,-1,1) do (
    REM Calculate date (subtract days)
    set /a "days=%%i"
    
    REM Create date string (simplified - using current month)
    set "date_str=%YYYY%-%MM%-%DD%"
    
    echo Committing files for date: !date_str!
    
    REM Add and commit files with this date
    git add .
    git commit --date="!date_str! 09:00:00" -m "Update files - !date_str!"
    
    if !errorlevel! equ 0 (
        echo Successfully committed files for !date_str!
    ) else (
        echo Failed to commit files for !date_str!
    )
)

echo Commit process completed!
pause 