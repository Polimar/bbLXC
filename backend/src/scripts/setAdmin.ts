import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setAdminUser() {
    try {
        const user = await prisma.user.update({
            where: { email: 'valerio@free-ware.it' },
            data: { isAdmin: true },
        });

        console.log('✅ User updated successfully:');
        console.log(`   Email: ${user.email}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   isAdmin: ${user.isAdmin}`);
        console.log(`   accountType: ${user.accountType}`);
    } catch (error: any) {
        if (error.code === 'P2025') {
            console.error('❌ User not found. Creating admin user...');
            // User doesn't exist, we could create it here if needed
            console.log('Please register the user first, then run this script again.');
        } else {
            console.error('Error:', error);
        }
    } finally {
        await prisma.$disconnect();
    }
}

setAdminUser();
