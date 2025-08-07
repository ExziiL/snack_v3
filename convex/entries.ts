import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
	args: {},
	handler: async (ctx) => {
		return ctx.db.query("entries").collect();
	},
});

export const create = mutation({
	args: {
		name: v.string(),
		quantity: v.number(),
		price: v.number(),
		categoryId: v.id("categories"),
	},
	handler: async (ctx, args) => {
		const entryId = await ctx.db.insert("entries", {
			name: args.name,
			quantity: args.quantity,
			price: args.price,
			categoryId: args.categoryId,
		});

		return entryId;
	},
});

export const listWithCategory = query({
	handler: async (ctx) => {
		const entries = await ctx.db.query("entries").order("desc").collect();

		const itemsWithCategory = await Promise.all(
			entries.map(async (entry) => {
				const category = await ctx.db.get(entry.categoryId);

				return {
					...entry,
					categoryName: category?.name,
				};
			})
		);

		return itemsWithCategory;
	},
});
