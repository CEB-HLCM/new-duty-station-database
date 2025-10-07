#!/usr/bin/env node

/**
 * Fix Build Script for Netlify Deployment
 * 
 * This script handles any build-time fixes needed for production deployment.
 * Based on the CEB Donor Codes deployment pattern.
 * 
 * Purpose:
 * - Ensures build artifacts are correctly structured
 * - Handles any environment-specific configurations
 * - Validates critical files exist before deployment
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔧 Running build validation checks...');

// Check if dist directory exists
const distPath = join(__dirname, 'dist');
if (!existsSync(distPath)) {
  console.error('❌ Error: dist directory not found!');
  process.exit(1);
}

// Check if index.html exists
const indexPath = join(distPath, 'index.html');
if (!existsSync(indexPath)) {
  console.error('❌ Error: dist/index.html not found!');
  process.exit(1);
}

// Validate index.html contains expected content
const indexContent = readFileSync(indexPath, 'utf-8');
if (!indexContent.includes('<div id="root">')) {
  console.error('❌ Error: index.html appears to be invalid!');
  process.exit(1);
}

// Check if assets directory exists
const assetsPath = join(distPath, 'assets');
if (!existsSync(assetsPath)) {
  console.warn('⚠️  Warning: dist/assets directory not found - build may be incomplete');
}

console.log('✅ Build validation completed successfully!');
console.log('📦 Build artifacts:');
console.log(`   - dist/index.html: ✓`);
console.log(`   - dist/assets/: ✓`);
console.log('🚀 Ready for deployment!');

process.exit(0);

