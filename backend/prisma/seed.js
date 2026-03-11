const { PrismaClient, Role } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const DEMO_USERS = [
  {
    email: 'seller@collector.local',
    password: 'Seller123!',
    role: Role.seller,
  },
  {
    email: 'admin@collector.local',
    password: 'Admin123!',
    role: Role.admin,
  },
];

async function main() {
  for (const user of DEMO_USERS) {
    const passwordHash = await bcrypt.hash(user.password, 10);

    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        passwordHash,
        role: user.role,
      },
      create: {
        email: user.email,
        passwordHash,
        role: user.role,
      },
    });
  }

  console.log('Seed completed: seller and admin users are ready.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
