import { PrismaClient } from '@prisma/client';
import { IExpenseRepository } from '../../domain/interfaces/IExpenseRepository';
import { Expense } from '../../domain/entities/Expense';

export class ExpenseRepository implements IExpenseRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(): Promise<Expense[]> {
    const expenses = await this.prisma.expense.findMany({
      orderBy: { date: 'desc' },
    });
    return expenses.map(e => Expense.fromDatabase(
      e.id,
      e.description,
      e.amount.toNumber(),
      e.date,
      e.categoryId,
      e.createdAt,
      e.updatedAt ?? undefined
    ));
  }

  async findById(id: string): Promise<Expense | null> {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
    });
    return expense ? Expense.fromDatabase(
      expense.id,
      expense.description,
      expense.amount.toNumber(),
      expense.date,
      expense.categoryId,
      expense.createdAt,
      expense.updatedAt ?? undefined
    ) : null;
  }

  async findByCategory(categoryId: string): Promise<Expense[]> {
    const expenses = await this.prisma.expense.findMany({
      where: { categoryId },
      orderBy: { date: 'desc' },
    });
    return expenses.map(e => Expense.fromDatabase(
      e.id,
      e.description,
      e.amount.toNumber(),
      e.date,
      e.categoryId,
      e.createdAt,
      e.updatedAt ?? undefined
    ));
  }

  async findByMonthAndYear(month: number, year: number): Promise<Expense[]> {
    // Create date range for the specified month and year
    const startDate = new Date(year, month - 1, 1); // month is 1-indexed, Date constructor expects 0-indexed
    const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Last day of the month

    const expenses = await this.prisma.expense.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'desc' },
    });
    return expenses.map(e => Expense.fromDatabase(
      e.id,
      e.description,
      e.amount.toNumber(),
      e.date,
      e.categoryId,
      e.createdAt,
      e.updatedAt ?? undefined
    ));
  }

  async create(expense: Expense): Promise<Expense> {
    // Verify that the category exists before creating the expense
    const categoryExists = await this.prisma.category.findUnique({
      where: { id: expense.categoryId },
    });

    if (!categoryExists) {
      throw new Error(`Category with id ${expense.categoryId} does not exist`);
    }

    const created = await this.prisma.expense.create({
      data: {
        id: expense.id,
        description: expense.description,
        amount: expense.amount,
        date: expense.date,
        categoryId: expense.categoryId,
        createdAt: expense.createdAt,
      },
    });
    return Expense.fromDatabase(
      created.id,
      created.description,
      created.amount.toNumber(),
      created.date,
      created.categoryId,
      created.createdAt,
      created.updatedAt ?? undefined
    );
  }

  async update(expense: Expense): Promise<Expense> {
    // Verify that the category exists before updating the expense
    const categoryExists = await this.prisma.category.findUnique({
      where: { id: expense.categoryId },
    });

    if (!categoryExists) {
      throw new Error(`Category with id ${expense.categoryId} does not exist`);
    }

    const updated = await this.prisma.expense.update({
      where: { id: expense.id },
      data: {
        description: expense.description,
        amount: expense.amount,
        date: expense.date,
        categoryId: expense.categoryId,
        updatedAt: expense.updatedAt,
      },
    });
    return Expense.fromDatabase(
      updated.id,
      updated.description,
      updated.amount.toNumber(),
      updated.date,
      updated.categoryId,
      updated.createdAt,
      updated.updatedAt ?? undefined
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.expense.delete({
      where: { id },
    });
  }


}
