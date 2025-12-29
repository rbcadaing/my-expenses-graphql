export interface ExpenseDto {
  id: string;
  description: string;
  amount: number;
  date: Date;
  categoryId: string;
  category?: CategoryDto;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CategoryDto {
  id: string;
  name: string;
  description: string | null;
  color: string;
}

export interface CreateExpenseInput {
  description: string;
  amount: number;
  date: Date;
  categoryId: string;
}

export interface UpdateExpenseInput {
  description: string;
  amount: number;
  date: Date;
  categoryId: string;
}
