import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.join(__dirname, '../public/media-manifest.json');

const manifest = {
  portraits: {},
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

// --- WRITE MANIFEST ---
fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));

console.log(`✅ Generated media manifest:`);
console.log(`   Portraits: ${Object.keys(manifest.portraits).length}`);