const fs = require('fs');

const content = fs.readFileSync('frontend/src/components/VerificationPortal.jsx', 'utf8');

// Find all imports
const imports = [];
const importMatches = content.matchAll(/import\s+(?:{[^}]+}|[^\s,{}]+)\s+from\s+['"][^'"]+['"]/g);
for (const m of importMatches) {
    const names = m[0].match(/{([^}]+)}/);
    if (names) {
        names[1].split(',').forEach(n => imports.push(n.trim().split(/\s+as\s+/).pop()));
    }
    const defaultName = m[0].match(/import\s+([^\s,{}]+)\s+from/);
    if (defaultName) imports.push(defaultName[1]);
}

// Find all defined components/constants in the file
const definitions = [];
const defMatches = content.matchAll(/(?:const|function|class)\s+([A-Z][a-zA-Z0-9]*)/g);
for (const m of defMatches) {
    definitions.push(m[1]);
}

const allAvailable = new Set([...imports, ...definitions, 'React', 'MODES', 'RecentRow', 'LiveQRScanner', 'PdfUploader', 'VerificationPortal']);

// Find all usages of <Component
const usages = content.matchAll(/<([A-Z][a-zA-Z0-9]*)/g);
const missing = [];
for (const m of usages) {
    if (!allAvailable.has(m[1])) {
        missing.push(m[1]);
    }
}

console.log("Missing components:", [...new Set(missing)]);
