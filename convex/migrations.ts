import { Migrations } from "@convex-dev/migrations";
import { components } from "./_generated/api.js";
import { DataModel } from "./_generated/dataModel.js";

export const migrations = new Migrations<DataModel>(components.migrations);
export const run = migrations.runner();

// export const addStoreIdToEntries = migrations.define({
// 	table: "entries",
// 	migrateOne: async (ctx, entry) => {
// 		// If the entry doesn't have a store_id, set it to a default store
// 		if (entry.store_id === undefined) {
// 			// Create default store only once, or use existing one
// 			let defaultStore = await ctx.db
// 				.query("stores")
// 				.filter((q) => q.eq(q.field("name"), "Legacy Store"))
// 				.first();

// 			await ctx.db.patch(entry._id, { store_id: defaultStore?._id });
// 		}
// 	},
// });
