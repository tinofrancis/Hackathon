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
        .replace(/emerald/g, 'violet')
        .replace(/cyan/g, 'fuchsia')
        .replace(/teal/g, 'purple');

    if (file.endsWith('index.css')) {
        // Handle specific hex codes in index.css
        newContent = newContent.replace('--primary: #10b981;', '--primary: #8b5cf6;');
        newContent = newContent.replace('--primary-hover: #059669;', '--primary-hover: #7c3aed;');
        newContent = newContent.replace('--secondary: #06b6d4;', '--secondary: #d946ef;');
        newContent = newContent.replace('--accent: #2dd4bf;', '--accent: #f472b6;');

        // Also fix the utility class hex codes
        newContent = newContent.replace('color: #34d399;', 'color: #a78bfa;');
        newContent = newContent.replace('color: #6ee7b7;', 'color: #c4b5fd;');
        newContent = newContent.replace('color: #22d3ee;', 'color: #e879f9;');
        newContent = newContent.replace('background-color: #059669;', 'background-color: #7c3aed;');
        newContent = newContent.replace('background-color: #10b981;', 'background-color: #8b5cf6;');
    }

    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log(`Updated ${file}`);
    }
});
