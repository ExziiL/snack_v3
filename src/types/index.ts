import { Database } from "./supabase";

export type Entry = Database["public"]["Tables"]["entries"]["Row"] & {
	entry_categories: {
		categories: Database["public"]["Tables"]["categories"]["Row"];
	}[];
};

export type Category = Database["public"]["Tables"]["categories"]["Row"];
