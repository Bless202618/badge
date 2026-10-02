import { PrismaClient } from "@prisma/client";

// One shared client across hot-reloads (Next.js dev restarts often).
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    // DATABASE_URL is set in .env.local (never committed).
    // datasourceUrl intentionally NOT hardcoded — same code works with
    // Supabase Postgres, Neon, or local PostgreSQL.
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
