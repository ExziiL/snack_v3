"use client";

import { Select, Toast } from "@base-ui-components/react";
import { Field } from "@base-ui-components/react/field";
import { Form } from "@base-ui-components/react/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "../ui/button";

const schema = z
	.object({
		article_name: z
			.string()
			.min(1, { message: "Article name is required" })
			.min(2, { message: "Must be at least 2 characters" }),
		price: z.coerce
			.number()
			.min(1, { message: "Price is required" })
			.positive("Must be a positive number"),
		categoryId: z.string().optional(),
		newCategory: z.string().optional(),
		quantity: z.coerce
			.number()
			.min(1, { message: "Quantity is required" })
			.positive("Must be a positive number"),
		storeId: z.string().optional(),
		newStore: z.string().optional(),
		purchaseDate: z.string(),
	})
	.refine((data) => data.categoryId || (data.newCategory && data.newCategory.length > 0), {
		message: "Either select a category or enter a new one",
		path: ["categoryId"],
	})
	.refine((data) => data.storeId || (data.newStore && data.newStore.length > 0), {
		message: "Either select a store or enter a new one",
		path: ["storeId"],
	});

type FormValues = z.infer<typeof schema>;

export default function NewEntryForm() {
	const categories = useQuery(api.categories.list);
	const stores = useQuery(api.stores.list);

	const createItem = useMutation(api.entries.create);
	const createCategoryMutation = useMutation(api.categories.createCategory);
	const createStoreMutation = useMutation(api.stores.createStore);

	const toastManager = Toast.useToastManager();

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
		control,
	} = useForm({
		resolver: zodResolver(schema),
		defaultValues: {
			article_name: "Cola Zero",
			quantity: 1,
			price: 123,
			newCategory: "",
			categoryId: "",
			newStore: "",
			storeId: "",
			purchaseDate: new Date().toISOString(),
		},
	});

	const onSubmit = async (data: FormValues) => {
		try {
			let categoryId = data.categoryId as Id<"categories">;
			let storeId = data.storeId as Id<"stores">;

			if (data.newCategory && data.newCategory.length > 0) {
				categoryId = await createCategoryMutation({
					name: data.newCategory,
				});
			}

			if (data.newStore && data.newStore.length > 0) {
				storeId = await createStoreMutation({ name: data.newStore });
			}

			await createItem({
				name: data.article_name,
				price: data.price,
				quantity: data.quantity,
				categoryId: categoryId,
				storeId: storeId,
				purchaseDate: data.purchaseDate,
			});

			toastManager.add({
				description: "Successfully added new entry.",
				type: "success",
			});
			reset();
		} catch (error) {
			console.error("Failed to create item: ", error);
		}
	};

	// Map react-hook-form errors to string messages for Form component
	const formErrors = Object.fromEntries(
		Object.entries(errors).map(([key, value]) => [key, value?.message ?? ""])
	);

	return (
		<Form
			className="flex flex-col w-full gap-4 max-w-64"
			onSubmit={handleSubmit(onSubmit)}
			errors={formErrors}
		>
			<Field.Root
				name="article_name"
				className="flex flex-col items-start gap-1"
			>
				<Field.Label className="text-sm font-medium text-gray-900">Article name</Field.Label>
				<Field.Control
					{...register("article_name")}
					placeholder="Enter name"
					className="h-10 w-full rounded-md border border-gray-200 pl-3.5 text-base text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800"
				/>
				<Field.Error className="text-sm text-red-800">{errors.article_name?.message}</Field.Error>
			</Field.Root>

			<Field.Root
				name="quantity"
				className="flex flex-col items-start gap-1"
			>
				<Field.Label className="text-sm font-medium text-gray-900">Quantity</Field.Label>
				<Field.Control
					{...register("quantity")}
					type="number"
					placeholder="Enter Quantity"
					className="h-10 w-full rounded-md border border-gray-200 pl-3.5 text-base text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800"
				/>
				<Field.Error className="text-sm text-red-800">{errors.quantity?.message}</Field.Error>
			</Field.Root>

			<Field.Root
				name="price"
				className="flex flex-col items-start gap-1"
			>
				<Field.Label className="text-sm font-medium text-gray-900">Price</Field.Label>
				<Field.Control
					{...register("price")}
					type="number"
					placeholder="Enter price"
					className="h-10 w-full rounded-md border border-gray-200 pl-3.5 text-base text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800"
				/>
				<Field.Error className="text-sm text-red-800">{errors.price?.message}</Field.Error>
			</Field.Root>

			<Field.Root
				name="purchaseDate"
				className="flex flex-col items-start gap-1"
			>
				<Field.Label className="text-sm font-medium text-gray-900">Date</Field.Label>
				<Field.Control
					{...register("purchaseDate")}
					type="date"
					placeholder="Enter date"
					className="h-10 w-full rounded-md border border-gray-200 pl-3.5 text-base text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800"
				/>
				<Field.Error className="text-sm text-red-800">{errors.purchaseDate?.message}</Field.Error>
			</Field.Root>

			<Field.Root
				name="newStore"
				className="flex flex-col items-start gap-1"
			>
				<Field.Label className="text-sm font-medium text-gray-900">New Store</Field.Label>
				<Field.Control
					{...register("newStore")}
					placeholder="Enter new store"
					className="h-10 w-full rounded-md border border-gray-200 pl-3.5 text-base text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800"
				/>
				<Field.Error className="text-sm text-red-800">{errors.newStore?.message}</Field.Error>
			</Field.Root>

			<Controller
				name="storeId"
				control={control}
				render={({ field }) => {
					const selectedStore = stores?.find((store) => store._id === field.value);

					return (
						<Field.Root
							name="storeId"
							className="flex flex-col items-start gap-1"
						>
							<Field.Label className="text-sm font-medium text-gray-900">Store</Field.Label>
							<Select.Root
								items={
									stores?.map((store) => ({
										label: store.name,
										value: store._id,
									})) ?? []
								}
								value={field.value as Id<"stores">}
								onValueChange={field.onChange}
							>
								<Select.Trigger className="flex h-10 min-w-36 items-center justify-between gap-3 rounded-md border border-gray-200 pr-3 pl-3.5 text-base text-gray-900 select-none hover:bg-gray-100 focus-visible:outline focus-visible:-outline-offset-1 focus-visible:outline-blue-800 data-[popup-open]:bg-gray-100 cursor-default">
									<Select.Value>{selectedStore?.name || "Select a store"}</Select.Value>
									<Select.Icon className="flex">
										<ChevronUpDownIcon />
									</Select.Icon>
								</Select.Trigger>
								<Select.Portal>
									<Select.Positioner
										className="z-10 outline-none select-none"
										sideOffset={8}
									>
										<Select.ScrollUpArrow className="top-0 z-[1] flex h-4 w-full cursor-default items-center justify-center rounded-md bg-[canvas] text-center text-xs before:absolute before:top-[-100%] before:left-0 before:h-full before:w-full before:content-[''] data-[direction=down]:bottom-0 data-[direction=down]:before:bottom-[-100%]" />
										<Select.Popup className="group max-h-[var(--available-height)] origin-[var(--transform-origin)] overflow-y-auto rounded-md bg-[canvas] py-1 text-gray-900 shadow-lg shadow-gray-200 outline outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[side=none]:data-[ending-style]:transition-none data-[starting-style]:scale-90 data-[starting-style]:opacity-0 data-[side=none]:data-[starting-style]:scale-100 data-[side=none]:data-[starting-style]:opacity-100 data-[side=none]:data-[starting-style]:transition-none dark:shadow-none dark:-outline-offset-1 dark:outline-gray-300">
											{stores?.map(({ name, _id }) => (
												<Select.Item
													key={_id}
													value={_id}
													className="grid min-w-[var(--anchor-width)] cursor-default grid-cols-[0.75rem_1fr] items-center gap-2 py-2 pr-4 pl-2.5 text-sm leading-4 outline-none select-none group-data-[side=none]:min-w-[calc(var(--anchor-width)+1rem)] group-data-[side=none]:pr-12 group-data-[side=none]:text-base group-data-[side=none]:leading-4 data-[highlighted]:relative data-[highlighted]:z-0 data-[highlighted]:text-gray-50 data-[highlighted]:before:absolute data-[highlighted]:before:inset-x-1 data-[highlighted]:before:inset-y-0 data-[highlighted]:before:z-[-1] data-[highlighted]:before:rounded-sm data-[highlighted]:before:bg-gray-900 pointer-coarse:py-2.5 pointer-coarse:text-[0.925rem]"
												>
													<Select.ItemIndicator className="col-start-1">
														<CheckIcon className="size-3" />
													</Select.ItemIndicator>
													<Select.ItemText className="col-start-2">{name}</Select.ItemText>
												</Select.Item>
											))}
										</Select.Popup>
										<Select.ScrollDownArrow className="bottom-0 z-[1] flex h-4 w-full cursor-default items-center justify-center rounded-md bg-[canvas] text-center text-xs before:absolute before:top-[-100%] before:left-0 before:h-full before:w-full before:content-[''] data-[direction=down]:bottom-0 data-[direction=down]:before:bottom-[-100%]" />
									</Select.Positioner>
								</Select.Portal>
							</Select.Root>
							<Field.Error className="text-sm text-red-800">{errors.storeId?.message}</Field.Error>
						</Field.Root>
					);
				}}
			/>

			<Field.Root
				name="newCategory"
				className="flex flex-col items-start gap-1"
			>
				<Field.Label className="text-sm font-medium text-gray-900">New Category</Field.Label>
				<Field.Control
					{...register("newCategory")}
					placeholder="Enter new category"
					className="h-10 w-full rounded-md border border-gray-200 pl-3.5 text-base text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800"
				/>
				<Field.Error className="text-sm text-red-800">{errors.newCategory?.message}</Field.Error>
			</Field.Root>

			<Controller
				name="categoryId"
				control={control}
				render={({ field }) => {
					const selectedCategory = categories?.find((category) => category._id === field.value);

					return (
						<Field.Root
							name="categoryId"
							className="flex flex-col items-start gap-1"
						>
							<Field.Label className="text-sm font-medium text-gray-900">Category</Field.Label>
							<Select.Root
								items={
									categories?.map((category) => ({
										label: category.name,
										value: category._id,
									})) ?? []
								}
								value={field.value as Id<"categories">}
								onValueChange={field.onChange}
							>
								<Select.Trigger className="flex h-10 min-w-36 items-center justify-between gap-3 rounded-md border border-gray-200 pr-3 pl-3.5 text-base text-gray-900 select-none hover:bg-gray-100 focus-visible:outline focus-visible:-outline-offset-1 focus-visible:outline-blue-800 data-[popup-open]:bg-gray-100 cursor-default">
									<Select.Value>{selectedCategory?.name || "Select a category"}</Select.Value>
									<Select.Icon className="flex">
										<ChevronUpDownIcon />
									</Select.Icon>
								</Select.Trigger>
								<Select.Portal>
									<Select.Positioner
										className="z-10 outline-none select-none"
										sideOffset={8}
									>
										<Select.ScrollUpArrow className="top-0 z-[1] flex h-4 w-full cursor-default items-center justify-center rounded-md bg-[canvas] text-center text-xs before:absolute before:top-[-100%] before:left-0 before:h-full before:w-full before:content-[''] data-[direction=down]:bottom-0 data-[direction=down]:before:bottom-[-100%]" />
										<Select.Popup className="group max-h-[var(--available-height)] origin-[var(--transform-origin)] overflow-y-auto rounded-md bg-[canvas] py-1 text-gray-900 shadow-lg shadow-gray-200 outline outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[side=none]:data-[ending-style]:transition-none data-[starting-style]:scale-90 data-[starting-style]:opacity-0 data-[side=none]:data-[starting-style]:scale-100 data-[side=none]:data-[starting-style]:opacity-100 data-[side=none]:data-[starting-style]:transition-none dark:shadow-none dark:-outline-offset-1 dark:outline-gray-300">
											{categories?.map(({ name, _id }) => (
												<Select.Item
													key={_id}
													value={_id}
													className="grid min-w-[var(--anchor-width)] cursor-default grid-cols-[0.75rem_1fr] items-center gap-2 py-2 pr-4 pl-2.5 text-sm leading-4 outline-none select-none group-data-[side=none]:min-w-[calc(var(--anchor-width)+1rem)] group-data-[side=none]:pr-12 group-data-[side=none]:text-base group-data-[side=none]:leading-4 data-[highlighted]:relative data-[highlighted]:z-0 data-[highlighted]:text-gray-50 data-[highlighted]:before:absolute data-[highlighted]:before:inset-x-1 data-[highlighted]:before:inset-y-0 data-[highlighted]:before:z-[-1] data-[highlighted]:before:rounded-sm data-[highlighted]:before:bg-gray-900 pointer-coarse:py-2.5 pointer-coarse:text-[0.925rem]"
												>
													<Select.ItemIndicator className="col-start-1">
														<CheckIcon className="size-3" />
													</Select.ItemIndicator>
													<Select.ItemText className="col-start-2">{name}</Select.ItemText>
												</Select.Item>
											))}
										</Select.Popup>
										<Select.ScrollDownArrow className="bottom-0 z-[1] flex h-4 w-full cursor-default items-center justify-center rounded-md bg-[canvas] text-center text-xs before:absolute before:top-[-100%] before:left-0 before:h-full before:w-full before:content-[''] data-[direction=down]:bottom-0 data-[direction=down]:before:bottom-[-100%]" />
									</Select.Positioner>
								</Select.Portal>
							</Select.Root>
							<Field.Error className="text-sm text-red-800">
								{errors.categoryId?.message}
							</Field.Error>
						</Field.Root>
					);
				}}
			/>

			<Button
				type="submit"
				disabled={isSubmitting}
			>
				{isSubmitting ? "Submitting…" : "Submit"}
			</Button>
		</Form>
	);
}

function ChevronUpDownIcon(props: React.ComponentProps<"svg">) {
	return (
		<svg
			width="8"
			height="12"
			viewBox="0 0 8 12"
			fill="none"
			stroke="currentcolor"
			strokeWidth="1.5"
			{...props}
		>
			<path d="M0.5 4.5L4 1.5L7.5 4.5" />
			<path d="M0.5 7.5L4 10.5L7.5 7.5" />
		</svg>
	);
}

function CheckIcon(props: React.ComponentProps<"svg">) {
	return (
		<svg
			fill="currentcolor"
			width="10"
			height="10"
			viewBox="0 0 10 10"
			{...props}
		>
			<path d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z" />
		</svg>
	);
}
