import { readFileSync } from 'fs';
import { join } from 'path';

// Load schema files
const expenseSchema = readFileSync(
  join(__dirname, 'expense.graphql'),
  'utf-8'
);

const categorySchema = readFileSync(
  join(__dirname, 'category.graphql'),
  'utf-8'
);

export const typeDefs = `
  ${expenseSchema}
  ${categorySchema}
`;
