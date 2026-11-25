import { PrismaClient } from "./generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Dev HMR re-evaluates this module on every edit; without a global cache each
// reload would leak a Pool (and its sockets) and eventually exhaust Postgres.
const globalForPrisma = globalThis as typeof globalThis & {
  __gymbroPool?: Pool;
  __gymbroPrisma?: PrismaClient;
};

const pool = globalForPrisma.__gymbroPool ?? new Pool({ connectionString });

export const prisma =
  globalForPrisma.__gymbroPrisma ?? new PrismaClient({ adapter: new PrismaPg(pool) });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__gymbroPool = pool;
  globalForPrisma.__gymbroPrisma = prisma;
}
