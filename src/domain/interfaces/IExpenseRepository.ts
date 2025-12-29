import { Expense } from '../entities/Expense';

export interface IExpenseRepository {
  findById(id: string): Promise<Expense | null>;
  findAll(): Promise<Expense[]>;
  findByCategory(categoryId: string): Promise<Expense[]>;
  findByMonthAndYear(month: number, year: number): Promise<Expense[]>;
  create(expense: Expense): Promise<Expense>;
  update(expense: Expense): Promise<Expense>;
  delete(id: string): Promise<void>;
}
