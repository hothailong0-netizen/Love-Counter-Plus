import { drizzle } from "drizzle-orm/node-postgres";
import { eq, desc } from "drizzle-orm";
import {
  couples,
  memories,
  importantDates,
  type Couple,
  type InsertCouple,
  type Memory,
  type InsertMemory,
  type ImportantDate,
  type InsertImportantDate,
} from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export const db = drizzle(process.env.DATABASE_URL);

export async function getCouple(id: string): Promise<Couple | undefined> {
  const result = await db.select().from(couples).where(eq(couples.id, id));
  return result[0];
}

export async function getFirstCouple(): Promise<Couple | undefined> {
  const result = await db.select().from(couples).limit(1);
  return result[0];
}

export async function createCouple(data: InsertCouple): Promise<Couple> {
  const result = await db.insert(couples).values(data).returning();
  return result[0];
}

export async function updateCouple(id: string, data: Partial<InsertCouple>): Promise<Couple> {
  const result = await db.update(couples).set(data).where(eq(couples.id, id)).returning();
  return result[0];
}

export async function getMemories(coupleId: string): Promise<Memory[]> {
  return db.select().from(memories).where(eq(memories.coupleId, coupleId)).orderBy(desc(memories.date));
}

export async function createMemory(data: InsertMemory): Promise<Memory> {
  const result = await db.insert(memories).values(data).returning();
  return result[0];
}

export async function deleteMemory(id: string): Promise<void> {
  await db.delete(memories).where(eq(memories.id, id));
}

export async function getImportantDates(coupleId: string): Promise<ImportantDate[]> {
  return db.select().from(importantDates).where(eq(importantDates.coupleId, coupleId)).orderBy(desc(importantDates.date));
}

export async function createImportantDate(data: InsertImportantDate): Promise<ImportantDate> {
  const result = await db.insert(importantDates).values(data).returning();
  return result[0];
}

export async function deleteImportantDate(id: string): Promise<void> {
  await db.delete(importantDates).where(eq(importantDates.id, id));
}
