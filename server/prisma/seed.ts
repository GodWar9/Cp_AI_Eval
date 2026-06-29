import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create clear test users
  const testUsers = [
    {
      email: 'test1@example.com',
      displayName: 'Test User 1',
      password: 'password123',
    },
    {
      email: 'test2@example.com',
      displayName: 'Test User 2',
      password: 'password123',
    },
    {
      email: 'test3@example.com',
      displayName: 'Test User 3',
      password: 'password123',
    }
  ];

  for (const user of testUsers) {
    const passwordHash = await bcrypt.hash(user.password, 12);
    
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        displayName: user.displayName,
        passwordHash,
      },
    });
    console.log(`Created test user: ${user.email}`);
  }

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
