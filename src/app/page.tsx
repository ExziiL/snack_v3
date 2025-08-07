"use client";

import NewEntryForm from "@/components/forms/new-entry-form";
import EntriesTable from "@/components/tables/entries-table";

export default function Home() {
	return (
		<div>
			<NewEntryForm />
			<EntriesTable />
		</div>
	);
}
