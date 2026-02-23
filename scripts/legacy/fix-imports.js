import fs from 'fs';
import path from 'path';

// Function to recursively process all .js files in a directory
function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.js') && !file.endsWith('.d.ts')) {
      processFile(filePath);
    }
  }
}

// Function to process a single file and add .js extensions to relative imports
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Regular expression to match ES module imports with relative paths (without extensions)
  // Matches: from './something' or from '../something' or from './something/index'
  const importRegex = /(from\s+["']\.[^"',\n]*?)(["'])/g;
  
  let updated = false;
  content = content.replace(importRegex, (match, p1, p2) => {
    // If it already ends with .js, .ts, .json, etc., don't modify
    if (/\.(js|ts|jsx|tsx|json|mjs|cjs)$/.test(p1)) {
      return match;
    }
    
    // If it looks like it's importing a directory index, don't modify
    if (/\/index$/.test(p1)) {
      return match;
    }
    
    updated = true;
    return p1 + '.js' + p2;
  });
  
  if (updated) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated imports in: ${filePath}`);
  }
}

// Start processing from the dist-ts directory
const distDir = './dist-ts';
if (fs.existsSync(distDir)) {
  processDirectory(distDir);
  console.log('Import fixing completed.');
} else {
  console.error('dist-ts directory does not exist');
}