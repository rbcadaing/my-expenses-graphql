# Node.js GraphQL Project - My Expenses

A production-ready GraphQL API for expense tracking built with Node.js, TypeScript, Apollo Server, and Prisma.

## Features

- 🚀 GraphQL API with Apollo Server v4
- 🔐 Type-safe with TypeScript
- 💾 PostgreSQL database with Prisma ORM
- 🎯 Clean Architecture (Domain, Application, Infrastructure, Presentation layers)
- 📊 Real-time subscriptions via WebSocket
- 🔄 DataLoaders for optimized queries (N+1 prevention)
- ✅ Input validation with Zod
- 🧪 Testing setup with Jest
- 🐳 Docker support

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update with your database credentials:

```bash
cp .env.example .env
```

### 3. Set Up Database

```bash
# Run migrations
npm run prisma:migrate

# Generate Prisma Client
npm run prisma:generate

# (Optional) Open Prisma Studio
npm run prisma:studio
```

### 4. Start Development Server

```bash
npm run dev
```

The GraphQL API will be available at: `http://localhost:4000/graphql`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Run production build
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:studio` - Open Prisma Studio GUI
- `npm run prisma:reset` - Reset database (development only)

## Project Structure

```
src/
├── domain/              # Domain entities and interfaces
├── application/         # Business logic and services
├── infrastructure/      # Database and external services
├── presentation/        # GraphQL API layer
│   ├── graphql/
│   │   ├── schema/     # GraphQL type definitions
│   │   ├── resolvers/  # Query/Mutation/Subscription resolvers
│   │   └── dataloaders/# DataLoaders for batching
│   └── middleware/     # Error handling, auth
└── config/             # Configuration files
```

## API Documentation

Refer to `GRAPHQL_IMPLEMENTATION_GUIDE.md` for complete implementation details and examples.

### Example Queries

```graphql
# Get all expenses
query {
  expenses {
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

# Create expense
mutation {
  createExpense(input: {
    description: "Lunch"
    amount: 25.50
    date: "2025-12-15T12:00:00Z"
    categoryId: "category-id-here"
  }) {
    id
    description
  }
}
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## License

ISC
