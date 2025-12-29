import { prisma } from '../../../../infrastructure/database/client';
import { CategoryRepository } from '../../../../infrastructure/repositories/CategoryRepository';

const categoryRepository = new CategoryRepository(prisma);

export const categoryMutations = {
  createCategory: async (_parent: any, { input }: { input: any }) => {
    return await categoryRepository.create(input);
  },
};
