import { prisma } from '../../../../infrastructure/database/client';
import { ExpenseRepository } from '../../../../infrastructure/repositories/ExpenseRepository';
import { Expense } from '../../../../domain/entities/Expense';

const expenseRepository = new ExpenseRepository(prisma);

export const expenseMutations = {
  createExpense: async (_parent: any, { input }: { input: any }) => {
    const expense = Expense.create(
      input.description,
      input.amount,
      new Date(input.date),
      input.categoryId
    );
    return await expenseRepository.create(expense);
  },
  updateExpense: async (_parent: any, { id, input }: { id: string; input: any }) => {
    const existing = await expenseRepository.findById(id);
    if (!existing) {
      throw new Error('Expense not found');
    }
    existing.update(
      input.description,
      input.amount,
      new Date(input.date),
      input.categoryId
    );
    return await expenseRepository.update(existing);
  },
  deleteExpense: async (_parent: any, { id }: { id: string }) => {
    await expenseRepository.delete(id);
    return true;
  },
};
