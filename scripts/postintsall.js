const fs = require('fs');
const path = require('path');

// Fix for browser compatibility issues with Node.js modules
function applyPolyfillFixes() {
  console.log('Applying polyfill fixes for Vite + Web3...');
  
  // Create a polyfills file if it doesn't exist
  const polyfillsFile = path.join(__dirname, '../src/polyfills.js');
  const polyfillContent = `
// Polyfills for node modules in browser environment
import { Buffer } from 'buffer';

window.global = window;
window.Buffer = Buffer;
window.process = { env: {} };
`;

  fs.writeFileSync(polyfillsFile, polyfillContent);
  console.log('Created polyfills.js file');
  
  // Update the main.jsx file to import polyfills
  const mainFilePath = path.join(__dirname, '../src/main.jsx');
  const mainContent = fs.readFileSync(mainFilePath, 'utf8');
  
  if (!mainContent.includes('./polyfills')) {
    const updatedContent = `import './polyfills';\n${mainContent}`;
    fs.writeFileSync(mainFilePath, updatedContent);
    console.log('Updated main.jsx to import polyfills');
  }
  
  console.log('Polyfill fixes applied successfully');
}

// Run the fix
applyPolyfillFixes();