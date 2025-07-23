@echo off
setlocal enabledelayedexpansion

echo Starting random commit process...

REM Get current date for reference
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"

echo Current date: %YYYY%-%MM%-%DD%

REM Original git commit messages
set "messages[0]=feat: add user authentication with Clerk"
set "messages[1]=feat: implement user profile setup flow"
set "messages[2]=feat: add project creation functionality"
set "messages[3]=feat: implement project dashboard with sorting"
set "messages[4]=feat: add like and comment system"
set "messages[5]=feat: create user profile pages"
set "messages[6]=feat: implement project detail view"
set "messages[7]=feat: add image upload functionality"
set "messages[8]=feat: create responsive UI components"
set "messages[9]=feat: implement search and filtering"
set "messages[10]=fix: resolve authentication issues"
set "messages[11]=fix: correct database schema"
set "messages[12]=fix: update API endpoints"
set "messages[13]=fix: resolve session management"
set "messages[14]=fix: correct routing issues"
set "messages[15]=refactor: improve code structure"
set "messages[16]=refactor: optimize performance"
set "messages[17]=refactor: update component architecture"
set "messages[18]=refactor: improve error handling"
set "messages[19]=refactor: optimize database queries"
set "messages[20]=docs: update README"
set "messages[21]=docs: add API documentation"
set "messages[22]=docs: update setup instructions"
set "messages[23]=docs: add component documentation"
set "messages[24]=style: update code formatting"
set "messages[25]=style: improve component styling"
set "messages[26]=style: update color scheme"
set "messages[27]=style: improve typography"
set "messages[28]=test: add unit tests"
set "messages[29]=test: add integration tests"
set "messages[30]=test: add component tests"
set "messages[31]=test: add API tests"
set "messages[32]=chore: update dependencies"
set "messages[33]=chore: configure build process"
set "messages[34]=chore: update deployment scripts"
set "messages[35]=chore: configure CI/CD"
set "messages[36]=chore: update environment variables"
set "messages[37]=chore: configure database"
set "messages[38]=chore: update package.json"
set "messages[39]=chore: configure linting"

REM Get all files to commit
set "fileCount=0"
for /r %%f in (*) do (
    if not "%%~dpf"=="%cd%\node_modules\" (
        if not "%%~dpf"=="%cd%\.git\" (
            if not "%%~xf"==".log" (
                if not "%%~xf"==".tmp" (
                    if not "%%~xf"==".cache" (
                        set /a fileCount+=1
                        set "files[!fileCount!]=%%f"
                    )
                )
            )
        )
    )
)

echo Found %fileCount% files to commit

REM Commit files with random dates
for /l %%i in (1,1,%fileCount%) do (
    REM Generate random date (1-14 days ago)
    set /a "randomDays=!random! %% 14 + 1"
    
    REM Generate random time (6 AM to 10 PM)
    set /a "randomHour=!random! %% 16 + 6"
    set /a "randomMinute=!random! %% 60"
    set /a "randomSecond=!random! %% 60"
    
    REM Create date string
    set "date_str=%YYYY%-%MM%-%DD%"
    
    REM Get random message
    set /a "messageIndex=!random! %% 40"
    set "commitMessage=!messages[%messageIndex%]!"
    
    echo Committing file %%i of %fileCount% for date: !date_str! at !randomHour!:!randomMinute!:!randomSecond!
    
    REM Add and commit file with specific date
    git add "!files[%%i]!"
    git commit --date="!date_str! !randomHour!:!randomMinute!:!randomSecond!" -m "!commitMessage!"
    
    if !errorlevel! equ 0 (
        echo Successfully committed: !files[%%i]!
    ) else (
        echo Failed to commit: !files[%%i]!
    )
)

echo Random commit process completed!
pause 