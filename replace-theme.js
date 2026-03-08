const fs = require('fs');
const path = require('path');

const dir = 'c:/hackthon/blockchain/blockchain-portal/frontend/src';

function walk(directory) {
    let results = [];
    const list = fs.readdirSync(directory);
    list.forEach(file => {
        file = path.join(directory, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.css')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(dir);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let newContent = content
        .replace(/violet/g, 'emerald')
        .replace(/fuchsia/g, 'cyan')
        .replace(/purple/g, 'teal');

    if (file.endsWith('index.css')) {
        // Handle specific hex codes in index.css
        newContent = newContent.replace('--primary: #8b5cf6;', '--primary: #10b981;');
        newContent = newContent.replace('--primary-hover: #7c3aed;', '--primary-hover: #059669;');
        newContent = newContent.replace('--secondary: #d946ef;', '--secondary: #06b6d4;');
        newContent = newContent.replace('--accent: #f472b6;', '--accent: #2dd4bf;');

        // Also fix the utility class hex codes
        newContent = newContent.replace('color: #a78bfa;', 'color: #34d399;'); // emerald-400
        newContent = newContent.replace('color: #c4b5fd;', 'color: #6ee7b7;'); // emerald-300
        newContent = newContent.replace('color: #e879f9;', 'color: #22d3ee;'); // cyan-400
        newContent = newContent.replace('background-color: #7c3aed;', 'background-color: #059669;'); // emerald-600
        newContent = newContent.replace('background-color: #8b5cf6;', 'background-color: #10b981;'); // emerald-500
    }

    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log(`Updated ${file}`);
    }
});
