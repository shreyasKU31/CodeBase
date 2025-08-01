# Simple PowerShell script to commit files with random dates

Write-Host "Starting simple random commit process..." -ForegroundColor Green

# Original git commit messages
$messages = @(
    "feat: add user authentication with Clerk",
    "feat: implement user profile setup flow", 
    "feat: add project creation functionality",
    "feat: implement project dashboard with sorting",
    "feat: add like and comment system",
    "feat: create user profile pages",
    "feat: implement project detail view",
    "feat: add image upload functionality",
    "feat: create responsive UI components",
    "feat: implement search and filtering",
    "fix: resolve authentication issues",
    "fix: correct database schema",
    "fix: update API endpoints",
    "fix: resolve session management",
    "fix: correct routing issues",
    "refactor: improve code structure",
    "refactor: optimize performance",
    "refactor: update component architecture",
    "refactor: improve error handling",
    "refactor: optimize database queries",
    "docs: update README",
    "docs: add API documentation",
    "docs: update setup instructions",
    "docs: add component documentation",
    "style: update code formatting",
    "style: improve component styling",
    "style: update color scheme",
    "style: improve typography",
    "test: add unit tests",
    "test: add integration tests",
    "test: add component tests",
    "test: add API tests",
    "chore: update dependencies",
    "chore: configure build process",
    "chore: update deployment scripts",
    "chore: configure CI/CD",
    "chore: update environment variables",
    "chore: configure database",
    "chore: update package.json",
    "chore: configure linting"
)

# Get all files (excluding certain directories and files)
$files = Get-ChildItem -Recurse -File | Where-Object {
    $_.FullName -notmatch "node_modules" -and
    $_.FullName -notmatch "\.git" -and
    $_.FullName -notmatch "dist" -and
    $_.FullName -notmatch "build" -and
    $_.FullName -notmatch "\.next" -and
    $_.Name -notmatch "\.log$" -and
    $_.Name -notmatch "\.tmp$" -and
    $_.Name -notmatch "\.cache$"
}

Write-Host "Found $($files.Count) files to commit" -ForegroundColor Yellow

# Commit each file with random date and message
$fileIndex = 0
foreach ($file in $files) {
    $fileIndex++
    
    # Generate random date (1-14 days ago)
    $randomDays = Get-Random -Minimum 1 -Maximum 15
    $date = (Get-Date).AddDays(-$randomDays)
    
    # Generate random time (6 AM to 10 PM)
    $randomHour = Get-Random -Minimum 6 -Maximum 23
    $randomMinute = Get-Random -Minimum 0 -Maximum 60
    $randomSecond = Get-Random -Minimum 0 -Maximum 60
    
    $date = $date.Date.AddHours($randomHour).AddMinutes($randomMinute).AddSeconds($randomSecond)
    
    # Get random message
    $messageIndex = Get-Random -Minimum 0 -Maximum $messages.Count
    $commitMessage = $messages[$messageIndex]
    
    $dateStr = $date.ToString("yyyy-MM-dd")
    $timeStr = $date.ToString("HH:mm:ss")
    
    Write-Host "`n--- Committing file $fileIndex of $($files.Count) for $dateStr at $timeStr ---" -ForegroundColor Cyan
    
    try {
        # Add file to staging
        git add $file.FullName
        
        # Set environment variables and commit
        $env:GIT_AUTHOR_DATE = $date.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        $env:GIT_COMMITTER_DATE = $date.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        git commit -m $commitMessage
        
        Write-Host "✅ Committed: $($file.Name) - `"$commitMessage`"" -ForegroundColor Green
    }
    catch {
        Write-Host "⚠️  Skipped: $($file.Name) ($($_.Exception.Message))" -ForegroundColor Yellow
    }
}

Write-Host "`n🎉 Random commit process completed!" -ForegroundColor Green 