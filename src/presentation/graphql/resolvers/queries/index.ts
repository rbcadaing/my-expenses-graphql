import { expenseQueries } from './expenseQueries';
import { categoryQueries } from './categoryQueries';

export const queries = {
  ...expenseQueries,
  ...categoryQueries,
};
