import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("categories").order("asc").collect();
	},
});

export const createCategory = mutation({
	args: { name: v.string() },
	handler: async (ctx, args) => {
		const normalizedName = args.name.trim().toLowerCase();
		if (normalizedName === "") {
			throw new Error("Category name cannot be empty");
		}

		const existing = await ctx.db
			.query("categories")
			.filter((q) => q.eq(q.field("name"), normalizedName))
			.first();

		if (existing) {
			// You could throw an error or simply return the existing one
			// Throwing an error is often clearer for the client.
			throw new Error(`Category "${normalizedName}" already exists.`);
		}

		const categoryId = await ctx.db.insert("categories", {
			name: args.name.trim(),
		});

		return categoryId;
	},
});
