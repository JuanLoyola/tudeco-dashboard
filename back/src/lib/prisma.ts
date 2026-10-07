import { PrismaClient } from '@prisma/client';

/**
 * Instancia única de Prisma. Los módulos reciben esta instancia por
 * constructor (inyección de dependencias) en lugar de importarla por su cuenta.
 */
export const prisma = new PrismaClient();
