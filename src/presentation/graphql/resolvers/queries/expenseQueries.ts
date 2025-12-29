import { prisma } from '../../../../infrastructure/database/client';
import { ExpenseRepository } from '../../../../infrastructure/repositories/ExpenseRepository';

const expenseRepository = new ExpenseRepository(prisma);

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December'];

interface AdditionalIncome {
  description: string;
  amount: number;
}

interface MonthlyReportArgs {
  month: number;
  year: number;
  salary: number;
  additionalIncome: AdditionalIncome[];
}

export const expenseQueries = {
  expenses: async () => {
    return await expenseRepository.findAll();
  },
  expense: async (_parent: any, { id }: { id: string }) => {
    return await expenseRepository.findById(id);
  },
  expensesByCategory: async (_parent: any, { categoryId }: { categoryId: string }) => {
    return await expenseRepository.findByCategory(categoryId);
  },
  expensesByMonthAndYear: async (_parent: any, { month, year }: { month: number; year: number }) => {
    return await expenseRepository.findByMonthAndYear(month, year);
  },

  expensesMonthlyReport: async (_parent: unknown, { month, year, salary, additionalIncome }: MonthlyReportArgs) => {
    // Validate month range
    if (month < 1 || month > 12) {
      throw new Error('Month must be between 1 and 12');
    }

    const expenses = await expenseRepository.findByMonthAndYear(month, year);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalAdditionalIncome = additionalIncome.reduce((sum, income) => sum + income.amount, 0);
    const netIncome = (salary + totalAdditionalIncome) - totalExpenses;
    
    return {
      month: MONTH_NAMES[month - 1], // Arrays are 0-indexed
      year,
      salary,
      additionalIncome,
      totalExpenses,
      netIncome,
      expenses
    };
  },
};
