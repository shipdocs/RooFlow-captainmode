#!/usr/bin/env node

/**
 * Post-installation script for rooflow-captainmode
 * This script runs after the package is installed and checks if the user wants to initialize
 * the RooFlow Captain Mode in their project.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get the project root directory (where the package is installed)
const projectRoot = process.env.INIT_CWD || process.cwd();

console.log('Thank you for installing RooFlow Captain Mode!');
console.log('');
console.log('To initialize RooFlow Captain Mode in your project, run:');
console.log('  npx rooflow-captainmode init');
console.log('');
console.log('This will create all necessary configuration files and the memory-bank directory in your project.');
console.log('');
console.log('For more information, see the documentation at:');
console.log('  https://github.com/shipdocs/RooFlow-captainmode');
