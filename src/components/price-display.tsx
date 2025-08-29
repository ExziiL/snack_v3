import React from "react";

interface IProps {
	price: number;
}

export default function PriceDisplay({ price }: IProps) {
	const amount = price / 100;
	const formatted = new Intl.NumberFormat("de-DE", {
		style: "currency",
		currency: "EUR",
	}).format(amount);

	return <div>{formatted}</div>;
}
