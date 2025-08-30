"use client";

import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import React, { useCallback, useMemo, useReducer, useState } from "react";
import { Button } from "../ui/button";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { EntryWithCategoryAndStore } from "@/types/entry-with-category-and-store";
import { Toast } from "@base-ui-components/react";
import { useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import { Trash2Icon } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import PriceDisplay from "../price-display";

const columnHelper = createColumnHelper<EntryWithCategoryAndStore & { total: number }>();

export default function EntriesTable() {
	const deleteEntry = useMutation(api.entries.deleteEntry);
	const entries = useQuery(api.entries.listWithCategoryAndStore);
	const toastManager = Toast.useToastManager();

	const handleDelete = useCallback(
		async ({ id }: { id: Id<"entries"> }) => {
			await deleteEntry({ id: id }).then(() => {
				toastManager.add({ title: "Successfully deleted entry" });
			});
		},
		[deleteEntry, toastManager]
	);

	const columns = useMemo(
		() => [
			columnHelper.accessor("purchase_date", {
				header: () => "Date",
				cell: ({ row }) => {
					const date = row.getValue("purchase_date") as Date;
					const formattedDate = format(date, "dd.MM.yyyy");

					return formattedDate;
				},
				footer: (info) => info.column.id,
			}),
			columnHelper.accessor("storeName", {
				header: () => "Store",
				cell: (info) => info.getValue(),
				footer: (info) => info.column.id,
			}),
			columnHelper.accessor("name", {
				header: () => "Item",
				cell: (info) => info.getValue(),
				footer: (info) => info.column.id,
			}),
			columnHelper.accessor("categoryName", {
				header: () => "Category",
				cell: (info) => info.getValue(),
				footer: (info) => info.column.id,
			}),
			columnHelper.accessor("quantity", {
				header: () => "Quantity",
				cell: (info) => info.renderValue(),
				footer: (info) => info.column.id,
			}),
			columnHelper.accessor("price", {
				header: () => "Price per item",
				cell: ({ row }) => {
					const amount = parseFloat(row.getValue("price"));

					return (
						<div className="font-medium">
							<PriceDisplay price={amount} />
						</div>
					);
				},
				footer: (info) => info.column.id,
			}),
			columnHelper.accessor("total", {
				header: () => "Total price",
				cell: ({ row }) => {
					const amount = parseFloat(row.getValue("price")) * parseFloat(row.getValue("quantity"));

					return (
						<div className="font-medium">
							<PriceDisplay price={amount} />
						</div>
					);
				},
				footer: (info) => info.column.id,
			}),

			columnHelper.display({
				id: "actions",
				header: () => "Actions",
				cell: ({ row }) => {
					const entry = row.original;

					return (
						<Button
							size="icon"
							variant="ghost"
							onClick={() => handleDelete({ id: row.original._id })}
						>
							<Trash2Icon size={16} />
						</Button>
					);
				},
			}),
		],
		[handleDelete]
	);

	const table = useReactTable({
		data: (entries as (EntryWithCategoryAndStore & { total: number })[]) ?? [],
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

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
										: flexRender(header.column.columnDef.header, header.getContext())}
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
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
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
