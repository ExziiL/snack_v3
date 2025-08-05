import NewEntryForm from "@/components/forms/new-entry-form";
import EntriesTable from "@/components/tables/entries-table";
import { createClient } from "@/supabase/server";
import { Entry } from "@/types";

export default async function Home() {
	const supabase = await createClient();
	const { data: entries, error } = await supabase
		.from("entries")
		.select(
			`id, title, quantity, price, entry_categories (categories (id, name ))`
		);

	if (error) console.error(error);

	return (
		<div>
			<NewEntryForm />
			<EntriesTable entries={entries as unknown as Entry[]} />
		</div>
	);
}
