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
		storeId: v.id("stores"),
		purchaseDate: v.string(),
	},
	handler: async (ctx, args) => {
		const entryId = await ctx.db.insert("entries", {
			name: args.name,
			quantity: args.quantity,
			price: args.price,
			category_id: args.categoryId,
			store_id: args.storeId,
			purchase_date: args.purchaseDate,
		});

		return entryId;
	},
});

export const deleteEntry = mutation({
	args: {
		id: v.id("entries"),
	},
	handler: async (ctx, args) => {
		return ctx.db.delete(args.id);
	},
});

export const listWithCategoryAndStore = query({
	handler: async (ctx) => {
		const entries = await ctx.db.query("entries").order("desc").collect();

		const itemsWithCategory = await Promise.all(
			entries.map(async (entry) => {
				const category = await ctx.db.get(entry.category_id);
				const store = entry.store_id ? await ctx.db.get(entry.store_id) : null;

				return {
					...entry,
					categoryName: category?.name,
					storeName: store?.name,
				};
			})
		);

		return itemsWithCategory;
	},
});
