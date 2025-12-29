import { PrismaClient } from '@prisma/client';
import { ICategoryRepository } from '../../domain/interfaces/ICategoryRepository';
import { Category } from '../../domain/entities/Category';

export class CategoryRepository implements ICategoryRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    return categories.map(cat => Category.fromDatabase(cat.id, cat.name, cat.description, cat.color));
  }

  async findById(id: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    return category ? Category.fromDatabase(category.id, category.name, category.description, category.color) : null;
  }

  async create(data: Omit<Category, 'id'>): Promise<Category> {
    const category = await this.prisma.category.create({
      data: {
        name: data.name,
        description: data.description,
        color: data.color,
      },
    });
    return Category.fromDatabase(category.id, category.name, category.description, category.color);
  }

  async update(category: Category): Promise<Category> {
    const updated = await this.prisma.category.update({
      where: { id: category.id },
      data: {
        name: category.name,
        description: category.description,
        color: category.color,
      },
    });
    return Category.fromDatabase(updated.id, updated.name, updated.description, updated.color);
  }

  async delete(id: string): Promise<void> {
    // Check if category has associated expenses
    const expenseCount = await this.prisma.expense.count({
      where: { categoryId: id },
    });

    if (expenseCount > 0) {
      throw new Error(`Cannot delete category: ${expenseCount} expense(s) are associated with this category`);
    }

    await this.prisma.category.delete({
      where: { id },
    });
  }
}
