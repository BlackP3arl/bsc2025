#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to remove directory recursively
function removeDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`✅ Removed: ${dirPath}`);
  }
}

// Function to remove file
function removeFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`✅ Removed: ${filePath}`);
  }
}

console.log('🧹 Clearing Vite development cache...\n');

// Remove Vite cache directories
removeDir('node_modules/.vite');
removeDir('.vite');
removeDir('dist');

// Remove build artifacts
removeFile('.eslintcache');

// Clear npm cache (optional)
console.log('\n📦 Clearing npm cache...');
const { execSync } = require('child_process');
try {
  execSync('npm cache clean --force', { stdio: 'inherit' });
} catch (error) {
  console.log('⚠️  npm cache clean failed, continuing...');
}

console.log('\n✨ Cache cleared! Now run: npm run dev');
console.log('\n🔧 Additional steps to try:');
console.log('   1. Close all browser tabs for localhost:5173');
console.log('   2. Open Chrome DevTools → Application → Storage → Clear site data');
console.log('   3. In Chrome: chrome://settings/content/serviceWorkers → Remove localhost entries');
console.log('   4. Try incognito mode first to test');