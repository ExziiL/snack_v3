import { EntryWithCategoryAndStore } from "@/types/entry-with-category-and-store";
import React from "react";
import PriceDisplay from "./price-display";

interface IProps {
	entry: EntryWithCategoryAndStore;
}

export default function EntryCard({ entry }: IProps) {
	return (
		<div className="border w-fit rounded-md border-gray-200">
			<h2>
				{entry.quantity}x {entry.name}
			</h2>
			<div>
				<PriceDisplay price={entry.price} />
			</div>
		</div>
	);
}
