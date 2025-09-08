"use client";

import { cn } from "@/lib/utils";
import { Toast } from "@base-ui-components/react";
import { Field } from "@base-ui-components/react/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverPositioner, PopoverTrigger } from "../ui/popover";
import NewCategoryCombobox from "./inputs/new-category-combobox";
import NewStoreCombobox from "./inputs/new-store-combobox";

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
		selectedCategory: z
			.object({
				id: z.string(),
				value: z.string(),
			})
			.nullable(),
		selectedStore: z
			.object({
				id: z.string(),
				value: z.string(),
			})
			.nullable(),
		quantity: z.coerce
			.number()
			.min(1, { message: "Quantity is required" })
			.positive("Must be a positive number"),
		purchaseDate: z.string(),
	})
	.refine((data) => data.selectedCategory !== null, {
		message: "Please select at least one category",
		path: ["selectedCategory"],
	})
	.refine((data) => data.selectedStore !== null, {
		message: "Please select a store",
		path: ["selectedStore"],
	});

type FormValues = z.infer<typeof schema>;

export default function NewEntryForm() {
	const createItem = useMutation(api.entries.create);
	const toastManager = Toast.useToastManager();

	const form = useForm({
		resolver: zodResolver(schema),
		defaultValues: {
			article_name: "",
			quantity: 1,
			price: undefined,
			selectedCategory: null,
			selectedStore: null,
			purchaseDate: new Date().toISOString(),
		},
	});

	const onSubmit = async (data: FormValues) => {
		try {
			if (!data.selectedCategory || !data.selectedStore) {
				throw new Error("Category and Store are required");
			}

			const categoryId = data.selectedCategory.id as Id<"categories">;
			const storeId = data.selectedStore.id as Id<"stores">;

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
			form.reset();
		} catch (error) {
			console.error("Failed to create item: ", error);
			toastManager.add({
				description: "Failed to create entry. Please try again.",
				type: "error",
			});
		}
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-4"
			>
				<FormField
					name="article_name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Article name</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage>{form.formState.errors.article_name?.message}</FormMessage>
						</FormItem>
					)}
				/>

				<FormField
					name="quantity"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Quantity</FormLabel>
							<FormControl>
								<Input
									{...field}
									type="number"
									placeholder="Enter Quantity"
								/>
							</FormControl>
							<FormMessage>{form.formState.errors.quantity?.message}</FormMessage>
						</FormItem>
					)}
				/>
				<FormField
					name="price"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Price</FormLabel>
							<FormControl>
								<Input
									{...field}
									type="number"
									placeholder="Enter price"
								/>
							</FormControl>
							<FormMessage>{form.formState.errors.price?.message}</FormMessage>
						</FormItem>
					)}
				/>

				<FormField
					name="purchaseDate"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Date</FormLabel>
							<FormControl>
								<Popover>
									<PopoverTrigger
										render={
											<Button
												variant={"outline"}
												className={cn(
													"w-[240px] pl-3 text-left font-normal",
													!field.value && "text-muted-foreground"
												)}
											/>
										}
									>
										{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
										<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
									</PopoverTrigger>
									<PopoverPositioner>
										<PopoverContent className="w-auto p-0">
											<Calendar
												mode="single"
												selected={field.value}
												onSelect={field.onChange}
												disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
												captionLayout="dropdown"
											/>
										</PopoverContent>
									</PopoverPositioner>
								</Popover>
							</FormControl>
							<FormMessage>{form.formState.errors.purchaseDate?.message}</FormMessage>
						</FormItem>
					)}
				/>

				<FormField
					name="selectedStore"
					control={form.control}
					render={({ field }) => (
						<FormItem>
							<FormLabel>Store</FormLabel>
							<FormControl>
								<NewStoreCombobox
									value={field.value}
									onChange={field.onChange}
								/>
							</FormControl>
							<FormMessage>{form.formState.errors.selectedStore?.message}</FormMessage>
						</FormItem>
					)}
				/>

				<FormField
					name="selectedCategory"
					control={form.control}
					render={({ field }) => (
						<FormItem>
							<FormLabel>Category</FormLabel>
							<FormControl>
								<NewCategoryCombobox
									value={field.value}
									onChange={field.onChange}
								/>
							</FormControl>
							<FormMessage>{form.formState.errors.selectedCategory?.message}</FormMessage>
						</FormItem>
					)}
				/>

				<Button
					type="submit"
					disabled={form.formState.isSubmitting}
				>
					{form.formState.isSubmitting ? "Submitting…" : "Submit"}
				</Button>
			</form>
		</Form>
	);
}
