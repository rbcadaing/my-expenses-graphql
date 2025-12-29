import { randomUUID } from 'crypto';

export class Expense {
  private constructor(
    public readonly id: string,
    public description: string,
    public amount: number,
    public date: Date,
    public categoryId: string,
    public readonly createdAt: Date,
    public updatedAt?: Date
  ) {}

  static create(
    description: string,
    amount: number,
    date: Date,
    categoryId: string
  ): Expense {
    if (!description || description.trim().length === 0) {
      throw new Error('Description cannot be empty');
    }

    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    return new Expense(
      randomUUID(),
      description,
      amount,
      date,
      categoryId,
      new Date()
    );
  }

  static fromDatabase(
    id: string,
    description: string,
    amount: number,
    date: Date,
    categoryId: string,
    createdAt: Date,
    updatedAt?: Date
  ): Expense {
    return new Expense(
      id,
      description,
      amount,
      date,
      categoryId,
      createdAt,
      updatedAt
    );
  }

  update(
    description: string,
    amount: number,
    date: Date,
    categoryId: string
  ): void {
    this.description = description;
    this.amount = amount;
    this.date = date;
    this.categoryId = categoryId;
    this.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      description: this.description,
      amount: this.amount,
      date: this.date,
      categoryId: this.categoryId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
