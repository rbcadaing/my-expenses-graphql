# Node.js GraphQL Implementation Guide

## Overview
This guide provides a detailed, production-ready architecture for implementing GraphQL in a Node.js application using Apollo Server and TypeScript, following clean architecture principles and best practices.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Dependencies](#dependencies)
4. [Implementation Steps](#implementation-steps)
5. [Best Practices](#best-practices)
6. [Testing Strategy](#testing-strategy)

---

## Architecture Overview

### Layered Architecture
```
┌─────────────────────────────────────┐
│     Presentation Layer (API)        │
│  - GraphQL Schema & Type Definitions│
│  - Query/Mutation Resolvers         │
│  - DataLoaders                      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Application Layer              │
│  - Services/Use Cases               │
│  - DTOs & Validation                │
│  - Business Logic                   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│       Domain Layer                  │
│  - Entities/Models                  │
│  - Value Objects                    │
│  - Domain Events                    │
│  - Interfaces                       │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Infrastructure Layer              │
│  - Database (Prisma/TypeORM)        │
│  - Repositories                     │
│  - External Services                │
└─────────────────────────────────────┘
```

---

## Project Structure

```
my-expenses/
│
├── src/
│   ├── domain/                            # Domain Layer
│   │   ├── entities/
│   │   │   ├── Expense.ts
│   │   │   └── Category.ts
│   │   ├── value-objects/
│   │   │   └── Money.ts
│   │   ├── interfaces/
│   │   │   ├── IExpenseRepository.ts
│   │   │   └── ICategoryRepository.ts
│   │   └── events/
│   │       └── ExpenseCreatedEvent.ts
│   │
│   ├── application/                       # Application Layer
│   │   ├── services/
│   │   │   ├── ExpenseService.ts
│   │   │   └── CategoryService.ts
│   │   ├── dtos/
│   │   │   ├── ExpenseDto.ts
│   │   │   └── CategoryDto.ts
│   │   └── validators/
│   │       ├── ExpenseValidator.ts
│   │       └── CategoryValidator.ts
│   │
│   ├── infrastructure/                    # Infrastructure Layer
│   │   ├── database/
│   │   │   ├── prisma/
│   │   │   │   ├── schema.prisma
│   │   │   │   └── migrations/
│   │   │   └── client.ts
│   │   └── repositories/
│   │       ├── ExpenseRepository.ts
│   │       └── CategoryRepository.ts
│   │
│   ├── presentation/                      # Presentation Layer (GraphQL)
│   │   ├── graphql/
│   │   │   ├── schema/
│   │   │   │   ├── typeDefs.ts
│   │   │   │   ├── expense.graphql
│   │   │   │   └── category.graphql
│   │   │   ├── resolvers/
│   │   │   │   ├── queries/
│   │   │   │   │   ├── expenseQueries.ts
│   │   │   │   │   └── categoryQueries.ts
│   │   │   │   ├── mutations/
│   │   │   │   │   ├── expenseMutations.ts
│   │   │   │   │   └── categoryMutations.ts
│   │   │   │   ├── subscriptions/
│   │   │   │   │   └── expenseSubscriptions.ts
│   │   │   │   └── index.ts
│   │   │   ├── dataloaders/
│   │   │   │   ├── categoryLoader.ts
│   │   │   │   └── expenseLoader.ts
│   │   │   └── context.ts
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts
│   │   │   ├── authentication.ts
│   │   │   └── authorization.ts
│   │   └── server.ts
│   │
│   ├── config/
│   │   ├── database.ts
│   │   └── environment.ts
│   │
│   └── index.ts                           # Entry point
│
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   └── resolvers/
│   ├── integration/
│   │   └── graphql/
│   └── setup.ts

**package.json**
```json
{
  "name": "my-expenses",
  "version": "1.0.0",
  "description": "GraphQL expense tracking API",
  "main": "dist/index.js",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  },
  "dependencies": {
    "@apollo/server": "^4.10.0",
    "@prisma/client": "^5.7.0",
    "graphql": "^16.8.1",
    "graphqlProject Setup

#### 1.1 Initialize Project

```bash
# Create project directory
mkdir my-expenses && cd my-expenses

# Initialize Node.js project
npm init -y

# Install dependencies
npm install @apollo/server graphql graphql-subscriptions graphql-ws ws @prisma/client dataloader dotenv zod date-fns cors express

# Install dev dependencies
npm install -D typescript @types/node ts-node ts-node-dev prisma @types/express @types/cors @types/ws jest ts-jest @types/jest

# Initialize TypeScript
npx tsc --init

# Initialize Prisma
npx prisma init
```

#### 1.2 TypeScript Configuration

**tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

---

### Step 2: Domain Layer

#### 2.1 Create Domain Entities

**src/domain/entities/Expense.ts**
```typescript
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

  update(
    description: string,
    amoun3: Infrastructure Layer

#### 3.1 Prisma Schema

**prisma/schema.prisma**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Expense {
  id          String    @id @default(uuid())
  description String
  amount      Decimal   @db.Decimal(18, 2)
  date        DateTime
  categoryId  String    @map("category_id")
  category    Category  @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime? @updatedAt @map("updated_at")

  @@index([date])
  @@index([categoryId])
  @@map("expenses")
}

model Category {
  id          String    @id @default(uuid())
  name        String    @unique
  description String?
  color       String    @default("#000000")
  expenses    Expense[]

  @@map("categories")
}
```

#### 3.2 Database Client

**src/infrastructure/database/client.ts**
```typescript
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

declare global {
  var __prisma: PrismaClient | undefined;
}

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  prisma = global.__prisma;
}

export { prisma };
```

#### 3.3 Repository Implementation

**src/infrastructure/repositories/ExpenseRepository.ts**
```typescript
import { prisma } from '../database/client';
import { Expense } from '../../domain/entities/Expense';
import { IExpenseRepository } from '../../domain/interfaces/IExpenseRepository';

export class ExpenseRepository implements IExpenseRepository {
  async findById(id: string): Promise<Expense | null> {
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: { category: true }
    });

    if (!expense) return null;

    return new Expense(
      expense.id,
      expense.description,
      expense.amount.toNumber(),
      expense.date,
      expense.categoryId,
      expense.createdAt,
      expense.updatedAt || undefined
    );
  }

  async findAll(): Promise<Expense[]> {
    const expenses = await prisma.expense.findMany({
      include: { category: true },
      orderBy: { date: 'desc' }
    });

    return expenses.map(
      expense => new Expense(
        expense.id,
        expense.description,
        expense.amount.toNumber(),
        expense.date,
        expense.categoryId,
        expense.createdAt,
        expense.updatedAt || undefined
      )
    );
  }

  async findByCategory(categoryId: string): Promise<Expense[]> {
    const expenses = await prisma.expense.findMany({
      where: { categoryId },
      include: { category: true },
      orderBy: { date: 'desc' }
    });

    return expenses.map(
      expense => new Expense(
        expense.id,
        expense.description,
        expense.amount.toNumber(),
        expense.date,
        expense.categoryId,
        expense.createdAt,
        expense.updatedAt || undefined
      )
    );
  }

  async create(expense: Expense): Promise<Expense> {
    const created = await prisma.expense.create({
      data: {
        id: expense.id,
        d4: Application Layer

#### 4.1 DTOs and Validators

**src/application/dtos/ExpenseDto.ts**
```typescript
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
```

**src/application/validators/ExpenseValidator.ts**
```typescript
import { z } from 'zod';

export const CreateExpenseSchema = z.object({
  description: z.string().min(1, 'Description is required').max(500),
  amount: z.number().positive('Amount must be positive'),
  date: z.date(),
  categoryId: z.string().uuid('Invalid category ID')
});

export const UpdateExpenseSchema = z.object({
  description: z.string().min(1, 'Description is required').max(500),
  amount: z.number().positive('Amount must be positive'),
  date: z.date(),
  categoryId: z.string().uuid('Invalid category ID')
});

export type CreateExpenseInput = z.infer<typeof CreateExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof UpdateExpenseSchema>;
```

#### 4.2 Service Implementation

**src/application/services/ExpenseService.ts**
```typescript
import { Expense } from '../../domain/entities/Expense';
import { IExpenseRepository } from '../../domain/interfaces/IExpenseRepository';
import { ICategoryRepository } from '../../domain/interfaces/ICategoryRepository';
import { ExpenseDto, CreateExpenseInput, UpdateExpenseInput } from '../dtos/ExpenseDto';
import { CreateExpenseSchema, UpdateExpenseSchema } from '../validators/ExpenseValidator';

export class ExpenseService {
  constructor(
    private expenseRepository: IExpenseRepository,
    private categoryRepository: ICategoryRepository
  ) {}

  async getById(id: string): Promise<ExpenseDto | null> {
    const expense = await this.expenseRepository.findById(id);
    if (!expense) return null;

    const category = await this.categoryRepository.findById(expense.categoryId);

    return {
      ...expense.toJSON(),
      category: category?.toJSON()
    };
  }

  async getAll(): Promise<ExpenseDto[]> {
    const expenses = await this.expenseRepository.findAll();
    
    const expensesWithCategories = await Promise.all(
      expenses.map(async (expense) => {
        const category = await this.categoryRepository.findById(expense.categoryId);
        return {
          ...expense.toJSON(),
          category: category?.toJSON()
        };
      })
    );

    return expensesWithCategories;
  }

  async create(input: CreateExpenseInput): Promise<ExpenseDto> {
    // Validate input
    const validated = CreateExpenseSchema.parse(input);

    // Check if category exists
    const category = await this.categoryRepository.findById(validated.categoryId);
    if (!category) {
      throw new Error(`Category with ID ${validated.categoryId} not found`);
    }

    // Create expense
    const expense = Expense.create(
      validated.description,
      validated.amount,
      validated.date,
      validated.categoryId
    );

    const created = await this.expenseRepository.create(expense);

    return {
      ...created.toJSON(),
      category: category.toJSON()
    };
  }

  async update(id: string, input: UpdateExpenseInput): Promise<ExpenseDto> {
    // Validate input
    const validated = UpdateExpenseSchema.parse(input);

    // Get existing expense
    const expense = await this.expenseRepository.findById(id);
    if (!expense) {
      throw new Error(`Expense with ID ${id} not found`);
    }

    // Check if category exists
    const category = await this.categoryRepository.findById(validated.categoryId);
    if (!category) {
      throw new Error(`Category with ID ${validated.categoryId} not found`);
    }

    // Update expense
    expense.update(
      validated.description,
      validated.amount,
      validated.date,
      validated.categoryId
    );

    const updated = await this.expenseRepository.update(expense);

    return {
      ...updated.toJSON(),
      category: category.toJSON()
    };
  }

  async delete(id: string): Promise<void> {
    const expense = await this.expenseRepository.findById(id);
    if (!expense) {
      throw new Error(`Expense with ID ${id} not found`);
    }

    await this.expenseRepository.delete(id);
  }
}
```

**src/application/services/CategoryService.ts**
```typescript
import { Category } from '../../domain/entities/Category';
import { ICategoryRepository } from '../../domain/interfaces/ICategoryRepository';
import { CategoryDto } from '../dtos/ExpenseDto';

export class CategoryService {
  constructor(private categoryRepository: ICategoryRepository) {}

  async getById(id: string): Promise<CategoryDto | null> {
    const category = await this.categoryRepository.findById(id);
    return category ? category.toJSON() : null;
  }

  async getAll(): Promise<CategoryDto[]> {
    const categories = await this.categoryRepository.findAll();
    return categories.map(cat => cat.toJSON());
  }

  async create(
    name: string,
    description: string | null,
    color: string
  ): Promise<CategoryDto> {
    const category = Category.create(name, description, color);
    const created = await this.categoryRepository.create(category);
    return created.toJSON();
  }
}  });

    return new Category(
      updated.id,
      updated.name,
      updated.description,
      updated.color
    );
  }

  async delete(id: string): Promise<void> {
    await prisma.category.delete({
      where: { id }
    });
`csharp
namespace MyExpenses.Domain.Interfaces;

public interface IExpenseRepository
{
    Task<Expense?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Expense>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Expense>> GetByCategoryAsync(Guid categoryId, CancellationToken cancellationToken = default);
    Task<Expense> AddAsync(Expense expense, CancellationToken cancellationToken = default);
    Task UpdateAsync(Expense expense, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
```

---

### Step 2: Infrastructure Layer

#### 2.1 Database Context

**MyExpenses.Infrastructure/Data/ApplicationDbContext.cs**
```csharp
using Microsoft.EntityFrameworkCore;
using MyExpenses.Domain.Entities;

namespace MyExpenses.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<Category> Categories => Set<Category>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}
```

#### 2.2 Entity Configurations

**MyExpenses.Infrastructure/Data/Configurations/ExpenseConfiguration.cs**
```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyExpenses.Domain.Entities;

namespace MyExpenses.Infrastructure.Data.Configurations;

public class ExpenseConfiguration : IEntityTypeConfiguration<Expense>
{
    public void Configure(EntityTypeBuilder<Expense> builder)
    {
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Description)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(e => e.Amount)
            .HasPrecision(18, 2);

        builder.Property(e => e.Date)
            .IsRequired();

        builder.HasOne(e => e.Category)
            .WithMany(c => c.Expenses)
            .HasForeignKey(e => e.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(e => e.Date);
        builder.HasIndex(e => e.CategoryId);
    }
}
```

#### 2.3 Repository Implementation

**MyExpenses.Infrastructure/Repositories/ExpenseRepository.cs**
```csharp
using Microsoft.EntityFrameworkCore;
using MyExpenses.Domain.Entities;
using MyExpenses.Domain.Interfaces;
using MyExpenses.Infrastructure.Data;

namespace MyExpenses.Infrastructure.Repositories;

public class ExpenseRepository : IExpenseRepository
{
    private readonly ApplicationDbContext _context;

    public ExpenseRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Expense?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Expenses
            .Include(e => e.Category)
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Expense>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Expenses
            .Include(e => e.Category)
            .OrderByDescending(e => e.Date)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Expense>> GetByCategoryAsync(Guid categoryId, CancellationToken cancellationToken = default)
    {
        return await _context.Expenses
            .Where(e => e.CategoryId == categoryId)
            .Include(e => e.Category)
            .OrderByDescending(e => e.Date)
            .ToListAsync(cancellationToken);
    }

    public async Task<Expense> AddAsync(Expense expense, CancellationToken cancellationToken = default)
    {
        _context.Expenses.Add(expense);
        await _context.SaveChangesAsync(cancellationToken);
        return expense;
    }

    public async Task UpdateAsync(Expense expense, CancellationToken cancellationToken = default)
    {
        _context.Expenses.Update(expense);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var expense = await GetByIdAsync(id, cancellationToken);
        if (expense != null)
        {
            _context.Expenses.Remove(expense);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
```

---

### Step 3: Application Layer

#### 3.1 Service Interface and Implementation

**MyExpenses.Application/Services/IExpenseService.cs**
```csharp
namespace MyExpenses.Application.Services;

public interface IExpenseService
{
    Task<ExpenseDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<ExpenseDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<ExpenseDto> CreateAsync(CreateExpenseDto dto, CancellationToken cancellationToken = default);
    Task<ExpenseDto> UpdateAsync(Guid id, UpdateExpenseDto dto, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
```

**MyExpenses.Application/Services/ExpenseService.cs**
```csharp
using AutoMapper;
using MyExpenses.Domain.Entities;
using MyExpenses.Domain.Interfaces;

namespace MyExpenses.Application.Services;

public class ExpenseService : IExpenseService
{
    private readonly IExpenseRepository _repository;
    private readonly IMapper _mapper;

    public ExpenseService(IExpenseRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<ExpenseDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var expense = await _repository.GetByIdAsync(id, cancellationToken);
        return expense != null ? _mapper.Map<ExpenseDto>(expense) : null;
    }

    public async Task<IEnumerable<ExpenseDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var expenses = await _repository.GetAllAsync(cancellationToken);
        return _mapper.Map<IEnumerable<ExpenseDto>>(expenses);
    }

    public async Task<ExpenseDto> CreateAsync(CreateExpenseDto dto, CancellationToken cancellationToken = default)
    {
        var expense = Expense.Create(dto.Description, dto.Amount, dto.Date, dto.CategoryId);
        await _repository.AddAsync(expense, cancellationToken);
        return _mapper.Map<ExpenseDto>(expense);
    }

    public async Task<ExpenseDto> UpdateAsync(Guid id, UpdateExpenseDto dto, CancellationToken cancellationToken = default)
    {
        var expense = await _repository.GetByIdAsync(id, cancellationToken);
        if (expense == null)
            throw new InvalidOperationException($"Expense with ID {id} not found");

        expense.Update(dto.Description, dto.Amount, dto.Date, dto.CategoryId);
        await _repository.UpdateAsync(expense, cancellationToken);
        return _mapper.Map<ExpenseDto>(expense);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await _repository.DeleteAsync(id, cancellationToken);
    }
}
```

#### 3.2 DTOs

**MyExpenses.Application/DTOs/ExpenseDto.cs**
```csharp
namespace MyExpenses.Application.DTOs;

public record ExpenseDto(
    Guid Id,
    string Description,
    decimal Amount,
    DateTime Date,
    Guid CategoryId,
    CategoryDto Category,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record CategoryDto(
    Guid Id,
    string Name,
    string? Description,
    string Color
);

public record CreateExpenseDto(
    string Description,
    decimal Amount,
    DateTime Date,
    Guid CategoryId
);

public record UpdateExpenseDto(
    string Description,
    decimal Amount,
    DateTime Date,
    Guid CategoryId
);
```

---

### Step 5: GraphQL API Layer

#### 5.1 GraphQL Type Definitions

**src/presentation/graphql/schema/typeDefs.ts**
```typescript
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
```

**src/presentation/graphql/schema/expense.graphql**
```graphql
type Expense {
  "The unique identifier of the expense"
  id: ID!
  "The description of the expense"
  description: String!
  "The amount of the expense"
  amount: Float!
  "The date of the expense"
  date: DateTime!
  "The category ID this expense belongs to"
  categoryId: ID!
  "The category this expense belongs to"
  category: Category!
  "When the expense was created"
  createdAt: DateTime!
  "When the expense was last updated"
  updatedAt: DateTime
}

input CreateExpenseInput {
  description: String!
  amount: Float!
  date: DateTime!
  categoryId: ID!
}

input UpdateExpenseInput {
  description: String!
  amount: Float!
  date: DateTime!
  categoryId: ID!
}

type Query {
  "Get all expenses"
  expenses: [Expense!]!
  "Get an expense by ID"
  expense(id: ID!): Expense
  "Get expenses by category"
  expensesByCategory(categoryId: ID!): [Expense!]!
}

type Mutation {
  "Create a new expense"
  createExpense(input: CreateExpenseInput!): Expense!
  "Update an existing expense"
  updateExpense(id: ID!, input: UpdateExpenseInput!): Expense!
  "Delete an expense"
  deleteExpense(id: ID!): Boolean!
}

type Subscription {
  "Subscribe to expense creation events"
  expenseCreated: Expense!
  "Subscribe to expense updates"
  expenseUpdated: Expense!
}

scalar DateTime
```

**src/presentation/graphql/schema/category.graphql**
```graphql
type Category {
  id: ID!
  name: String!
  description: String
  color: String!
}

input CreateCategoryInput {
  name: String!
  description: String
  color: String!
}

extend type Query {
  "Get all categories"
  categories: [Category!]!
  "Get a category by ID"
  category(id: ID!): Category
}

extend type Mutation {
  "Create a new category"
  createCategory(input: CreateCategoryInput!): Category!
}
```

#### 5.2 DataLoaders (N+1 Prevention)

**src/presentation/graphql/dataloaders/categoryLoader.ts**
```typescript
import DataLoader from 'dataloader';
import { CategoryDto } from '../../../application/dtos/ExpenseDto';
import { CategoryService } from '../../../application/services/CategoryService';

export const createCategoryLoader = (categoryService: CategoryService) => {
  return new DataLoader<string, CategoryDto | null>(async (ids) => {
    const categories = await categoryService.getAll();
    const categoryMap = new Map(
      categories.map(cat => [cat.id, cat])
    );

    return ids.map(id => categoryMap.get(id) || null);
  });
};
```

**src/presentation/graphql/dataloaders/expenseLoader.ts**
```typescript
import DataLoader from 'dataloader';
import { ExpenseDto } from '../../../application/dtos/ExpenseDto';
import { ExpenseService } from '../../../application/services/ExpenseService';

export const createExpenseLoader = (expenseService: ExpenseService) => {
  return new DataLoader<string, ExpenseDto | null>(async (ids) => {
    const allExpenses = await expenseService.getAll();
    const expenseMap = new Map(
      allExpenses.map(exp => [exp.id, exp])
    );

    return ids.map(id => expenseMap.get(id) || null);
  });
};

export const createExpensesByCategoryLoader = (expenseService: ExpenseService) => {
  return new DataLoader<string, ExpenseDto[]>(async (categoryIds) => {
    const allExpenses = await expenseService.getAll();
    const expensesByCategory = new Map<string, ExpenseDto[]>();

    // Group expenses by category
    allExpenses.forEach(expense => {
      const categoryExpenses = expensesByCategory.get(expense.categoryId) || [];
      categoryExpenses.push(expense);
      expensesByCategory.set(expense.categoryId, categoryExpenses);
    });

    return categoryIds.map(id => expensesByCategory.get(id) || []);
  });
};
```

#### 5.3 GraphQL Context

**src/presentation/graphql/context.ts**
```typescript
import { ExpenseService } from '../../application/services/ExpenseService';
import { CategoryService } from '../../application/services/CategoryService';
import { createCategoryLoader } from './dataloaders/categoryLoader';
import { createExpenseLoader, createExpensesByCategoryLoader } from './dataloaders/expenseLoader';
import { PubSub } from 'graphql-subscriptions';

export interface GraphQLContext {
  services: {
    expenseService: ExpenseService;
    categoryService: CategoryService;
  };
  dataloaders: {
    categoryLoader: ReturnType<typeof createCategoryLoader>;
    expenseLoader: ReturnType<typeof createExpenseLoader>;
    expensesByCategoryLoader: ReturnType<typeof createExpensesByCategoryLoader>;
  };
  pubsub: PubSub;
  user?: any; // Add authentication user if needed
}

export const createContext = (
  expenseService: ExpenseService,
  categoryService: CategoryService,
  pubsub: PubSub
): GraphQLContext => {
  return {
    services: {
      expenseService,
      categoryService
    },
    dataloaders: {
      categoryLoader: createCategoryLoader(categoryService),
      expenseLoader: createExpenseLoader(expenseService),
      expensesByCategoryLoader: createExpensesByCategoryLoader(expenseService)
    },
    pubsub
  };
};
```

#### 5.4 Queries

**src/presentation/graphql/resolvers/queries/expenseQueries.ts**
```typescript
import { GraphQLContext } from '../../context';
import { GraphQLError } from 'graphql';

export const expenseQueries = {
  expenses: async (_: any, __: any, context: GraphQLContext) => {
    try {
      return await context.services.expenseService.getAll();
    } catch (error) {
      throw new GraphQLError('Failed to fetch expenses', {
        extensions: {
          code: 'INTERNAL_SERVER_ERROR',
          originalError: error
        }
      });
    }
  },

  expense: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
    try {
      const expense = await context.dataloaders.expenseLoader.load(id);
      if (!expense) {
        throw new GraphQLError(`Expense with ID ${id} not found`, {
          extensions: { code: 'NOT_FOUND' }
        });
      }
      return expense;
    } catch (error) {
      if (error instanceof GraphQLError) throw error;
      throw new GraphQLError('Failed to fetch expense', {
        extensions: {
          code: 'INTERNAL_SERVER_ERROR',
          originalError: error
        }
      });
    }
  },

  expensesByCategory: async (
    _: any,
    { categoryId }: { categoryId: string },
    context: GraphQLContext
  ) => {
    try {
      return await context.dataloaders.expensesByCategoryLoader.load(categoryId);
    } catch (error) {
      throw new GraphQLError('Failed to fetch expenses by category', {
        extensions: {
          code: 'INTERNAL_SERVER_ERROR',
          originalError: error
        }
      });
    }
  }
};
```

**src/presentation/graphql/resolvers/queries/categoryQueries.ts**
```typescript
import { GraphQLContext } from '../../context';
import { GraphQLError } from 'graphql';

export const categoryQueries = {
  categories: async (_: any, __: any, context: GraphQLContext) => {
    try {
      return await context.services.categoryService.getAll();
    } catch (error) {
      throw new GraphQLError('Failed to fetch categories', {
        extensions: {
          code: 'INTERNAL_SERVER_ERROR',
          originalError: error
        }
      });
    }
  },

  category: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
    try {
      const category = await context.dataloaders.categoryLoader.load(id);
      if (!category) {
        throw new GraphQLError(`Category with ID ${id} not found`, {
          extensions: { code: 'NOT_FOUND' }
        });
      }
      return category;
    } catch (error) {
      if (error instanceof GraphQLError) throw error;
      throw new GraphQLError('Failed to fetch category', {
        extensions: {
          code: 'INTERNAL_SERVER_ERROR',
          originalError: error
        }
      });
    }
  }
};
```

#### 5.5 Mutations

**src/presentation/graphql/resolvers/mutations/expenseMutations.ts**
```typescript
import { GraphQLContext } from '../../context';
import { GraphQLError } from 'graphql';
import { CreateExpenseInput, UpdateExpenseInput } from '../../../../application/dtos/ExpenseDto';

export const expenseMutations = {
  createExpense: async (
    _: any,
    { input }: { input: CreateExpenseInput },
    context: GraphQLContext
  ) => {
    try {
      const expense = await context.services.expenseService.create(input);
      
      // Publish subscription event
      await context.pubsub.publish('EXPENSE_CREATED', {
        expenseCreated: expense
      });

      return expense;
    } catch (error) {
      throw new GraphQLError(
        error instanceof Error ? error.message : 'Failed to create expense',
        {
          extensions: {
            code: 'BAD_USER_INPUT',
            originalError: error
          }
        }
      );
    }
  },

  updateExpense: async (
    _: any,
    { id, input }: { id: string; input: UpdateExpenseInput },
    context: GraphQLContext
  ) => {
    try {
      const expense = await context.services.expenseService.update(id, input);
      
      // Publish subscription event
      await context.pubsub.publish('EXPENSE_UPDATED', {
        expenseUpdated: expense
      });

      return expense;
    } catch (error) {
      throw new GraphQLError(
        error instanceof Error ? error.message : 'Failed to update expense',
        {
          extensions: {
            code: error instanceof Error && error.message.includes('not found')
              ? 'NOT_FOUND'
              : 'BAD_USER_INPUT',
            originalError: error
          }
        }
      );
    }
  },

  deleteExpense: async (
    _: any,
    { id }: { id: string },
    context: GraphQLContext
  ) => {
    try {
      await context.services.expenseService.delete(id);
      return true;
    } catch (error) {
      throw new GraphQLError(
        error instanceof Error ? error.message : 'Failed to delete expense',
        {
          extensions: {
            code: error instanceof Error && error.message.includes('not found')
              ? 'NOT_FOUND'
              : 'INTERNAL_SERVER_ERROR',
            originalError: error
          }
        }
      );
    }
  }
};
```

**src/presentation/graphql/resolvers/mutations/categoryMutations.ts**
```typescript
import { GraphQLContext } from '../../context';
import { GraphQLError } from 'graphql';

interface CreateCategoryInput {
  name: string;
  description: string | null;
  color: string;
}

export const categoryMutations = {
  createCategory: async (
    _: any,
    { input }: { input: CreateCategoryInput },
    context: GraphQLContext
  ) => {
    try {
      return await context.services.categoryService.create(
        input.name,
        input.description,
        input.color
      );
    } catch (error) {
      throw new GraphQLError(
        error instanceof Error ? error.message : 'Failed to create category',
        {
          extensions: {
            code: 'BAD_USER_INPUT',
            originalError: error
          }
        }
      );
    }
  }
};
```

#### 5.6 Subscriptions (Real-time Updates)

**src/presentation/graphql/resolvers/subscriptions/expenseSubscriptions.ts**
```typescript
import { GraphQLContext } from '../../context';

export const expenseSubscriptions = {
  expenseCreated: {
    subscribe: (_: any, __: any, context: GraphQLContext) => {
      return context.pubsub.asyncIterator(['EXPENSE_CREATED']);
    }
  },

  expenseUpdated: {
    subscribe: (_: any, __: any, context: GraphQLContext) => {
      return context.pubsub.asyncIterator(['EXPENSE_UPDATED']);
    }
  }
};
```

#### 5.7 Resolvers Index

**src/presentation/graphql/resolvers/index.ts**
```typescript
import { GraphQLScalarType, Kind } from 'graphql';
import { expenseQueries } from './queries/expenseQueries';
import { categoryQueries } from './queries/categoryQueries';
import { expenseMutations } from './mutations/expenseMutations';
import { categoryMutations } from './mutations/categoryMutations';
import { expenseSubscriptions } from './subscriptions/expenseSubscriptions';
import { GraphQLContext } from '../context';

// Custom DateTime scalar
const dateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime custom scalar type',
  serialize(value: any) {
    if (value instanceof Date) {
      return value.toISOString();
    }
    throw Error('GraphQL DateTime Scalar serializer expected a `Date` object');
  },
  parseValue(value: any) {
    if (typeof value === 'string') {
      return new Date(value);
    }
    throw new Error('GraphQL DateTime Scalar parser expected a `string`');
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  }
});

export const resolvers = {
  DateTime: dateTimeScalar,

  Query: {
    ...expenseQueries,
    ...categoryQueries
  },

  Mutation: {
    ...expenseMutations,
    ...categoryMutations
  },

  Subscription: {
    ...expenseSubscriptions
  },

  Expense: {
    category: async (parent: any, _: any, context: GraphQLContext) => {
      return await context.dataloaders.categoryLoader.load(parent.categoryId);
    }
  }
};
```

#### 5.8 Error Handling Middleware

**src/presentation/middleware/errorHandler.ts**
```typescript
import { GraphQLError, GraphQLFormattedError } from 'graphql';

export const formatError = (error: GraphQLError): GraphQLFormattedError => {
  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production') {
    if (error.extensions?.code === 'INTERNAL_SERVER_ERROR') {
      return {
        message: 'An unexpected error occurred',
        extensions: {
          code: 'INTERNAL_SERVER_ERROR'
        }
      };
    }
  }

  return {
    message: error.message,
    locations: error.locations,
    path: error.path,
    extensions: error.extensions
  };
};
```

---

### Step 6: Server Configuration

**src/presentation/server.ts**
```typescript
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import { PubSub } from 'graphql-subscriptions';

import { typeDefs } from './graphql/schema/typeDefs';
import { resolvers } from './graphql/resolvers';
import { createContext, GraphQLContext } from './graphql/context';
import { formatError } from './middleware/errorHandler';
import { ExpenseService } from '../application/services/ExpenseService';
import { CategoryService } from '../application/services/CategoryService';
import { ExpenseRepository } from '../infrastructure/repositories/ExpenseRepository';
import { CategoryRepository } from '../infrastructure/repositories/CategoryRepository';

export async function createApolloServer() {
  // Initialize repositories
  const expenseRepository = new ExpenseRepository();
  const categoryRepository = new CategoryRepository();

  // Initialize services
  const expenseService = new ExpenseService(expenseRepository, categoryRepository);
  const categoryService = new CategoryService(categoryRepository);

  // Initialize PubSub for subscriptions
  const pubsub = new PubSub();

  // Create Express app
  const app = express();
  const httpServer = createServer(app);

  // Create GraphQL schema
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  // Create WebSocket server for subscriptions
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql'
  });

  // Setup subscription handling
  const serverCleanup = useServer(
    {
      schema,
      context: async () => createContext(expenseService, categoryService, pubsub)
    },
    wsServer
  );

  // Create Apollo Server
  const server = new ApolloServer<GraphQLContext>({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            }
          };
        }
      }
    ],
    formatError
  });

  await server.start();

  // Configure middleware
  app.use(
    '/graphql',
    cors<cors.CorsRequest>({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true
    }),
    json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        // Add authentication logic here if needed
        // const user = await authenticateUser(req);
        return createContext(expenseService, categoryService, pubsub);
      }
    })
  );

  return { app, httpServer, server };
}
```

**src/index.ts**
```typescript
import 'dotenv/config';
import { createApolloServer } from './presentation/server';

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    const { app, httpServer } = await createApolloServer();

    httpServer.listen(PORT, () => {
      console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
      console.log(`🔌 Subscriptions ready at ws://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
```

**src/config/environment.ts**
```typescript
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('4000'),
  DATABASE_URL: z.string(),
  CORS_ORIGIN: z.string().default('http://localhost:3000')
});

export const env = envSchema.parse(process.env);
```

**.env.example**
```env
NODE_ENV=development
PORT=4000
DATABASE_URL="postgresql://user:password@localhost:5432/myexpenses?schema=public"
CORS_ORIGIN=http://localhost:3000
```

---

## Best Practices

### 1. **Use DataLoaders to Prevent N+1 Queries**
Always implement DataLoaders for related entities to batch database queries:
```typescript
import DataLoader from 'dataloader';

const categoryLoader = new DataLoader(async (ids: string[]) => {
  const categories = await prisma.category.findMany({
    where: { id: { in: ids } }
  });
  return ids.map(id => categories.find(c => c.id === id));
});
```

### 2. **Implement Proper Error Handling**
- Use GraphQLError with appropriate error codes
- Return meaningful error messages
- Don't expose internal errors in production
- Log errors for debugging

### 3. **Use Type Safety with TypeScript**
```typescript
interface ExpenseArgs {
  id: string;
}

interface CreateExpenseArgs {
  input: CreateExpenseInput;
}

// Use typed resolvers
const resolver = async (_: any, { id }: ExpenseArgs, context: GraphQLContext) => {
  // TypeScript ensures type safety
};
```

### 4. **Implement Security**
- Add authentication middleware
- Validate JWT tokens in context
- Use authorization directives for protected resolvers
- Validate and sanitize all inputs with Zod
- Implement rate limiting (use express-rate-limit)

### 5. **Optimize Query Performance**
- Use Prisma's query optimization features
- Implement proper database indexes
- Use DataLoaders to batch queries
- Enable Prisma query logging in development
- Use pagination for large datasets

### 6. **Schema Design**
- Use meaningful type names
- Add descriptions to all types and fields
- Follow naming conventions (camelCase for fields, PascalCase for types)
- Version your schema with @deprecated directive
- Separate schema files by domain

### 7. **Testing**
- Write integration tests for resolvers
- Test DataLoaders independently
- Mock repositories in unit tests
- Use Jest for testing framework
- Test subscription events

---

## Testing Strategy

### Jest Configuration

**jest.config.js**
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts'
  ],
  coverageDirectory: 'coverage',
  verbose: true
};
```

### Integration Test Example

**tests/integration/graphql/expenseQueries.test.ts**
```typescript
import { ApolloServer } from '@apollo/server';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { typeDefs } from '../../../src/presentation/graphql/schema/typeDefs';
import { resolvers } from '../../../src/presentation/graphql/resolvers';
import { ExpenseService } from '../../../src/application/services/ExpenseService';
import { CategoryService } from '../../../src/application/services/CategoryService';
import { createContext } from '../../../src/presentation/graphql/context';
import { PubSub } from 'graphql-subscriptions';

describe('Expense Queries', () => {
  let server: ApolloServer;
  let expenseService: jest.Mocked<ExpenseService>;
  let categoryService: jest.Mocked<CategoryService>;
  let pubsub: PubSub;

  beforeEach(() => {
    // Mock services
    expenseService = {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    } as any;

    categoryService = {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn()
    } as any;

    pubsub = new PubSub();

    const schema = makeExecutableSchema({ typeDefs, resolvers });

    server = new ApolloServer({
      schema,
      context: () => createContext(expenseService, categoryService, pubsub)
    });
  });

  afterEach(async () => {
    await server.stop();
  });

  it('should return all expenses', async () => {
    // Arrange
    const mockExpenses = [
      {
        id: '1',
        description: 'Test Expense',
        amount: 100,
        date: new Date('2025-12-15'),
        categoryId: 'cat-1',
        createdAt: new Date()
      }
    ];

    expenseService.getAll.mockResolvedValue(mockExpenses as any);

    // Act
    const response = await server.executeOperation({
      query: `
        query {
          expenses {
            id
            description
            amount
          }
        }
      `
    });

    // Assert
    expect(response.body.kind).toBe('single');
    if (response.body.kind === 'single') {
      expect(response.body.singleResult.errors).toBeUndefined();
      expect(response.body.singleResult.data?.expenses).toHaveLength(1);
      expect(response.body.singleResult.data?.expenses[0]).toMatchObject({
        id: '1',
        description: 'Test Expense',
        amount: 100
      });
    }
  });

  it('should return expense by id', async () => {
    // Arrange
    const mockExpense = {
      id: '1',
      description: 'Test Expense',
      amount: 100,
      date: new Date('2025-12-15'),
      categoryId: 'cat-1',
      createdAt: new Date()
    };

    expenseService.getById.mockResolvedValue(mockExpense as any);

    // Act
    const response = await server.executeOperation({
      query: `
        query GetExpense($id: ID!) {
          expense(id: $id) {
            id
            description
            amount
          }
        }
      `,
      variables: { id: '1' }
    });

    // Assert
    expect(response.body.kind).toBe('single');
    if (response.body.kind === 'single') {
      expect(response.body.singleResult.errors).toBeUndefined();
      expect(response.body.singleResult.data?.expense).toMatchObject({
        id: '1',
        description: 'Test Expense',
        amount: 100
      });
    }
  });
});
```

### Unit Test Example

**tests/unit/services/ExpenseService.test.ts**
```typescript
import { ExpenseService } from '../../../src/application/services/ExpenseService';
import { IExpenseRepository } from '../../../src/domain/interfaces/IExpenseRepository';
import { ICategoryRepository } from '../../../src/domain/interfaces/ICategoryRepository';
import { Expense } from '../../../src/domain/entities/Expense';
import { Category } from '../../../src/domain/entities/Category';

describe('ExpenseService', () => {
  let service: ExpenseService;
  let expenseRepository: jest.Mocked<IExpenseRepository>;
  let categoryRepository: jest.Mocked<ICategoryRepository>;

  beforeEach(() => {
    expenseRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findByCategory: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };

    categoryRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };

    service = new ExpenseService(expenseRepository, categoryRepository);
  });

  describe('create', () => {
    it('should create a new expense', async () => {
      // Arrange
      const input = {
        description: 'Test Expense',
        amount: 100,
        date: new Date('2025-12-15'),
        categoryId: 'cat-1'
      };

      const mockCategory = Category.create('Food', null, '#FF0000');
      const mockExpense = Expense.create(
        input.description,
        input.amount,
        input.date,
        input.categoryId
      );

      categoryRepository.findById.mockResolvedValue(mockCategory);
      expenseRepository.create.mockResolvedValue(mockExpense);

      // Act
      const result = await service.create(input);

      // Assert
      expect(result).toBeDefined();
      expect(result.description).toBe('Test Expense');
      expect(categoryRepository.findById).toHaveBeenCalledWith('cat-1');
      expect(expenseRepository.create).toHaveBeenCalled();
    });

    it('should throw error when category does not exist', async () => {
      // Arrange
      const input = {
        description: 'Test Expense',
        amount: 100,
        date: new Date('2025-12-15'),
        categoryId: 'invalid-id'
      };

      categoryRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(input)).rejects.toThrow(
        'Category with ID invalid-id not found'
      );
    });
  });
});
```

---

## Example GraphQL Queries

### Query All Expenses
```graphql
query GetExpenses {
  expenses {
    id
    description
    amount
    date
    category {
      name
      color
    }
    createdAt
  }
}
```

### Query Expense by ID
```graphql
query GetExpense($id: ID!) {
  expense(id: $id) {
    id
    description
    amount
    date
    category {
      id
      name
      description
      color
    }
    createdAt
    updatedAt
  }
}
```

### Query Expenses by Category
```graphql
query GetExpensesByCategory($categoryId: ID!) {
  expensesByCategory(categoryId: $categoryId) {
    id
    description
    amount
    date
    createdAt
  }
}
```

### Create Expense Mutation
```graphql
mutation CreateExpense($input: CreateExpenseInput!) {
  createExpense(input: $input) {
    id
    description
    amount
    date
    category {
      name
      color
    }
    createdAt
  }
}

# Variables
{
  "input": {
    "description": "Lunch at restaurant",
    "amount": 25.50,
    "date": "2025-12-15T12:00:00Z",
    "categoryId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  }
}
```

### Update Expense Mutation
```graphql
mutation UpdateExpense($id: ID!, $input: UpdateExpenseInput!) {
  updateExpense(id: $id, input: $input) {
    id
    description
    amount
    date
    updatedAt
  }
}

# Variables
{
  "id": "expense-id-here",
  "input": {
    "description": "Updated lunch expense",
    "amount": 30.00,
    "date": "2025-12-15T12:30:00Z",
    "categoryId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  }
}
```

### Delete Expense Mutation
```graphql
mutation DeleteExpense($id: ID!) {
  deleteExpense(id: $id)
}
```

### Create Category Mutation
```graphql
mutation CreateCategory($input: CreateCategoryInput!) {
  createCategory(input: $input) {
    id
    name
    description
    color
  }
}

# Variables
{
  "input": {
    "name": "Food & Dining",
    "description": "Restaurant meals and groceries",
    "color": "#FF5733"
  }
}
```

### Subscribe to New Expenses
```graphql
subscription OnExpenseCreated {
  expenseCreated {
    id
    description
    amount
    date
    category {
      name
      color
    }
  }
}
```

### Subscribe to Expense Updates
```graphql
subscription OnExpenseUpdated {
  expenseUpdated {
    id
    description
    amount
    updatedAt
  }
}
```

---

## Performance Tips

1. **Enable Response Compression**
```typescript
import compression from 'compression';

app.use(compression());
```

2. **Use Persistent Queries**
```typescript
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

const server = new ApolloServer({
  schema,
  plugins: [
    ApolloServerPluginLandingPageLocalDefault({ 
      includeCookies: true 
    })
  ],
  persistedQueries: {
    ttl: 900 // 15 minutes
  }
});
```

3. **Implement Redis Caching**
```typescript
import Redis from 'ioredis';
import { RedisCache } from 'apollo-server-cache-redis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379')
});

const server = new ApolloServer({
  schema,
  cache: new RedisCache({ client: redis })
});
```

4. **Optimize Prisma Queries**
```typescript
// Use select to fetch only needed fields
const expenses = await prisma.expense.findMany({
  select: {
    id: true,
    description: true,
    amount: true
  }
});

// Enable query logging for optimization
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
});
```

5. **Monitor with Logging**
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

6. **Implement Query Complexity Limiting**
```bash
npm install graphql-query-complexity
```

```typescript
import { createComplexityLimitRule } from 'graphql-validation-complexity';

const server = new ApolloServer({
  schema,
  validationRules: [
    createComplexityLimitRule(1000, {
      onCost: (cost) => console.log('Query cost:', cost)
    })
  ]
});
```

---

## Security Checklist

- [ ] Implement JWT authentication
- [ ] Add authorization middleware to resolvers
- [ ] Validate all input data with Zod
- [ ] Implement rate limiting (express-rate-limit)
- [ ] Enable CORS with specific origins only
- [ ] Use HTTPS in production (enforce with helmet)
- [ ] Sanitize error messages in production
- [ ] Implement query complexity analysis
- [ ] Set maximum query depth (graphql-depth-limit)
- [ ] Add request size limits
- [ ] Use environment variables for secrets
- [ ] Enable Prisma query sanitization
- [ ] Implement CSRF protection
- [ ] Add security headers with helmet
- [ ] Use prepared statements (Prisma does this automatically)

---

## Deployment Checklist

- [ ] Configure environment variables (.env for production)
- [ ] Run Prisma migrations (`npx prisma migrate deploy`)
- [ ] Generate Prisma client (`npx prisma generate`)
- [ ] Enable logging and monitoring (Winston, Pino)
- [ ] Configure CORS for production URLs
- [ ] Set up health checks endpoint
- [ ] Enable response compression
- [ ] Configure rate limiting
- [ ] Set up CI/CD pipeline (GitHub Actions, GitLab CI)
- [ ] Build TypeScript (`npm run build`)
- [ ] Set NODE_ENV=production
- [ ] Use PM2 or similar for process management
- [ ] Set up reverse proxy (Nginx, Caddy)
- [ ] Configure SSL/TLS certificates
- [ ] Enable Apollo Studio for monitoring (optional)
- [ ] Set up error tracking (Sentry, Rollbar)
- [ ] Configure database connection pooling
- [ ] Implement graceful shutdown

---

## Docker Deployment

**Dockerfile**
```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npm run build
RUN npx prisma generate

# Production image
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 4000

CMD ["npm", "start"]
```

**docker-compose.yml**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/myexpenses
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=myexpenses
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

---

## Additional Resources

- **Apollo Server Documentation**: https://www.apollographql.com/docs/apollo-server/
- **GraphQL Best Practices**: https://graphql.org/learn/best-practices/
- **Prisma Documentation**: https://www.prisma.io/docs
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **DataLoader Pattern**: https://github.com/graphql/dataloader
- **Clean Architecture**: https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html

---

## Next Steps

1. Initialize Node.js project with TypeScript
2. Install dependencies (Apollo Server, Prisma, DataLoader)
3. Set up Prisma schema and run migrations
4. Implement domain entities with TypeScript classes
5. Create repositories using Prisma
6. Implement application services with business logic
7. Create GraphQL schema files (.graphql)
8. Implement resolvers (queries, mutations, subscriptions)
9. Add DataLoaders for N+1 prevention
10. Implement error handling and validation
11. Write unit and integration tests with Jest
12. Set up Docker containers
13. Deploy to production (Heroku, Railway, DigitalOcean, AWS)
14. Monitor and optimize performance

---

## Quick Start Commands

### Initialize Project
```bash
# Create project directory
mkdir my-expenses && cd my-expenses

# Initialize npm project
npm init -y

# Install dependencies
npm install @apollo/server graphql @prisma/client graphql-subscriptions graphql-ws ws dataloader dotenv zod express cors

# Install dev dependencies
npm install -D typescript @types/node @types/express @types/cors @types/ws ts-node ts-node-dev prisma jest ts-jest @types/jest

# Initialize TypeScript
npx tsc --init

# Initialize Prisma with PostgreSQL
npx prisma init --datasource-provider postgresql
```

### Database Setup
```bash
# Create migration
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database (development only)
npx prisma migrate reset
```

### Development
```bash
# Run in development mode with hot reload
npm run dev

# Build TypeScript
npm run build

# Run production build
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Access GraphQL Playground
```bash
# After starting server, open in browser:
http://localhost:4000/graphql
```

---

*Last Updated: December 15, 2025*
