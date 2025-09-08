"use client";

import { Button } from "@/components/ui/button";
import {
	Combobox,
	ComboboxChip,
	ComboboxChipRemove,
	ComboboxChips,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxItemIndicator,
	ComboboxList,
	ComboboxPopup,
	ComboboxPositioner,
} from "@/components/ui/combobox";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Toast } from "@base-ui-components/react";
import { useMutation, useQuery } from "convex/react";
import { PlusIcon } from "lucide-react";
import * as React from "react";
import { api } from "../../../../convex/_generated/api";

interface NewStoreComboboxProps {
	value?: StoreItem | null;
	onChange?: (value: StoreItem | null) => void;
}

export default function NewStoreCombobox({ value, onChange, ...props }: NewStoreComboboxProps) {
	const id = React.useId();

	const toastManager = Toast.useToastManager();

	const stores = useQuery(api.stores.list);
	const createStore = useMutation(api.stores.createStore);

	const [query, setQuery] = React.useState("");
	const [openDialog, setOpenDialog] = React.useState(false);
	const [isCreating, setIsCreating] = React.useState(false);

	const containerRef = React.useRef<HTMLDivElement | null>(null);
	const createInputRef = React.useRef<HTMLInputElement | null>(null);
	const comboboxInputRef = React.useRef<HTMLInputElement | null>(null);
	const pendingQueryRef = React.useRef("");

	// Convert stores to StoreItem format
	const storeItems: StoreItem[] = React.useMemo(() => {
		return stores?.map((store) => ({ id: store._id, value: store.name })) || [];
	}, [stores]);

	async function handleCreate() {
		const input = createInputRef.current || comboboxInputRef.current;
		const inputValue = input ? input.value.trim() : "";
		if (!inputValue) {
			return;
		}

		const normalized = inputValue.toLocaleLowerCase();
		const existing = storeItems.find(
			(store) => store.value.trim().toLocaleLowerCase() === normalized
		);

		if (existing) {
			onChange?.(existing);
			setOpenDialog(false);
			setQuery("");
			return;
		}

		setIsCreating(true);
		try {
			const newStoreId = await createStore({ name: inputValue });
			// Wait for the stores to refresh and find the actual store object
			// This ensures we get the same reference that will be in the items list
			const newStore = storeItems.find((store) => store.id === newStoreId);
			if (newStore) {
				onChange?.(newStore);
			} else {
				// Fallback if the store isn't found in the current list
				onChange?.({ id: newStoreId, value: inputValue });
			}
			setOpenDialog(false);
			setQuery("");
		} catch (error) {
			console.error("Failed to create store:", error);
			// You might want to show a toast notification here
			toastManager.add({
				description: "Failed to create store. Please try again.",
				type: "error",
			});
		} finally {
			setIsCreating(false);
		}
	}

	function handleCreateSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		handleCreate();
	}

	const trimmed = query.trim();
	const lowered = trimmed.toLocaleLowerCase();
	const exactExists = storeItems.some(
		(store) => store.value.trim().toLocaleLowerCase() === lowered
	);
	const itemsForView: Array<StoreItem> =
		trimmed !== "" && !exactExists
			? [
					...storeItems,
					{
						creatable: trimmed,
						id: `create:${lowered}`,
						value: `Create "${trimmed}"`,
					},
				]
			: storeItems;

	return (
		<React.Fragment>
			<Combobox
				{...props}
				items={itemsForView}
				onValueChange={(item) => {
					const selectedItem = item as StoreItem;
					if (selectedItem && selectedItem.creatable) {
						pendingQueryRef.current = selectedItem.creatable;
						setOpenDialog(true);
						return;
					}
					if (selectedItem && !selectedItem.creatable) {
						onChange?.(selectedItem);
						setQuery("");
					}
				}}
				value={value}
				inputValue={query}
				onInputValueChange={setQuery}
				onOpenChange={(_open, details) => {
					if ("key" in details.event && details.event.key === "Enter") {
						if (trimmed === "") {
							return;
						}

						const existing = storeItems.find(
							(store) => store.value.trim().toLocaleLowerCase() === lowered
						);

						if (existing) {
							onChange?.(existing);
							setQuery("");
							return;
						}

						pendingQueryRef.current = trimmed;
						setOpenDialog(true);
					}
				}}
			>
				<div
					className="w-full"
					ref={containerRef}
				>
					<ComboboxInput
						ref={comboboxInputRef}
						id={id}
						placeholder={value ? "" : "Select a store"}
						className="w-full"
					/>
				</div>

				<ComboboxPositioner
					className="z-50 outline-none"
					sideOffset={4}
					anchor={containerRef}
				>
					<ComboboxPopup>
						<ComboboxEmpty>No stores found.</ComboboxEmpty>
						<ComboboxList>
							{(item: StoreItem) =>
								item.creatable ? (
									<ComboboxItem
										key={item.id}
										value={item}
									>
										<span className="col-start-1">
											<PlusIcon className="size-3" />
										</span>
										<div className="col-start-2">Create &quot;{item.creatable}&quot;</div>
									</ComboboxItem>
								) : (
									<ComboboxItem
										key={item.id}
										value={item}
									>
										<ComboboxItemIndicator />
										<div className="col-start-2">{item.value}</div>
									</ComboboxItem>
								)
							}
						</ComboboxList>
					</ComboboxPopup>
				</ComboboxPositioner>
			</Combobox>

			<Dialog
				open={openDialog}
				onOpenChange={setOpenDialog}
			>
				<DialogContent initialFocus={createInputRef}>
					<DialogTitle>Create new store</DialogTitle>
					<DialogDescription>Add a new store to select.</DialogDescription>
					<form onSubmit={handleCreateSubmit}>
						<Input
							ref={createInputRef}
							placeholder="Store name"
							defaultValue={pendingQueryRef.current}
						/>
						<div className="mt-4 flex justify-end gap-4">
							<DialogClose>Cancel</DialogClose>
							<Button
								type="submit"
								disabled={isCreating}
							>
								{isCreating ? "Creating..." : "Create"}
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</React.Fragment>
	);
}

interface StoreItem {
	creatable?: string;
	id: string;
	value: string;
}
