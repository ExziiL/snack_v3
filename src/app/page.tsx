"use client";

import NewEntryForm from "@/components/forms/new-entry-form";
import EntriesTable from "@/components/tables/entries-table";
import { SignInButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";

export default function Home() {
	return (
		<>
			<Authenticated>
				<div>
					<NewEntryForm />
					<EntriesTable />
				</div>
			</Authenticated>
			<Unauthenticated>
				<h1>Unauthenticated Please Sign In</h1>
				<SignInButton />
			</Unauthenticated>
		</>
	);
}
