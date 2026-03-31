import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { botsTable } from "./bots";

export const deploymentsTable = pgTable("deployments", {
  id: text("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  botId: integer("bot_id").notNull().references(() => botsTable.id),
  appName: text("app_name").notNull(),
  repoUrl: text("repo_url").notNull(),
  sessionId: text("session_id").notNull(),
  status: text("status").notNull().default("building"),
  herokuAppId: text("heroku_app_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertDeploymentSchema = createInsertSchema(deploymentsTable).omit({ createdAt: true, updatedAt: true });
export type InsertDeployment = z.infer<typeof insertDeploymentSchema>;
export type Deployment = typeof deploymentsTable.$inferSelect;
