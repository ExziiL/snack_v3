import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	categories: defineTable({ name: v.string() }).index("by_name", ["name"]),

	stores: defineTable({ name: v.string() }).index("by_name", ["name"]),

	entries: defineTable({
		name: v.string(),
		price: v.float64(),
		quantity: v.float64(),
		purchase_date: v.string(),
		store_id: v.id("stores"),
		category_id: v.id("categories"),
	})
		.index("by_categoryId", ["category_id"])
		.index("by_storeId", ["store_id"]),
});
