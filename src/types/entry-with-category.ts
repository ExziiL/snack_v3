import { FunctionReturnType } from "convex/server";
import { api } from "../../convex/_generated/api";

type EntriesWithCategory = FunctionReturnType<
	typeof api.entries.listWithCategory
>;
export type EntryWithCategory = EntriesWithCategory[number];
