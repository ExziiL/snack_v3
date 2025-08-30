import { FunctionReturnType } from "convex/server";
import { api } from "../../convex/_generated/api";

type EntriesWithCategoryAndStore = FunctionReturnType<typeof api.entries.listWithCategoryAndStore>;
export type EntryWithCategoryAndStore = EntriesWithCategoryAndStore[number];
