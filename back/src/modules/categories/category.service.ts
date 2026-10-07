import type { Category } from '@prisma/client';
import { ConflictError } from '../../shared/errors';
import { slugify } from '../../shared/slug';
import type { CategoryRepository } from './category.repository';
import type { CreateCategoryInput } from './category.schemas';

export class CategoryService {
  constructor(private readonly categories: CategoryRepository) {}

  list(): Promise<Category[]> {
    return this.categories.findAll();
  }

  async create(input: CreateCategoryInput): Promise<Category> {
    const slug = input.slug ?? slugify(input.name);

    if (await this.categories.findBySlug(slug)) {
      throw new ConflictError(`Ya existe una categoría con el slug "${slug}"`);
    }

    return this.categories.create({ name: input.name, slug });
  }
}
