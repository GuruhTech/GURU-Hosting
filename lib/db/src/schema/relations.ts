import { relations } from "drizzle-orm";
import { usersTable } from "./users";
import { botsTable } from "./bots";
import { deploymentsTable } from "./deployments";
import { paymentsTable } from "./payments";
import { sessionsTable } from "./sessions";

export const usersRelations = relations(usersTable, ({ many }) => ({
  deployments: many(deploymentsTable),
  payments: many(paymentsTable),
  sessions: many(sessionsTable),
}));

export const botsRelations = relations(botsTable, ({ many }) => ({
  deployments: many(deploymentsTable),
}));

export const deploymentsRelations = relations(deploymentsTable, ({ one }) => ({
  user: one(usersTable, { fields: [deploymentsTable.userId], references: [usersTable.id] }),
  bot: one(botsTable, { fields: [deploymentsTable.botId], references: [botsTable.id] }),
}));

export const paymentsRelations = relations(paymentsTable, ({ one }) => ({
  user: one(usersTable, { fields: [paymentsTable.userId], references: [usersTable.id] }),
}));

export const sessionsRelations = relations(sessionsTable, ({ one }) => ({
  user: one(usersTable, { fields: [sessionsTable.userId], references: [usersTable.id] }),
}));
