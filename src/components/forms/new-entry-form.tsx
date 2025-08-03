"use client";

import { createClient } from "@/supabase/client";
import { Field } from "@base-ui-components/react/field";
import { Form } from "@base-ui-components/react/form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";

const schema = z.object({
	article_name: z
		.string()
		.min(1, { message: "Article name is required" })
		.min(2, { message: "Must be at least 2 characters" }),
	price: z.coerce
		.number()
		.min(1, { message: "Price is required" })
		.positive("Must be a positive number"),
	category: z
		.string()
		.min(1, { message: "Category is required" })
		.min(2, "Must be at least 2 characters"),
	quantity: z.coerce
		.number()
		.min(1, { message: "Quantity is required" })
		.positive("Must be a positive number"),
});

type FormValues = z.infer<typeof schema>;

export default function NewEntryForm() {
	const supabase = createClient();
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
	} = useForm({
		resolver: zodResolver(schema),
		defaultValues: {
			article_name: "Cola Zero",
			quantity: 1,
			price: 123,
			category: "Cola Zero",
		},
	});

	const onSubmit = async (data: FormValues) => {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			const userId = user?.id;

			const { data: catData, error: catError } = await supabase
				.from("categories")
				.upsert(
					{ name: data.article_name.trim(), user_id: userId },
					{ onConflict: "name" }
				)
				.select("id");

			if (catError) throw catError;
			const categoryId = catData?.[0].id;

			const { data: entryData, error: entryError } = await supabase
				.from("entries")
				.insert({
					title: data.article_name.trim(),
					price: data.price,
					quantity: data.quantity,
					user_id: userId,
				})
				.select("id")
				.single();

			if (entryError) throw entryError;
			const entryId = entryData?.id;

			const { error: linkError } = await supabase
				.from("entry_categories")
				.insert([
					{
						entry_id: entryId,
						category_id: categoryId,
					},
				]);

			if (linkError) throw linkError;

			// TODO: Add toast that shows success
		} catch (err) {
			console.error(err);
		}
		reset();
	};

	// Map react-hook-form errors to string messages for Form component
	const formErrors = Object.fromEntries(
		Object.entries(errors).map(([key, value]) => [key, value?.message ?? ""])
	);

	return (
		<Form
			className="flex w-full max-w-64 flex-col gap-4"
			onSubmit={handleSubmit(onSubmit)}
			errors={formErrors}
		>
			<Field.Root
				name="article_name"
				className="flex flex-col items-start gap-1"
			>
				<Field.Label className="text-sm font-medium text-gray-900">
					Article name
				</Field.Label>
				<Field.Control
					{...register("article_name")}
					placeholder="Enter name"
					className="h-10 w-full rounded-md border border-gray-200 pl-3.5 text-base text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800"
				/>
				<Field.Error className="text-sm text-red-800">
					{errors.article_name?.message}
				</Field.Error>
			</Field.Root>

			<Field.Root
				name="quantity"
				className="flex flex-col items-start gap-1"
			>
				<Field.Label className="text-sm font-medium text-gray-900">
					Quantity
				</Field.Label>
				<Field.Control
					{...register("quantity")}
					type="number"
					placeholder="Enter Quantity"
					className="h-10 w-full rounded-md border border-gray-200 pl-3.5 text-base text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800"
				/>
				<Field.Error className="text-sm text-red-800">
					{errors.quantity?.message}
				</Field.Error>
			</Field.Root>

			<Field.Root
				name="price"
				className="flex flex-col items-start gap-1"
			>
				<Field.Label className="text-sm font-medium text-gray-900">
					Price
				</Field.Label>
				<Field.Control
					{...register("price")}
					type="number"
					placeholder="Enter price"
					className="h-10 w-full rounded-md border border-gray-200 pl-3.5 text-base text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800"
				/>
				<Field.Error className="text-sm text-red-800">
					{errors.price?.message}
				</Field.Error>
			</Field.Root>

			<Field.Root
				name="category"
				className="flex flex-col items-start gap-1"
			>
				<Field.Label className="text-sm font-medium text-gray-900">
					Category
				</Field.Label>
				<Field.Control
					{...register("category")}
					placeholder="Enter category"
					className="h-10 w-full rounded-md border border-gray-200 pl-3.5 text-base text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800"
				/>
				<Field.Error className="text-sm text-red-800">
					{errors.category?.message}
				</Field.Error>
			</Field.Root>

			<Button
				type="submit"
				disabled={isSubmitting}
			>
				{isSubmitting ? "Submitting…" : "Submit"}
			</Button>
		</Form>
	);
}
