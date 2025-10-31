# Deployment runbook

This document captures the operational steps required to run the Habit Tracker application in production.

## 1. Provision infrastructure

1. **Database** – Create a PostgreSQL instance. For managed providers, enable SSL and provision at least one connection pool (e.g. PgBouncer on Fly.io, Neon connection pooling, etc.).
2. **Runtime** – Deploy the Next.js application to a platform that supports Node.js 20+ (Vercel, Render, Fly.io, etc.). Ensure outbound access to the database host is allowed.
3. **Environment secrets** – Store the values listed below in your platform's secret manager.

### Required environment variables

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string. Include any required parameters for connection pooling or SSL (e.g. `?sslmode=require`). |

### Optional environment variables

| Variable | Description |
| --- | --- |
| `SEED_USER_ID` | User identifier used by the seed script. Override to keep seeded data idempotent across environments. |
| `SEED_USER_NAME` | Display name assigned to the seeded user. |

## 2. Database migrations

Prisma migrations are checked into version control. Run them during deployment before starting the Next.js server:

```bash
npm install
npm run db:migrate
```

If you need to bootstrap a brand new database without Prisma, the SQL definitions in `prisma/init.sql` can be executed manually.

## 3. Seed data (optional)

Run the seed script after migrations if you want demo content:

```bash
npm run db:seed
```

Set `SEED_USER_ID` when running in staging so that repeated executions update the same user without creating duplicates.

## 4. Build and release

Build the application and start the production server:

```bash
npm run build
npm run start
```

When deploying to serverless platforms, rely on their documented build workflows (e.g. Vercel automatically runs `npm install`, `npm run build`, and `npm run start`).

## 5. Health checks

The application exposes a lightweight health check at `GET /api/health`. A 200 response indicates the Next.js runtime can connect to PostgreSQL. Non-200 responses should be surfaced to your monitoring and alerting systems.

## 6. Observability and maintenance

- Enable structured logging in your hosting provider and configure log drains where appropriate.
- Set up database connection monitoring and alerts for slow queries or saturation.
- Back up the PostgreSQL instance regularly and document restoration procedures.

## 7. Rollback strategy

- Database schema changes are additive; rolling back an application deployment should not require reverting migrations.
- If a migration must be rolled back, use `prisma migrate resolve --rolled-back` to mark the migration and apply a fix-forward release.
