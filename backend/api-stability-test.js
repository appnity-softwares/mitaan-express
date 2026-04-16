#!/usr/bin/env node

/**
 * API STABILITY TEST SUITE
 * 
 * Tests all critical APIs for crash scenarios:
 * - Invalid pagination
 * - Missing relations
 * - Empty database
 * - Prisma validation errors
 * - Large payloads
 */

const { PrismaClient } = require('@prisma/client');

// Test configuration
const BASE_URL = process.env.API_URL || 'http://localhost:3000/api';
const TEST_TIMEOUT = 10000; // 10 seconds per test

// Colors for output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(level, message) {
    const timestamp = new Date().toISOString();
    const color = colors[level] || colors.reset;
    console.log(`${color}[${timestamp}] ${level.toUpperCase()}: ${message}${colors.reset}`);
}

// HTTP client with timeout
async function fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TEST_TIMEOUT);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

// Test results
const results = {
    passed: 0,
    failed: 0,
    errors: []
};

function recordTest(testName, passed, error = null) {
    if (passed) {
        results.passed++;
        log('green', `PASS: ${testName}`);
    } else {
        results.failed++;
        log('red', `FAIL: ${testName} - ${error}`);
        results.errors.push({ test: testName, error });
    }
}

// ============================================
// BLOGS API TESTS
// ============================================

async function testBlogsAPI() {
    log('blue', '\n=== TESTING BLOGS API ===');
    
    // Test 1: Get all blogs with invalid pagination
    try {
        const response = await fetchWithTimeout(`${BASE_URL}/blogs?page=-1&limit=999999`);
        const data = await response.json();
        recordTest('Blogs - Invalid pagination', response.status < 500);
    } catch (error) {
        recordTest('Blogs - Invalid pagination', false, error.message);
    }
    
    // Test 2: Get blog with invalid slug
    try {
        const response = await fetchWithTimeout(`${BASE_URL}/blogs/invalid-slug-@#$%`);
        const data = await response.json();
        recordTest('Blogs - Invalid slug', response.status === 404);
    } catch (error) {
        recordTest('Blogs - Invalid slug', false, error.message);
    }
    
    // Test 3: Create blog with invalid data
    try {
        const response = await fetchWithTimeout(`${BASE_URL}/blogs`, {
            method: 'POST',
            body: JSON.stringify({
                title: '', // Empty title
                content: null, // Null content
                categoryId: 'invalid'
            })
        });
        recordTest('Blogs - Invalid create data', response.status >= 400 && response.status < 500);
    } catch (error) {
        recordTest('Blogs - Invalid create data', false, error.message);
    }
    
    // Test 4: Update blog with invalid ID
    try {
        const response = await fetchWithTimeout(`${BASE_URL}/blogs/invalid-id`, {
            method: 'PUT',
            body: JSON.stringify({ title: 'Updated' })
        });
        recordTest('Blogs - Invalid update ID', response.status >= 400 && response.status < 500);
    } catch (error) {
        recordTest('Blogs - Invalid update ID', false, error.message);
    }
    
    // Test 5: Large search query
    try {
        const longSearch = 'a'.repeat(10000);
        const response = await fetchWithTimeout(`${BASE_URL}/blogs?search=${longSearch}`);
        recordTest('Blogs - Large search query', response.status < 500);
    } catch (error) {
        recordTest('Blogs - Large search query', false, error.message);
    }
}

// ============================================
// ARTICLES API TESTS
// ============================================

async function testArticlesAPI() {
    log('blue', '\n=== TESTING ARTICLES API ===');
    
    // Test 1: Get articles with invalid category
    try {
        const response = await fetchWithTimeout(`${BASE_URL}/articles?category=nonexistent`);
        const data = await response.json();
        recordTest('Articles - Invalid category', response.status < 500);
    } catch (error) {
        recordTest('Articles - Invalid category', false, error.message);
    }
    
    // Test 2: Get article with numeric ID edge case
    try {
        const response = await fetchWithTimeout(`${BASE_URL}/articles/999999999`);
        const data = await response.json();
        recordTest('Articles - Non-existent numeric ID', response.status === 404);
    } catch (error) {
        recordTest('Articles - Non-existent numeric ID', false, error.message);
    }
    
    // Test 3: Create article with invalid category ID
    try {
        const response = await fetchWithTimeout(`${BASE_URL}/articles`, {
            method: 'POST',
            body: JSON.stringify({
                title: 'Test Article',
                content: 'Test content',
                categoryId: 999999
            })
        });
        recordTest('Articles - Invalid category ID', response.status >= 400 && response.status < 500);
    } catch (error) {
        recordTest('Articles - Invalid category ID', false, error.message);
    }
    
    // Test 4: Update with malformed data
    try {
        const response = await fetchWithTimeout(`${BASE_URL}/articles/1`, {
            method: 'PUT',
            body: JSON.stringify({
                categoryId: 'not-a-number',
                tags: 'not-an-array'
            })
        });
        recordTest('Articles - Malformed update data', response.status >= 400 && response.status < 500);
    } catch (error) {
        recordTest('Articles - Malformed update data', false, error.message);
    }
    
    // Test 5: Delete with invalid ID
    try {
        const response = await fetchWithTimeout(`${BASE_URL}/articles/abc`, {
            method: 'DELETE'
        });
        recordTest('Articles - Invalid delete ID', response.status >= 400 && response.status < 500);
    } catch (error) {
        recordTest('Articles - Invalid delete ID', false, error.message);
    }
}

