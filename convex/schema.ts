import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	categories: defineTable({ name: v.string() }).index("by_name", ["name"]),

	entries: defineTable({
		name: v.string(),
		price: v.float64(),
		quantity: v.float64(),
		categoryId: v.id("categories"),
	}).index("by_categoryId", ["categoryId"]),
});
