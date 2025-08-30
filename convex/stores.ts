import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("stores").order("asc").collect();
	},
});

export const createStore = mutation({
	args: { name: v.string() },
	handler: async (ctx, args) => {
		const normalizedName = args.name.trim().toLowerCase();
		if (normalizedName === "") {
			throw new Error("Store name cannot be empty");
		}

		const existing = await ctx.db
			.query("stores")
			.filter((q) => q.eq(q.field("name"), normalizedName))
			.first();

		if (existing) {
			// You could throw an error or simply return the existing one
			// Throwing an error is often clearer for the client.
			throw new Error(`Store "${normalizedName}" already exists.`);
		}

		const storeId = await ctx.db.insert("stores", {
			name: args.name.trim(),
		});

		return storeId;
	},
});
