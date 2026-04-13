
const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules')) {
                results = results.concat(walk(file));
            }
        } else {
            if (file.endsWith('.js')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./backend');

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    // Search for prisma calls that have both select: and include: in the same object block
    // This is a naive regex but might catch simple cases
    const regex = /prisma\.[a-zA-Z]+\.[a-zA-Z]+\(\{[\s\S]*?\}\)/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        const block = match[0];
        if (block.includes('select:') && block.includes('include:')) {
            console.log(`Found mixed query in ${file}:`);
            console.log(block);
            console.log('-------------------');
        }
    }
});
