import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.join(__dirname, '../public/media-manifest.json');

const manifest = {
  portraits: {},
  traits: [],
  status: []
};

// --- PORTRAITS ---
const portraitsDir = path.join(__dirname, '../public/portraits');

if (fs.existsSync(portraitsDir)) {
  const files = fs.readdirSync(portraitsDir);
  
  files.forEach(file => {
    const match = file.match(/^([A-Z]+)_([MF])_([YMO])_(\d+)\.png$/);
    if (match) {
      const [, profession, sex, age, id] = match;
      const key = `${profession}_${sex}_${id}`;
      
      if (!manifest.portraits[key]) {
        manifest.portraits[key] = [];
      }
      manifest.portraits[key].push(age);
    }
  });

  Object.keys(manifest.portraits).forEach(key => {
    manifest.portraits[key].sort((a, b) => {
      const order = { 'Y': 0, 'M': 1, 'O': 2 };
      return order[a] - order[b];
    });
  });
}

// --- TRAITS ---
const traitsDir = path.join(__dirname, '../public/traits');

if (fs.existsSync(traitsDir)) {
  const files = fs.readdirSync(traitsDir);
  
  files.forEach(file => {
    const match = file.match(/^([A-Z_]+)\.png$/);
    if (match) {
      manifest.traits.push(match[1]);
    }
  });

  manifest.traits.sort();
}

// --- STATUS ---
const statusDir = path.join(__dirname, '../public/status');

if (fs.existsSync(statusDir)) {
  const files = fs.readdirSync(statusDir);
  
  files.forEach(file => {
    const match = file.match(/^([A-Z_]+)\.png$/i);
    if (match) {
      manifest.status.push(match[1].toUpperCase());
    }
  });

  manifest.status.sort();
}

// --- WRITE MANIFEST ---
fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));

console.log(`✅ Generated media manifest:`);
console.log(`   Portraits: ${Object.keys(manifest.portraits).length}`);
console.log(`   Traits: ${manifest.traits.length}`);
console.log(`   Status: ${manifest.status.length}`);

if (Object.keys(manifest.portraits).length === 0) {
  console.log('⚠️  No portraits found. Place .png files in public/portraits/');
}
if (manifest.traits.length === 0) {
  console.log('⚠️  No traits found. Place .png files in public/traits/');
}
if (manifest.status.length === 0) {
  console.log('⚠️  No status icons found. Place ART.png and COM.png in public/status/');
}