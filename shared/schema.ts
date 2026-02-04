import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// === TABLE DEFINITIONS ===

export const profile = pgTable("profile", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  bio: text("bio").notNull(),
  avatarUrl: text("avatar_url").notNull(),
  skills: text("skills").array().notNull(), // Array of strings for skills
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  icon: text("icon").notNull(), // Lucide icon name or image URL
  order: integer("order").notNull(),
});

export const links = pgTable("links", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull(), // Foreign key to categories
  title: text("title").notNull(),
  url: text("url").notNull(),
  icon: text("icon").notNull(), // Lucide icon name or image URL
  order: integer("order").notNull(),
});

// === RELATIONS ===

export const categoriesRelations = relations(categories, ({ many }) => ({
  links: many(links),
}));

export const linksRelations = relations(links, ({ one }) => ({
  category: one(categories, {
    fields: [links.categoryId],
    references: [categories.id],
  }),
}));

// === SCHEMAS ===

export const insertProfileSchema = createInsertSchema(profile);
export const insertCategorySchema = createInsertSchema(categories);
export const insertLinkSchema = createInsertSchema(links);

// === TYPES ===

export type Profile = typeof profile.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Link = typeof links.$inferSelect;

// Combined type for the bio page response
export type BioData = {
  profile: Profile;
  categories: (Category & { links: Link[] })[];
};
