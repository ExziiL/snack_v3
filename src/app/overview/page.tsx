"use client";
import EntryCard from "@/components/entry-card";
import { useQuery } from "convex/react";
import React from "react";
import { api } from "../../../convex/_generated/api";

export default function Overview() {
	const entries = useQuery(api.entries.listWithCategoryAndStore);

	return (
		<div>
			{entries?.map((e) => {
				return (
					<EntryCard
						entry={e}
						key={e._id}
					/>
				);
			})}
		</div>
	);
}
