"use client";

import NewEntryForm from "@/components/forms/new-entry-form";
import EntriesTable from "@/components/tables/entries-table";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Home() {
	return (
		<>
			<Authenticated>
				<div>
					<NewEntryForm />
					<EntriesTable />
				</div>
			</Authenticated>
			{/* <Unauthenticated>
				<SignInButton />
			</Unauthenticated> */}
		</>
	);
}
