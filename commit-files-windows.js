const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get all files in the project (excluding node_modules, .git, etc.)
function getAllFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip certain directories
      if (['node_modules', '.git', 'dist', 'build', '.next'].includes(item)) {
        continue;
      }
      getAllFiles(fullPath, files);
    } else {
      // Skip certain file types
      if (!['.log', '.tmp', '.cache'].some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  return files;
}

// Generate dates for the last 2 weeks (morning time - 9 AM)
function generateDates() {
  const dates = [];
  const now = new Date();
  
  for (let i = 14; i >= 1; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(9, 0, 0, 0); // Set to 9 AM
    dates.push(date);
  }
  
  return dates;
}

// Commit files with specific dates (Windows compatible)
function commitFiles() {
  try {
    // Get all files
    const files = getAllFiles('.');
    console.log(`Found ${files.length} files to commit`);
    
    // Generate dates for last 2 weeks
    const dates = generateDates();
    console.log(`Will commit with ${dates.length} different dates`);
    
    // Calculate files per date
    const filesPerDate = Math.ceil(files.length / dates.length);
    
    let fileIndex = 0;
    
    for (let i = 0; i < dates.length && fileIndex < files.length; i++) {
      const date = dates[i];
      const dateStr = date.toISOString().split('T')[0];
      const timeStr = date.toTimeString().split(' ')[0];
      
      console.log(`\n--- Committing files for ${dateStr} at ${timeStr} ---`);
      
      // Commit files for this date
      for (let j = 0; j < filesPerDate && fileIndex < files.length; j++) {
        const file = files[fileIndex];
        const relativePath = path.relative('.', file);
        
        try {
          // Add file to staging
          execSync(`git add "${relativePath}"`, { stdio: 'pipe' });
          
          // Commit with specific date using Windows-compatible syntax
          const commitMessage = `Update ${relativePath} - ${dateStr}`;
          const isoDate = date.toISOString();
          
          // Use PowerShell-compatible environment variable setting
          const command = `$env:GIT_AUTHOR_DATE="${isoDate}"; $env:GIT_COMMITTER_DATE="${isoDate}"; git commit -m "${commitMessage}"`;
          
          execSync(command, { 
            stdio: 'pipe',
            shell: 'powershell.exe'
          });
          
          console.log(`✅ Committed: ${relativePath}`);
          fileIndex++;
        } catch (error) {
          console.log(`⚠️  Skipped: ${relativePath} (${error.message})`);
          fileIndex++;
        }
      }
    }
    
    console.log(`\n🎉 Successfully committed ${fileIndex} files across ${dates.length} dates!`);
    
  } catch (error) {
    console.error('Error during commit process:', error.message);
  }
}

// Run the script
commitFiles(); 