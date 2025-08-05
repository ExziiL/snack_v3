import NewEntryForm from "@/components/forms/new-entry-form";
import EntriesTable from "@/components/tables/entries-table";
import { createClient } from "@/supabase/server";
import { Entry } from "@/types";

export default async function Home() {
	return (
		<div>
			<NewEntryForm />
			<EntriesTable />
		</div>
	);
}
