import { prisma } from '../../src/lib/prisma';

/** Estado limpio antes de cada test de integración. */
export async function resetDatabase(): Promise<void> {
  await prisma.stockMovement.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
}

export async function disconnect(): Promise<void> {
  await prisma.$disconnect();
}
