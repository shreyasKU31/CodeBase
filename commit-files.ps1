# PowerShell script to commit files with dates from previous 2 weeks

Write-Host "Starting file commit process..." -ForegroundColor Green

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

# Generate dates for last 2 weeks (morning time - 9 AM)
$dates = @()
for ($i = 14; $i -ge 1; $i--) {
    $date = (Get-Date).AddDays(-$i)
    $date = $date.Date.AddHours(9) # Set to 9 AM
    $dates += $date
}

Write-Host "Will commit with $($dates.Count) different dates" -ForegroundColor Yellow

# Calculate files per date
$filesPerDate = [Math]::Ceiling($files.Count / $dates.Count)
$fileIndex = 0

foreach ($date in $dates) {
    $dateStr = $date.ToString("yyyy-MM-dd")
    $timeStr = $date.ToString("HH:mm:ss")
    
    Write-Host "`n--- Committing files for $dateStr at $timeStr ---" -ForegroundColor Cyan
    
    # Commit files for this date
    for ($j = 0; $j -lt $filesPerDate -and $fileIndex -lt $files.Count; $j++) {
        $file = $files[$fileIndex]
        $relativePath = $file.FullName.Substring((Get-Location).Path.Length + 1)
        
        try {
            # Add file to staging
            git add $relativePath
            
            # Commit with specific date
            $commitMessage = "Update $relativePath - $dateStr"
            $isoDate = $date.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
            
            # Set environment variables and commit
            $env:GIT_AUTHOR_DATE = $isoDate
            $env:GIT_COMMITTER_DATE = $isoDate
            git commit -m $commitMessage
            
            Write-Host "✅ Committed: $relativePath" -ForegroundColor Green
            $fileIndex++
        }
        catch {
            Write-Host "⚠️  Skipped: $relativePath ($($_.Exception.Message))" -ForegroundColor Yellow
            $fileIndex++
        }
    }
}

Write-Host "`n🎉 Successfully committed $fileIndex files across $($dates.Count) dates!" -ForegroundColor Green 