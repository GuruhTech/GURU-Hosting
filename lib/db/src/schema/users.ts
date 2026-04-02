import { pgTable, text, serial, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  country: text("country").notNull(),
  currency: text("currency").notNull(),
  gruCredits: integer("gru_credits").notNull().default(0),
  freeDeploymentUsed: boolean("free_deployment_used").notNull().default(false),
  herokuApiKey: text("heroku_api_key").notNull(),
  herokuTeam: text("heroku_team"),
  herokuApiType: text("heroku_api_type").notNull().default("personal"),
  isAdmin: boolean("is_admin").notNull().default(false),
  isBanned: boolean("is_banned").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
