"use client";

import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import React, { useMemo, useReducer, useState } from "react";
import { Button } from "../ui/button";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { createClient } from "@/supabase/client";
import { Category, Entry } from "@/types";
import { useQuery } from "@tanstack/react-query";

const columnHelper = createColumnHelper<Entry>();

async function fetchEntries() {
	const supabase = createClient();
	const { data, error } = await supabase
		.from("entries")
		.select(
			`id, title, quantity, price, entry_categories (categories (id, name ))`
		);
	if (error) throw error;
	return data;
}

export default function EntriesTable() {
	const { data: entries = [], isLoading } = useQuery({
		queryKey: ["entries"],
		queryFn: fetchEntries,
	});

	const rerender = useReducer(() => ({}), {})[1];

	const columns = useMemo(
		() => [
			columnHelper.accessor("title", {
				header: () => "Title",
				cell: (info) => info.getValue(),
				footer: (info) => info.column.id,
			}),
			columnHelper.accessor("entry_categories", {
				header: () => "Category",
				cell: (info) => {
					const categories = info.getValue();
					if (!categories || categories.length === 0) return "-";
					return categories
						.map((item: { categories: Category }) => item.categories.name)
						.join(", ");
				},
				footer: (info) => info.column.id,
			}),
			columnHelper.accessor("quantity", {
				header: () => "Quantity",
				cell: (info) => info.renderValue(),
				footer: (info) => info.column.id,
			}),
			columnHelper.accessor("price", {
				header: () => "Price",
				cell: ({ row }) => {
					const amount = parseFloat(row.getValue("price"));
					const formatted = new Intl.NumberFormat("de-DE", {
						style: "currency",
						currency: "EUR",
					}).format(amount);

					return <div className="text-right font-medium">{formatted}</div>;
				},
				footer: (info) => info.column.id,
			}),
		],
		[]
	);

	const table = useReactTable({
		data: entries as unknown as Entry[],
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	if (isLoading) return <div>Loading…</div>;

	return (
		<div className="p-2">
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<TableHead key={header.id}>
									{header.isPlaceholder
										? null
										: flexRender(
												header.column.columnDef.header,
												header.getContext()
										  )}
								</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow key={row.id}>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>
										{flexRender(
											cell.column.columnDef.cell,
											cell.getContext()
										)}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell
								colSpan={columns.length}
								className="h-24 text-center"
							>
								No results.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>

			<div className="h-4" />
		</div>
	);
}
