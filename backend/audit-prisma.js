#!/usr/bin/env node

/**
 * PRISMA QUERY AUDIT SCRIPT
 * 
 * Scans all controller files for potential Prisma query issues:
 * 1. Mixed select + include (causes validation error)
 * 2. Missing error handling
 * 3. Unsafe queries
 */

const fs = require('fs');
const path = require('path');

const CONTROLLERS_DIR = path.join(__dirname, 'controllers');

const ISSUES = [];

function scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const basename = path.basename(filePath);
    
    // Track if we're inside a prisma query
    let inPrismaQuery = false;
    let queryStartLine = 0;
    let braceCount = 0;
    let currentQuery = [];
    
    lines.forEach((line, index) => {
        const lineNum = index + 1;
        
        // Detect start of prisma query
        if (/prisma\.[a-zA-Z]+\.(findMany|findUnique|findFirst|create|update|delete|upsert)\(/.test(line)) {
            inPrismaQuery = true;
            queryStartLine = lineNum;
            braceCount = 0;
            currentQuery = [line];
        }
        
        if (inPrismaQuery) {
            if (line.includes('{')) braceCount += (line.match(/{/g) || []).length;
            if (line.includes('}')) braceCount -= (line.match(/}/g) || []).length;
            
            currentQuery.push(line);
            
            // Query ended
            if (braceCount <= 0 && currentQuery.length > 1) {
                inPrismaQuery = false;
                const queryText = currentQuery.join('\n');
                
                // Check for select + include mix (top level only)
                // Look for patterns like: select: { ... } and include: { ... } at same nesting level
                const hasTopLevelSelect = /select:\s*\{/.test(queryText);
                const hasTopLevelInclude = /include:\s*\{/.test(queryText);
                
                if (hasTopLevelSelect && hasTopLevelInclude) {
                    ISSUES.push({
                        file: basename,
                        line: queryStartLine,
                        type: 'ERROR',
                        message: 'Query uses both select: and include: at top level - Prisma validation error!',
                        code: queryText.substring(0, 200) + '...'
                    });
                }
                
                // Check for select inside select (nested select is OK)
                // This is actually valid - just for informational purposes
                const selectMatches = queryText.match(/select:/g);
                if (selectMatches && selectMatches.length > 1) {
                    // Multiple selects - likely nested, which is OK
                    // But let's flag it for review
                    const isNestedSelect = /[a-zA-Z]+:\s*\{\s*\n?\s*select:/.test(queryText);
                    if (!isNestedSelect) {
                        ISSUES.push({
                            file: basename,
                            line: queryStartLine,
                            type: 'WARNING',
                            message: 'Multiple top-level select: keys detected - may be invalid',
                            code: queryText.substring(0, 150) + '...'
                        });
                    }
                }
                
                // Check for queries without try-catch in the same function scope
                // This is a simplified check - we look for try blocks
                const hasTryCatch = content.includes('try {');
                if (!hasTryCatch) {
                    ISSUES.push({
                        file: basename,
                        line: queryStartLine,
                        type: 'WARNING',
                        message: 'File may lack try-catch error handling - verify manually',
                        code: queryText.substring(0, 100) + '...'
                    });
                }
                
                currentQuery = [];
            }
        }
    });
}

function main() {
    console.log('========================================');
    console.log('  PRISMA QUERY AUDIT');
    console.log('========================================\n');
    
    const files = fs.readdirSync(CONTROLLERS_DIR)
        .filter(f => f.endsWith('.controller.js'))
        .map(f => path.join(CONTROLLERS_DIR, f));
    
    console.log(`Scanning ${files.length} controller files...\n`);
    
    files.forEach(scanFile);
    
    if (ISSUES.length === 0) {
        console.log('\x1b[32m✓ No issues found!\x1b[0m');
        console.log('\nQueries appear to follow Prisma best practices.');
    } else {
        const errors = ISSUES.filter(i => i.type === 'ERROR');
        const warnings = ISSUES.filter(i => i.type === 'WARNING');
        
        if (errors.length > 0) {
            console.log(`\x1b[31m${errors.length} ERROR(S) FOUND:\x1b[0m\n`);
            errors.forEach(issue => {
                console.log(`  File: ${issue.file}:${issue.line}`);
                console.log(`  Type: ${issue.type}`);
                console.log(`  Issue: ${issue.message}`);
                console.log(`  Code preview:`);
                console.log('  ' + issue.code.split('\n').join('\n  '));
                console.log('');
            });
        }
        
        if (warnings.length > 0) {
            console.log(`\x1b[33m${warnings.length} WARNING(S) FOUND:\x1b[0m\n`);
            warnings.forEach(issue => {
                console.log(`  File: ${issue.file}:${issue.line}`);
                console.log(`  Issue: ${issue.message}`);
                console.log('');
            });
        }
        
        console.log('========================================');
        console.log('HOW TO FIX SELECT+INCLUDE ERROR:');
        console.log('========================================');
        console.log('');
        console.log('Instead of:');
        console.log('  prisma.model.findMany({');
        console.log('    select: { id: true, name: true },');
        console.log('    include: { relation: true }  // ❌ Cannot mix!');
        console.log('  })');
        console.log('');
        console.log('Use ONE of these approaches:');
        console.log('');
        console.log('Option 1 - Use select with nested select:');
        console.log('  prisma.model.findMany({');
        console.log('    select: {');
        console.log('      id: true,');
        console.log('      name: true,');
        console.log('      relation: {');
        console.log('        select: { id: true, name: true }  // ✓ Nested select');
        console.log('      }');
        console.log('    }');
        console.log('  })');
        console.log('');
        console.log('Option 2 - Use include without select:');
        console.log('  prisma.model.findMany({');
        console.log('    include: {');
        console.log('      relation: true  // ✓ Include only');
        console.log('    }');
        console.log('  })');
        console.log('');
    }
}

main();
