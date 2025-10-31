# Habit Tracker

A multi-tenant habit tracking dashboard built with Next.js 16, Prisma, and Tailwind CSS. Each browser session receives an isolated workspace so multiple users can track progress independently when the app is deployed.

## Prerequisites

- Node.js 20+
- npm 10+
- A PostgreSQL database (local Docker container, managed service, etc.)

## Environment variables

Create a `.env` file based on the following template:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
# Optional: values used by the seed script
SEED_USER_ID="demo-user-id"
SEED_USER_NAME="Demo User"
```

`DATABASE_URL` must point to a writable PostgreSQL database. The schema is managed through Prisma migrations.

## Local development

1. Install dependencies

   ```bash
   npm install
   ```

2. Apply database migrations

   ```bash
   npm run db:migrate
   ```

3. (Optional) Seed the database with sample data

   ```bash
   npm run db:seed
   ```

4. Start the development server

   ```bash
   npm run dev
   ```

The application is available at [http://localhost:3000](http://localhost:3000). Every new browser session receives a secure cookie that maps to a dedicated user record in the database.

## Build and quality checks

```bash
npm run lint
npm run build
```

These commands should be executed in CI/CD pipelines before deploying to production.

## Operational runbooks

Operational guidance—including deployment steps, seeding instructions, environment documentation, and health checks—is maintained in [`docs/deployment.md`](docs/deployment.md).

## Additional resources

- [Next.js documentation](https://nextjs.org/docs)
- [Prisma documentation](https://www.prisma.io/docs)
