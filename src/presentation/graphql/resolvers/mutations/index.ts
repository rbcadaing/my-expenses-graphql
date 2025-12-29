import { expenseMutations } from './expenseMutations';
import { categoryMutations } from './categoryMutations';

export const mutations = {
  ...expenseMutations,
  ...categoryMutations,
};
