import { PrismaClient, type MovementType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Reset limpio: el seed es idempotente.
  await prisma.stockMovement.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  const lamparas = await prisma.category.create({ data: { name: 'Lámparas', slug: 'lamparas' } });
  const personalizados = await prisma.category.create({
    data: { name: 'Personalizados', slug: 'personalizados' },
  });
  const accesorios = await prisma.category.create({
    data: { name: 'Accesorios', slug: 'accesorios' },
  });

  const products = [
    { sku: 'LMP-001', name: 'Lámpara Aurora', price: 18000, cost: 6500, minStock: 3, categoryId: lamparas.id },
    { sku: 'LMP-002', name: 'Lámpara Minimalista', price: 14500, cost: 5200, minStock: 3, categoryId: lamparas.id },
    { sku: 'LMP-003', name: 'Lámpara Rombo', price: 16000, cost: 5800, minStock: 2, categoryId: lamparas.id },
    { sku: 'PER-001', name: 'Llavero con nombre', price: 3500, cost: 900, minStock: 10, categoryId: personalizados.id },
    { sku: 'PER-002', name: 'Llavero de mascota', price: 4200, cost: 1200, minStock: 10, categoryId: personalizados.id },
    { sku: 'PER-003', name: 'Frase personalizada', price: 5800, cost: 1700, minStock: 5, categoryId: personalizados.id },
    { sku: 'ACC-001', name: 'Soporte de celular', price: 6500, cost: 1900, minStock: 4, categoryId: accesorios.id },
    { sku: 'ACC-002', name: 'Portaovillos', price: 2800, cost: 700, minStock: 6, categoryId: accesorios.id },
  ];

  /** El stock real se construye con movimientos, igual que en producción. */
  async function addStock(productId: number, type: MovementType, quantity: number, reason?: string) {
    const delta = type === 'ENTRY' ? quantity : type === 'EXIT' ? -quantity : quantity;
    await prisma.$transaction([
      prisma.product.update({ where: { id: productId }, data: { stock: { increment: delta } } }),
      prisma.stockMovement.create({ data: { productId, type, quantity, reason } }),
    ]);
  }

  for (const data of products) {
    const product = await prisma.product.create({ data: { ...data, stock: 0 } });
    await addStock(product.id, 'ENTRY', Math.ceil(data.minStock * 2.5), 'Reposición inicial');
  }

  // Algun movimiento de salida para que el dashboard tenga historia.
  const aurora = products[0];
  const first = await prisma.product.findUniqueOrThrow({ where: { sku: aurora.sku } });
  await addStock(first.id, 'EXIT', 4, 'Venta feria');

  const llavero = await prisma.product.findUniqueOrThrow({ where: { sku: 'PER-001' } });
  await addStock(llavero.id, 'ADJUSTMENT', 6, 'Corrección por merma de filamento');
  await addStock(llavero.id, 'EXIT', 5, 'Venta mayorista');

  const count = await prisma.product.count();
  console.log(`Seed OK: ${count} productos y sus movimientos de stock.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
