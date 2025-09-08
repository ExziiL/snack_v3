"use client";

import { Button } from "@/components/ui/button";
import {
	Combobox,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxItemIndicator,
	ComboboxList,
	ComboboxPopup,
	ComboboxPositioner,
	ComboboxTrigger,
	ComboboxValue,
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

interface NewCategoryComboboxProps {
	value?: CategoryItem | null;
	onChange?: (value: CategoryItem | null) => void;
}

export default function NewCategoryCombobox({
	value,
	onChange,
	...props
}: NewCategoryComboboxProps) {
	const id = React.useId();

	const toastManager = Toast.useToastManager();

	const categories = useQuery(api.categories.list);
	const createCategory = useMutation(api.categories.createCategory);

	const [query, setQuery] = React.useState("");
	const [openDialog, setOpenDialog] = React.useState(false);
	const [isCreating, setIsCreating] = React.useState(false);

	const containerRef = React.useRef<HTMLDivElement | null>(null);
	const createInputRef = React.useRef<HTMLInputElement | null>(null);
	const comboboxInputRef = React.useRef<HTMLInputElement | null>(null);
	const pendingQueryRef = React.useRef("");

	// Convert categories to CategoryItem format
	const categoryItems: CategoryItem[] = React.useMemo(() => {
		return categories?.map((category) => ({ id: category._id, value: category.name })) || [];
	}, [categories]);

	async function handleCreate() {
		const input = createInputRef.current || comboboxInputRef.current;
		const inputValue = input ? input.value.trim() : "";
		if (!inputValue) {
			return;
		}

		const normalized = inputValue.toLocaleLowerCase();
		const existing = categoryItems.find(
			(category) => category.value.trim().toLocaleLowerCase() === normalized
		);

		if (existing) {
			onChange?.(existing);
			setOpenDialog(false);
			setQuery("");
			return;
		}

		setIsCreating(true);
		try {
			const newCategoryId = await createCategory({ name: inputValue });
			const newCategory = categoryItems.find((category) => category.id === newCategoryId) || {
				id: newCategoryId,
				value: inputValue,
			};
			onChange?.(newCategory);
			setOpenDialog(false);
			setQuery("");
		} catch (error) {
			console.error("Failed to create category:", error);
			toastManager.add({
				description: "Failed to create category. Please try again.",
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
	const exactExists = categoryItems.some(
		(category) => category.value.trim().toLocaleLowerCase() === lowered
	);
	const itemsForView: Array<CategoryItem> =
		trimmed !== "" && !exactExists
			? [
					...categoryItems,
					{
						creatable: trimmed,
						id: `create:${lowered}`,
						value: `Create "${trimmed}"`,
					},
				]
			: categoryItems;

	return (
		<React.Fragment>
			<Combobox
				{...props}
				items={itemsForView}
				onValueChange={(item) => {
					const selectedItem = item as CategoryItem;
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

						const existing = categoryItems.find(
							(category) => category.value.trim().toLocaleLowerCase() === lowered
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
						placeholder="e.g. groceries"
						className="w-full"
					/>
				</div>

				<ComboboxPositioner
					className="z-50 outline-none"
					sideOffset={4}
					anchor={containerRef}
				>
					<ComboboxPopup>
						<ComboboxEmpty>No categories found.</ComboboxEmpty>
						<ComboboxList>
							{(item: CategoryItem) =>
								item.creatable ? (
									<ComboboxItem
										key={item.id}
										value={item}
									>
										<span className="mr-2">
											<PlusIcon className="size-3" />
										</span>
										Create &quot;{item.creatable}&quot;
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
					<DialogTitle>Create new category</DialogTitle>
					<DialogDescription>Add a new category to select.</DialogDescription>
					<form onSubmit={handleCreateSubmit}>
						<Input
							ref={createInputRef}
							placeholder="Category name"
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

interface CategoryItem {
	creatable?: string;
	id: string;
	value: string;
}
