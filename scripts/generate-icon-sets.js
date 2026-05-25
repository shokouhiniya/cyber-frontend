#!/usr/bin/env node

/**
 * Script to scan the codebase for Iconify icon usage and add missing icons to icon-sets.js
 * 
 * Usage: node scripts/generate-icon-sets.js
 * 
 * This script:
 * 1. Scans all .jsx and .js files for icon names (e.g., "solar:folder-bold")
 * 2. Reads existing icon-sets.js to find already registered icons
 * 3. Fetches only missing icons from Iconify API
 * 4. Appends new icons to the existing file (preserves existing icons)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const SRC_DIR = path.join(__dirname, '../src');
const ICON_SETS_FILE = path.join(__dirname, '../src/components/iconify/icon-sets.js');
const REQUIRED_ICONS_FILE = path.join(__dirname, 'required-icons.json');

// Regex patterns to find icon names in source files
const ICON_PATTERNS = [
  // Simple string literals: icon="solar:folder-bold"
  /icon=["']([a-z0-9-]+:[a-z0-9-]+)["']/gi,
  // Object properties: icon: "solar:folder-bold"
  /icon:\s*["']([a-z0-9-]+:[a-z0-9-]+)["']/gi,
  // JSX props: <Iconify icon="solar:folder-bold"
  /<Iconify[^>]*icon=["']([a-z0-9-]+:[a-z0-9-]+)["']/gi,
  // String literals anywhere in the file (catches ternaries, variables, etc.)
  /["']([a-z0-9-]+:[a-z0-9-]+)["']/gi,
];

// Regex to extract existing icon names from icon-sets.js
const EXISTING_ICON_PATTERN = /'([a-z0-9-]+:[a-z0-9-]+)':\s*\{/gi;

/**
 * Recursively find all .jsx and .js files
 */
function findFiles(dir, extensions = ['.jsx', '.js']) {
  const files = [];
  
  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          walk(fullPath);
        }
      } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  walk(dir);
  return files;
}

/**
 * Extract icon names from file content
 */
function extractIconNames(content) {
  const icons = new Set();
  
  for (const pattern of ICON_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(content)) !== null) {
      icons.add(match[1]);
    }
  }
  
  return icons;
}

/**
 * Extract existing icon names from icon-sets.js
 */
function getExistingIcons() {
  const existing = new Set();
  
  if (!fs.existsSync(ICON_SETS_FILE)) {
    return existing;
  }
  
  const content = fs.readFileSync(ICON_SETS_FILE, 'utf-8');
  EXISTING_ICON_PATTERN.lastIndex = 0;
  let match;
  while ((match = EXISTING_ICON_PATTERN.exec(content)) !== null) {
    existing.add(match[1]);
  }
  
  return existing;
}

/**
 * Load required icons from configuration file
 */
function getRequiredIcons() {
  const required = new Set();
  
  if (!fs.existsSync(REQUIRED_ICONS_FILE)) {
    return required;
  }
  
  try {
    const content = fs.readFileSync(REQUIRED_ICONS_FILE, 'utf-8');
    const config = JSON.parse(content);
    
    if (Array.isArray(config.icons)) {
      config.icons.forEach(icon => {
        if (typeof icon === 'string' && icon.includes(':')) {
          required.add(icon);
        }
      });
    }
  } catch (e) {
    console.warn(`⚠️  Failed to parse ${REQUIRED_ICONS_FILE}: ${e.message}`);
  }
  
  return required;
}

/**
 * Group icons by prefix
 */
function groupByPrefix(icons) {
  const grouped = {};
  for (const icon of icons) {
    const [prefix, name] = icon.split(':');
    if (!grouped[prefix]) {
      grouped[prefix] = [];
    }
    grouped[prefix].push(name);
  }
  return grouped;
}

/**
 * Fetch icons for a prefix using the batch API
 */
