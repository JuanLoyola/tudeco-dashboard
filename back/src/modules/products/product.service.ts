import { BusinessRuleError, ConflictError, NotFoundError } from '../../shared/errors';
import type { CategoryRepository } from '../categories/category.repository';
import type { ProductRepository } from './product.repository';
import type { CreateProductInput, ListProductsQuery, UpdateProductInput } from './product.schemas';
import { toProductDTO, type PaginationMeta, type ProductDTO } from './product.types';

/** Reglas de negocio de productos. No sabe nada de HTTP ni de Express. */
export class ProductService {
  constructor(
    private readonly products: ProductRepository,
    private readonly categories: CategoryRepository,
  ) {}

  async list(query: ListProductsQuery): Promise<{ data: ProductDTO[]; meta: PaginationMeta }> {
    const { rows, total } = await this.products.findPage(query);

    return {
      data: rows.map(toProductDTO),
      meta: {
        page: query.page,
        take: query.take,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.take)),
      },
    };
  }

  async get(id: number): Promise<ProductDTO> {
    return toProductDTO(await this.requireProduct(id));
  }

  async create(input: CreateProductInput): Promise<ProductDTO> {
    if (await this.products.findBySku(input.sku)) {
      throw new ConflictError(`Ya existe un producto con el SKU "${input.sku}"`);
    }
    await this.ensureCategory(input.categoryId);

    return toProductDTO(await this.products.create(input));
  }

  async update(id: number, input: UpdateProductInput): Promise<ProductDTO> {
    await this.requireProduct(id);
    if (input.sku && (await this.products.findBySku(input.sku, id))) {
      throw new ConflictError(`Ya existe otro producto con el SKU "${input.sku}"`);
    }
    await this.ensureCategory(input.categoryId);

    // `undefined` no pisa el valor; `null` sí (borra la categoría, por ejemplo).
    const data = Object.fromEntries(
      Object.entries(input).filter(([, value]) => value !== undefined),
    );

    return toProductDTO(await this.products.update(id, data));
  }

  async remove(id: number): Promise<void> {
    const product = await this.requireProduct(id);

    if (await this.products.hasMovements(product.id)) {
      throw new BusinessRuleError(
        'No se puede eliminar un producto con historial de stock. Desactivalo con PATCH /api/products/:id',
      );
    }

    await this.products.remove(product.id);
  }

  private async requireProduct(id: number) {
    const product = await this.products.findById(id);
    if (!product) throw new NotFoundError('Producto', id);
    return product;
  }

  private async ensureCategory(categoryId?: number | null): Promise<void> {
    if (categoryId === undefined || categoryId === null) return;
    if (!(await this.categories.findById(categoryId))) {
      throw new NotFoundError('Categoría', categoryId);
    }
  }
}
