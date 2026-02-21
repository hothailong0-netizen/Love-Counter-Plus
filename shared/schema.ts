import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const couples = pgTable("couples", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  partner1Name: text("partner1_name").notNull(),
  partner2Name: text("partner2_name").notNull(),
  startDate: text("start_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const memories = pgTable("memories", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull(),
  title: text("title").notNull(),
  content: text("content"),
  date: text("date").notNull(),
  mood: text("mood"),
  photoUri: text("photo_uri"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const importantDates = pgTable("important_dates", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull(),
  title: text("title").notNull(),
  date: text("date").notNull(),
  type: text("type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCoupleSchema = createInsertSchema(couples).pick({
  partner1Name: true,
  partner2Name: true,
  startDate: true,
});

export const insertMemorySchema = createInsertSchema(memories).pick({
  coupleId: true,
  title: true,
  content: true,
  date: true,
  mood: true,
  photoUri: true,
});

export const insertImportantDateSchema = createInsertSchema(importantDates).pick({
  coupleId: true,
  title: true,
  date: true,
  type: true,
});

export type InsertCouple = z.infer<typeof insertCoupleSchema>;
export type Couple = typeof couples.$inferSelect;
export type InsertMemory = z.infer<typeof insertMemorySchema>;
export type Memory = typeof memories.$inferSelect;
export type InsertImportantDate = z.infer<typeof insertImportantDateSchema>;
export type ImportantDate = typeof importantDates.$inferSelect;