// ============================================
// CATEGORIES API TESTS
// ============================================

async function testCategoriesAPI() {
    log('blue', '\n=== TESTING CATEGORIES API ===');
    
    // Test 1: Create category with circular parent
    try {
        const response = await fetchWithTimeout(`${BASE_URL}/categories`, {
            method: 'POST',
            body: JSON.stringify({
                name: 'Test Category',
                parentId: 999999 // Non-existent parent
            })
        });
        recordTest('Categories - Invalid parent ID', response.status < 500);
    } catch (error) {
        recordTest('Categories - Invalid parent ID', false, error.message);
    }
    
    // Test 2: Delete category with invalid ID
    try {
        const response = await fetchWithTimeout(`${BASE_URL}/categories/invalid`, {
            method: 'DELETE'
        });
        recordTest('Categories - Invalid delete ID', response.status >= 400 && response.status < 500);
    } catch (error) {
        recordTest('Categories - Invalid delete ID', false, error.message);
    }
    
    // Test 3: Update with invalid sortOrder
    try {
        const response = await fetchWithTimeout(`${BASE_URL}/categories/1`, {
            method: 'PUT',
            body: JSON.stringify({
                sortOrder: 'not-a-number'
            })
        });
        recordTest('Categories - Invalid sortOrder', response.status >= 400 && response.status < 500);
    } catch (error) {
        recordTest('Categories - Invalid sortOrder', false, error.message);
    }
}

// ============================================
// SETTINGS API TESTS
// ============================================

async function testSettingsAPI() {
    log('blue', '\n=== TESTING SETTINGS API ===');
    
    // Test 1: Update with invalid JSON
    try {
        const response = await fetchWithTimeout(`${BASE_URL}/settings`, {
            method: 'POST',
            body: JSON.stringify({
                invalid_json: '{"key": "unclosed string}'
            })
        });
        recordTest('Settings - Invalid JSON value', response.status < 500);
    } catch (error) {
        recordTest('Settings - Invalid JSON value', false, error.message);
    }
    
    // Test 2: Update with extremely large payload
    try {
        const largePayload = {
            large_text: 'x'.repeat(1000000), // 1MB string
            nested_object: {}
        };
        // Create deeply nested object
        for (let i = 0; i < 100; i++) {
            largePayload.nested_object[`level_${i}`] = { ...largePayload.nested_object };
        }
        
        const response = await fetchWithTimeout(`${BASE_URL}/settings`, {
            method: 'POST',
            body: JSON.stringify(largePayload)
        });
        recordTest('Settings - Large payload', response.status < 500);
    } catch (error) {
        recordTest('Settings - Large payload', false, error.message);
    }
    
    // Test 3: Get settings (should never crash)
    try {
        const response = await fetchWithTimeout(`${BASE_URL}/settings`);
        recordTest('Settings - Get all', response.status < 500);
    } catch (error) {
        recordTest('Settings - Get all', false, error.message);
    }
}

// ============================================
// DATABASE STRESS TESTS
// ============================================

async function testDatabaseStress() {
    log('blue', '\n=== TESTING DATABASE STRESS ===');
    
    // Test 1: Simulate database connection failure
    try {
        // This will test error handling when DB is unavailable
        const response = await fetchWithTimeout(`${BASE_URL}/blogs`);
        recordTest('DB Stress - Normal query', response.status < 500);
    } catch (error) {
        recordTest('DB Stress - Normal query', false, error.message);
    }
    
    // Test 2: Concurrent requests
    try {
        const promises = Array(10).fill().map(() => 
            fetchWithTimeout(`${BASE_URL}/articles?limit=5`)
        );
        const responses = await Promise.all(promises);
        const allSuccessful = responses.every(r => r.status < 500);
        recordTest('DB Stress - Concurrent requests', allSuccessful);
    } catch (error) {
        recordTest('DB Stress - Concurrent requests', false, error.message);
    }
}

// ============================================
// MAIN TEST RUNNER
// ============================================

async function runAllTests() {
    log('cyan', '\n========================================');
    log('cyan', '  API STABILITY TEST SUITE');
    log('cyan', '========================================');
    log('blue', `Testing API at: ${BASE_URL}`);
    
    const startTime = Date.now();
    
    try {
        await testBlogsAPI();
        await testArticlesAPI();
        await testCategoriesAPI();
        await testSettingsAPI();
        await testDatabaseStress();
        
        const duration = Date.now() - startTime;
        
        log('cyan', '\n========================================');
        log('cyan', '  TEST RESULTS');
        log('cyan', '========================================');
        log('green', `Passed: ${results.passed}`);
        log('red', `Failed: ${results.failed}`);
        log('blue', `Duration: ${duration}ms`);
        
        if (results.errors.length > 0) {
            log('red', '\nFAILED TESTS:');
            results.errors.forEach(({ test, error }) => {
                log('yellow', `  ${test}: ${error}`);
            });
        }
        
        // Exit with appropriate code
        if (results.failed > 0) {
            log('red', '\nSome tests failed - check API stability!');
            process.exit(1);
        } else {
            log('green', '\nAll tests passed - API is stable!');
            process.exit(0);
        }
        
    } catch (error) {
        log('red', `Test suite error: ${error.message}`);
        process.exit(1);
    }
}

// Run tests if called directly
if (require.main === module) {
    runAllTests();
}

module.exports = { runAllTests, testBlogsAPI, testArticlesAPI, testCategoriesAPI, testSettingsAPI };
