import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try { await prisma.$executeRawUnsafe(`ALTER TABLE movies SET (schema_locked = false);`); } catch(e){}
  try { await prisma.$executeRawUnsafe(`ALTER TABLE series SET (schema_locked = false);`); } catch(e){}
  try { await prisma.$executeRawUnsafe(`ALTER TABLE seasons SET (schema_locked = false);`); } catch(e){}
  try { await prisma.$executeRawUnsafe(`ALTER TABLE episodes SET (schema_locked = false);`); } catch(e){}
  console.log("Unlocked tables.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
