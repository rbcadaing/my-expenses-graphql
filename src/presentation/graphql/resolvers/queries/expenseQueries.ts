import { prisma } from '../../../../infrastructure/database/client';
import { ExpenseRepository } from '../../../../infrastructure/repositories/ExpenseRepository';

const expenseRepository = new ExpenseRepository(prisma);

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
  
  expensesMonthlyReport: async (_parent: any, { month, year, salary, additionalIncome }: { month: number; year: number; salary: number; additionalIncome: number }) => {
    const expenses = await expenseRepository.findByMonthAndYear(month, year);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalIncome = salary + additionalIncome;
    const netIncome = totalIncome - totalExpenses;
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    const monthName = monthNames[month - 1];
    
    return {
      moth: monthName,
      year,
      salary,
      additionalIncome,
      totalExpenses,
      netIncome,
      expenses
    };
  },
};
