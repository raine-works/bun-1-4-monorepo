# @app/data

A lightweight, high-performance, and type-safe data layer for PostgreSQL powered by Bun's built-in `bun:sql` driver.

## ✨ Features

- **Zero ORM Dependencies**: Direct native PostgreSQL queries using Bun's built-in `SQL` driver (`import { SQL } from "bun"`).
- **Type-Safe Contracts**: Strongly typed models (`User`, `Item`) and mutation DTOs (`CreateUserInput`, `UpdateUserInput`, `CreateItemInput`, `UpdateItemInput`).
- **Raw Parameterized SQL**: Hand-crafted, readable, and highly optimized PostgreSQL queries with automatic parameter injection.
- **Handwritten SQL Migrations**: Simple migration runner tracking applied migrations in `_migrations` with `-- up` and `-- down` support.
- **Transactions**: Full support for transactions via `db.transaction(async (tx) => { ... })`.
- **Extensible & Scalable**: Modular structure (`contracts/`, `queries/`, `migrations/`) designed to grow cleanly as new tables and domain operations are added.

---

## 📁 Package Architecture

```
packages/data/
├── migrations/             # Handwritten SQL migration files
│   ├── 0001_create_users.sql
│   └── 0002_create_items.sql
├── scripts/
│   └── migrate.ts          # Migration CLI runner
├── src/
│   ├── client.ts           # Bun SQL connection initialization and transaction wrapper
│   ├── config.ts           # Connection URL & env var resolution
│   ├── contracts/          # Type-safe model contracts and DTOs
│   │   ├── user.ts         # User, CreateUserInput, UpdateUserInput, UserFilter
│   │   ├── item.ts         # Item, CreateItemInput, UpdateItemInput, ItemFilter
│   │   └── index.ts
│   ├── queries/            # Type-safe query operations written in raw SQL
│   │   ├── user.ts         # findById, findByEmail, list, create, update, delete, count, exists
│   │   ├── item.ts         # findById, list, listByUserId, create, update, toggle, delete, count
│   │   └── index.ts
│   ├── migrator.ts         # Lightweight SQL migration engine
│   └── index.ts            # Public package exports
└── tests/                  # Unit and integration test suite
```

---

## 🚀 Quick Start

### 1. Consuming in other packages (e.g. `@app/backend`)

```ts
import { db } from "@app/data";
import type { User, Item } from "@app/data";

// 1. Querying users
const user = await db.users.findByEmail("alice@example.com");
const activeUsers = await db.users.list({ isActive: true, limit: 10 });

// 2. Creating an item for a user
const newItem = await db.items.create({
  title: "Ship Bun 1.4 monorepo data layer",
  userId: user?.id,
});

// 3. Transactions
await db.transaction(async (tx) => {
  const u = await tx.users.create({ email: "bob@example.com", name: "Bob" });
  await tx.items.create({ title: "Welcome item", userId: u.id });
});

// 4. Raw SQL escape hatch
const stats = await db.sql`
  SELECT u.role, count(i.id)::int as "itemCount"
  FROM users u
  LEFT JOIN items i ON i.user_id = u.id
  GROUP BY u.role
`;
```

---

## 🗄️ Database Migrations

Migrations are stored as hand-written `.sql` files in `packages/data/migrations/`.

### Migration Commands

```bash
# Run all pending migrations
bun run migrate

# Check migration status
bun run migrate:status

# Roll back the last migration
bun run migrate:down

# Create a new migration file
bun scripts/migrate.ts create add_tags_table
```

### Migration File Format (`.sql`)

```sql
-- Migration: create_example
-- Created: 2026-08-26

-- up
CREATE TABLE IF NOT EXISTS example (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- down
DROP TABLE IF EXISTS example CASCADE;
```
