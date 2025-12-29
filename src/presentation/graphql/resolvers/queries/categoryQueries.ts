import { prisma } from '../../../../infrastructure/database/client';
import { CategoryRepository } from '../../../../infrastructure/repositories/CategoryRepository';

const categoryRepository = new CategoryRepository(prisma);

export const categoryQueries = {
  categories: async () => {
    return await categoryRepository.findAll();
  },
  category: async (_parent: any, { id }: { id: string }) => {
    return await categoryRepository.findById(id);
  },
};
