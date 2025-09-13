#!/usr/bin/env node

/**
 * Quick Setup Script for SaaS Backend
 * Run: node scripts/setup.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🚀 Setting up SaaS Backend...\n');

// Generate secure JWT secret
const jwtSecret = crypto.randomBytes(64).toString('hex');

// Read current .env file
const envPath = path.join(__dirname, '../.env');
let envContent = '';

if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    console.log('✅ Found existing .env file');
} else {
    console.log('❌ No .env file found');
    process.exit(1);
}

// Update JWT secret if it's the default one
if (envContent.includes('your-super-secret-jwt-key-here-make-it-long-and-random-12345')) {
    envContent = envContent.replace(
        'JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random-12345',
        `JWT_SECRET=${jwtSecret}`
    );
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Generated secure JWT secret');
} else {
    console.log('✅ JWT secret already configured');
}

// Check configuration
console.log('\n📋 Configuration Check:');

const requiredVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'IYZICO_API_KEY',
    'IYZICO_SECRET_KEY',
    'FRONTEND_URL'
];

const missingVars = [];

requiredVars.forEach(varName => {
    if (envContent.includes(`${varName}=your-`) || 
        envContent.includes(`${varName}=mongodb://localhost`) ||
        !envContent.includes(`${varName}=`)) {
        missingVars.push(varName);
        console.log(`❌ ${varName}: Not configured`);
    } else {
        console.log(`✅ ${varName}: Configured`);
    }
});

// Print next steps
console.log('\n🎯 Next Steps:');

if (missingVars.length > 0) {
    console.log('\n❗ Required Configuration:');
    missingVars.forEach(varName => {
        switch (varName) {
            case 'MONGODB_URI':
                console.log(`   ${varName}: Get from MongoDB Atlas`);
                break;
            case 'IYZICO_API_KEY':
            case 'IYZICO_SECRET_KEY':
                console.log(`   ${varName}: Get from Iyzico Merchant Panel`);
                break;
            default:
                console.log(`   ${varName}: Update in .env file`);
        }
    });
    console.log('\n   Update these in your .env file, then run:');
    console.log('   npm run dev');
} else {
    console.log('1. Install dependencies: npm install');
    console.log('2. Start development: npm run dev');
    console.log('3. Deploy to Vercel: vercel --prod');
}

console.log('\n📚 Documentation: See SAAS_DEPLOYMENT.md');
console.log('🔗 Frontend: Connect to your deployed backend URL');

console.log('\n🎉 Setup complete! Happy coding!');