function fetchIconsForPrefix(prefix, iconNames) {
  return new Promise((resolve, reject) => {
    const icons = iconNames.join(',');
    const url = `https://api.iconify.design/${prefix}.json?icons=${icons}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.icons) {
            const results = [];
            for (const [name, iconData] of Object.entries(json.icons)) {
              if (iconData.body) {
                results.push({
                  iconName: `${prefix}:${name}`,
                  body: iconData.body,
                  width: iconData.width || json.width || 24,
                  height: iconData.height || json.height || 24,
                });
              }
            }
            resolve(results);
          } else {
            console.warn(`  ⚠ No icons found for prefix ${prefix}`);
            resolve([]);
          }
        } catch (e) {
          console.warn(`  ⚠ Failed to parse response for ${prefix}: ${e.message}`);
          resolve([]);
        }
      });
    }).on('error', (e) => {
      console.warn(`  ⚠ Failed to fetch ${prefix}: ${e.message}`);
      resolve([]);
    });
  });
}

/**
 * Generate icon entries to append
 */
function generateIconEntries(icons) {
  // Group icons by prefix for organized output
  const grouped = {};
  for (const icon of icons) {
    const [prefix] = icon.iconName.split(':');
    if (!grouped[prefix]) {
      grouped[prefix] = [];
    }
    grouped[prefix].push(icon);
  }
  
  let content = '';
  
  for (const [prefix, prefixIcons] of Object.entries(grouped).sort()) {
    content += `  /**\n   * @set ${prefix} icons (auto-added)\n   */\n`;
    
    for (const icon of prefixIcons.sort((a, b) => a.iconName.localeCompare(b.iconName))) {
      const escapedBody = icon.body.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      content += `  '${icon.iconName}': {\n`;
      content += `    body: '${escapedBody}',\n`;
      content += `  },\n`;
    }
  }
  
  return content;
}

/**
 * Append new icons to icon-sets.js
 */
function appendIconsToFile(newIconEntries) {
  let content = fs.readFileSync(ICON_SETS_FILE, 'utf-8');
  
  // Find the closing brace and semicolon at the end
  const closingMatch = content.match(/\};\s*$/);
  if (!closingMatch) {
    console.error('Could not find closing }; in icon-sets.js');
    return false;
  }
  
  // Insert new icons before the closing };
  const insertPosition = content.lastIndexOf('};');
  const newContent = 
    content.slice(0, insertPosition) + 
    newIconEntries + 
    content.slice(insertPosition);
  
  fs.writeFileSync(ICON_SETS_FILE, newContent, 'utf-8');
  return true;
}

/**
 * Main function
 */
async function main() {
  console.log('🔍 Scanning for icon usage...\n');
  
  const files = findFiles(SRC_DIR);
  console.log(`Found ${files.length} source files\n`);
  
  // Extract all icon names used in code
  const usedIcons = new Set();
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const icons = extractIconNames(content);
    icons.forEach(icon => usedIcons.add(icon));
  }
  
  console.log(`Found ${usedIcons.size} unique icons used in code\n`);
  
  // Load required icons from configuration file
  const requiredIcons = getRequiredIcons();
  if (requiredIcons.size > 0) {
    console.log(`Found ${requiredIcons.size} required icons from configuration:\n`);
    requiredIcons.forEach(icon => {
      console.log(`  - ${icon}`);
      usedIcons.add(icon); // Add to used icons set
    });
    console.log('');
  }
  
  // Get existing icons from icon-sets.js
  const existingIcons = getExistingIcons();
  console.log(`Found ${existingIcons.size} icons already registered\n`);
  
  // Find missing icons (excluding custom/socials which need manual definition)
  const missingIcons = Array.from(usedIcons).filter(icon => {
    if (existingIcons.has(icon)) return false;
    if (icon.startsWith('custom:') || icon.startsWith('socials:')) return false;
    return true;
  });
  
  // Find custom icons that are missing
  const missingCustomIcons = Array.from(usedIcons).filter(icon => {
    if (existingIcons.has(icon)) return false;
    return icon.startsWith('custom:') || icon.startsWith('socials:');
  });
  
  if (missingIcons.length === 0) {
    console.log('✅ All standard icons are already registered!\n');
    
    if (missingCustomIcons.length > 0) {
      console.log('⚠️  Missing custom icons (need manual definition):');
      missingCustomIcons.forEach(icon => console.log(`  - ${icon}`));
    }
    return;
  }
  
  console.log(`Found ${missingIcons.length} missing standard icons:\n`);
  missingIcons.forEach(icon => console.log(`  - ${icon}`));
  console.log('');
  
  if (missingCustomIcons.length > 0) {
    console.log(`Found ${missingCustomIcons.length} missing custom icons (need manual definition):`);
    missingCustomIcons.forEach(icon => console.log(`  - ${icon}`));
    console.log('');
  }
  
  // Group missing icons by prefix
  const grouped = groupByPrefix(missingIcons);
  
  console.log('📥 Fetching missing icons from Iconify API...\n');
  
  const fetchedIcons = [];
  
  for (const [prefix, iconNames] of Object.entries(grouped).sort()) {
    console.log(`  Fetching ${prefix} (${iconNames.length} icons)...`);
    const results = await fetchIconsForPrefix(prefix, iconNames);
    fetchedIcons.push(...results);
    console.log(`    ✓ Got ${results.length}/${iconNames.length} icons`);
    
    // Log icons not found
    const fetchedNames = results.map(r => r.iconName.split(':')[1]);
    const notFound = iconNames.filter(n => !fetchedNames.includes(n));
    if (notFound.length > 0) {
      console.log(`    ⚠ Not found: ${notFound.join(', ')}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  if (fetchedIcons.length === 0) {
    console.log('\n⚠️  No icons were fetched from API');
    return;
  }
  
  console.log(`\n✅ Successfully fetched ${fetchedIcons.length}/${missingIcons.length} icons\n`);
  
  // Generate and append new icons
  const newEntries = generateIconEntries(fetchedIcons);
  
  if (appendIconsToFile(newEntries)) {
    console.log(`📝 Added ${fetchedIcons.length} new icons to ${ICON_SETS_FILE}\n`);
    console.log('Done! New icons are now available offline.');
  } else {
    console.error('Failed to update icon-sets.js');
  }
}

main().catch(console.error);
