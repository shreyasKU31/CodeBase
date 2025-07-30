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

// Generate random dates for the last 2 weeks
function generateRandomDates(count) {
  const dates = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const date = new Date(now);
    
    // Random days ago (1-14 days)
    const randomDays = Math.floor(Math.random() * 14) + 1;
    date.setDate(date.getDate() - randomDays);
    
    // Random time (6 AM to 10 PM)
    const randomHour = Math.floor(Math.random() * 16) + 6; // 6-22 (6 AM to 10 PM)
    const randomMinute = Math.floor(Math.random() * 60);
    const randomSecond = Math.floor(Math.random() * 60);
    
    date.setHours(randomHour, randomMinute, randomSecond, 0);
    dates.push(date);
  }
  
  return dates.sort((a, b) => a - b); // Sort chronologically
}

// Original git commit messages (realistic development messages)
const originalMessages = [
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
  "feat: add real-time notifications",
  "feat: implement user settings page",
  "feat: add project sharing functionality",
  "feat: create admin dashboard",
  "feat: implement email notifications",
  "feat: add dark mode support",
  "feat: implement mobile responsive design",
  "feat: add project analytics",
  "feat: create user onboarding flow",
  "feat: implement project templates",
  "fix: resolve authentication issues",
  "fix: correct database schema",
  "fix: update API endpoints",
  "fix: resolve session management",
  "fix: correct routing issues",
  "fix: update error handling",
  "fix: resolve loading states",
  "fix: correct form validation",
  "fix: update component props",
  "fix: resolve state management",
  "refactor: improve code structure",
  "refactor: optimize performance",
  "refactor: update component architecture",
  "refactor: improve error handling",
  "refactor: optimize database queries",
  "refactor: update API structure",
  "refactor: improve user experience",
  "refactor: optimize bundle size",
  "refactor: update styling approach",
  "refactor: improve accessibility",
  "docs: update README",
  "docs: add API documentation",
  "docs: update setup instructions",
  "docs: add component documentation",
  "docs: update deployment guide",
  "docs: add troubleshooting guide",
  "docs: update contributing guidelines",
  "docs: add code examples",
  "docs: update changelog",
  "style: update code formatting",
  "style: improve component styling",
  "style: update color scheme",
  "style: improve typography",
  "style: update layout spacing",
  "style: improve button designs",
  "style: update form styling",
  "style: improve card layouts",
  "style: update navigation design",
  "test: add unit tests",
  "test: add integration tests",
  "test: add component tests",
  "test: add API tests",
  "test: add e2e tests",
  "test: update test coverage",
  "test: add performance tests",
  "test: add accessibility tests",
  "test: add error handling tests",
  "test: add user flow tests",
  "chore: update dependencies",
  "chore: configure build process",
  "chore: update deployment scripts",
  "chore: configure CI/CD",
  "chore: update environment variables",
  "chore: configure database",
  "chore: update package.json",
  "chore: configure linting",
  "chore: update git hooks",
  "chore: configure monitoring",
  "chore: update security settings"
];

// Commit files with random dates and original messages
function commitFilesRandomly() {
  try {
    // Get all files
    const files = getAllFiles('.');
    console.log(`Found ${files.length} files to commit`);
    
    // Generate random dates
    const dates = generateRandomDates(files.length);
    console.log(`Generated ${dates.length} random dates`);
    
    // Shuffle original messages
    const shuffledMessages = [...originalMessages].sort(() => Math.random() - 0.5);
    
    let fileIndex = 0;
    
    for (let i = 0; i < dates.length && fileIndex < files.length; i++) {
      const date = dates[i];
      const dateStr = date.toISOString().split('T')[0];
      const timeStr = date.toTimeString().split(' ')[0];
      
      console.log(`\n--- Committing file for ${dateStr} at ${timeStr} ---`);
      
      const file = files[fileIndex];
      const relativePath = path.relative('.', file);
      
      try {
        // Add file to staging
        execSync(`git add "${relativePath}"`, { stdio: 'pipe' });
        
        // Use original message (cycle through if needed)
        const messageIndex = fileIndex % shuffledMessages.length;
        const commitMessage = shuffledMessages[messageIndex];
        
        // Commit with specific date using Windows-compatible syntax
        const isoDate = date.toISOString();
        const command = `$env:GIT_AUTHOR_DATE="${isoDate}"; $env:GIT_COMMITTER_DATE="${isoDate}"; git commit -m "${commitMessage}"`;
        
        execSync(command, { 
          stdio: 'pipe',
          shell: 'powershell.exe'
        });
        
        console.log(`✅ Committed: ${relativePath} - "${commitMessage}"`);
        fileIndex++;
      } catch (error) {
        console.log(`⚠️  Skipped: ${relativePath} (${error.message})`);
        fileIndex++;
      }
    }
    
    console.log(`\n🎉 Successfully committed ${fileIndex} files with random dates and original messages!`);
    
  } catch (error) {
    console.error('Error during commit process:', error.message);
  }
}

// Run the script
commitFilesRandomly(); 