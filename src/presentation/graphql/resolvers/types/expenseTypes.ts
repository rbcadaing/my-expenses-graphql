import { prisma } from '../../../../infrastructure/database/client';
import { CategoryRepository } from '../../../../infrastructure/repositories/CategoryRepository';

const categoryRepository = new CategoryRepository(prisma);

export const expenseTypes = {
  Expense: {
    category: async (parent: any) => {
      return await categoryRepository.findById(parent.categoryId);
    },
  },
};
