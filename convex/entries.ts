import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("Not authenticated");
		}
		return ctx.db
			.query("entries")
			.withIndex("by_userId", (q) => q.eq("user_id", identity.subject))
			.collect();
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
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("Not authenticated");
		}

		const entryId = await ctx.db.insert("entries", {
			name: args.name,
			quantity: args.quantity,
			price: args.price,
			category_id: args.categoryId,
			store_id: args.storeId,
			purchase_date: args.purchaseDate,
			user_id: identity.subject,
		});

		return entryId;
	},
});

export const deleteEntry = mutation({
	args: {
		id: v.id("entries"),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("Not authenticated");
		}

		const entry = await ctx.db.get(args.id);
		if (!entry) {
			throw new Error("Entry not found");
		}

		if (entry.user_id !== identity.subject) {
			throw new Error("Not authorized to delete this entry");
		}

		return ctx.db.delete(args.id);
	},
});

export const listWithCategoryAndStore = query({
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("Not authenticated");
		}

		const entries = await ctx.db
			.query("entries")
			.withIndex("by_userId", (q) => q.eq("user_id", identity.subject))
			.order("desc")
			.collect();

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
