const fs = require('fs');

const content = fs.readFileSync('frontend/src/components/VerificationPortal.jsx', 'utf8');

// Find the component body
const bodyMatch = content.match(/const VerificationPortal = \({ user }\) => {([\s\S]*?)};/);
if (!bodyMatch) {
    console.log("Could not find VerificationPortal component body");
    process.exit(1);
}
const body = bodyMatch[1];

// Find all defined variables in the component
const vars = new Set(['user', 'MODES', 'RecentRow', 'LiveQRScanner', 'PdfUploader', 'VerificationPortal']);
const varMatches = body.matchAll(/(?:const|let|var)\s+(?:{([^}]+)}|([a-zA-Z0-9_]+))/g);
for (const m of varMatches) {
    if (m[1]) {
        m[1].split(',').forEach(v => vars.add(v.trim().split(':')[0].trim()));
    } else if (m[2]) {
        vars.add(m[2]);
    }
}

// Find all functions
const funcMatches = body.matchAll(/function\s+([a-zA-Z0-9_]+)/g);
for (const m of funcMatches) {
    vars.add(m[1]);
}
const arrowFuncMatches = body.matchAll(/const\s+([a-zA-Z0-9_]+)\s*=\s*(?:async\s*)?\(/g);
for (const m of arrowFuncMatches) {
    vars.add(m[1]);
}

// Global/Imported variables
const globals = ['React', 'useState', 'useRef', 'useEffect', 'useCallback', 'axios', 'QRCodeSVG', 'html2canvas', 'jsPDF', 'window', 'Math', 'new', 'Date', 'encodeURIComponent', 'setTimeout', 'document', 'navigator', 'alert'];
globals.forEach(g => vars.add(g));

// Icons
const icons = ['Search', 'QrCode', 'ShieldCheck', 'AlertTriangle', 'User', 'Calendar', 'BookOpen', 'MapPin', 'Clock', 'ExternalLink', 'Activity', 'X', 'Download', 'Database', 'FileText', 'Upload', 'Camera', 'CheckCircle2', 'Loader2', 'ScanLine', 'RefreshCw', 'Briefcase'];
icons.forEach(i => vars.add(i));

// Find all usages in JSX
const jsxMatches = content.matchAll(/{([^}]+)}/g);
const missing = [];
for (const m of jsxMatches) {
    const expr = m[1].trim();
    // Simple check for variables in the expression
    const tokens = expr.match(/[a-zA-Z0-9_]+/g);
    if (tokens) {
        for (const t of tokens) {
            // Check if it's a variable or part of a path (like user.role)
            // This is a naive check.
            if (!vars.has(t) && !/^[0-9]+$/.test(t) && !['true', 'false', 'null', 'undefined', 'e', 'm', 'Icon', 'active', 'id', 'label', 'sub', 'i', 'v', 'cert'].includes(t)) {
                // Check if it's a property access
                if (!expr.includes('.' + t) && !expr.includes(t + ':')) {
                    missing.push(t);
                }
            }
        }
    }
}

console.log("Potential missing variables:", [...new Set(missing)]);
