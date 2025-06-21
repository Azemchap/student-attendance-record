// test-prisma.js - Run this file to test your Prisma connection
// Run with: node test-prisma.js

import { prisma } from './lib/prisma.js';

async function testPrisma() {
    try {
        console.log('Testing Prisma connection...');
        console.log('Prisma client:', !!prisma);
        console.log('Prisma type:', typeof prisma);

        // Test connection
        await prisma.$connect();
        console.log('✅ Connected to database successfully');

        // Test a simple query
        const count = await prisma.classroom.count();
        console.log('✅ Query successful - classroom count:', count);

        await prisma.$disconnect();
        console.log('✅ Disconnected successfully');

    } catch (error) {
        console.error('❌ Error testing Prisma:', error);
        console.error('Error type:', typeof error);
        console.error('Error message:', error?.message || 'No message');
    }
}

testPrisma();