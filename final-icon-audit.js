const fs = require('fs');
const content = fs.readFileSync('frontend/src/components/VerificationPortal.jsx', 'utf8');

const lucideMatch = content.match(/import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/);
const importedIcons = lucideMatch[1].split(',').map(i => i.trim()).filter(i => i);

console.log("Imported Icons:", importedIcons);

const tags = content.matchAll(/<([A-Z][a-zA-Z0-9]*)/g);
const usedAsTags = [...new Set([...tags].map(m => m[1]))];

const mappedIcons = content.matchAll(/icon:\s*([A-Z][a-zA-Z0-9]*)/g);
const usedInMaps = [...new Set([...mappedIcons].map(m => m[1]))];

const allUsed = [...new Set([...usedAsTags, ...usedInMaps])];

const nativeOrDefined = ['React', 'AnimatePresence', 'motion', 'QRCodeSVG', 'MODES', 'RecentRow', 'LiveQRScanner', 'PdfUploader', 'VerificationPortal', 'Icon'];

const missing = allUsed.filter(u => !importedIcons.includes(u) && !nativeOrDefined.includes(u));

console.log("All Used:", allUsed);
console.log("Missing Icons:", missing);
