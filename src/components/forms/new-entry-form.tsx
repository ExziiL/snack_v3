"use client";

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
});

type FormValues = z.infer<typeof schema>;

export default function NewEntryForm() {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
	} = useForm({
		resolver: zodResolver(schema),
		defaultValues: {
			article_name: "",
			price: undefined,
			category: "",
		},
	});

	const onSubmit = async (data: FormValues) => {
		console.log("validated data: ", data);
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
				// variant="def"
				disabled={isSubmitting}
			>
				{isSubmitting ? "Submitting…" : "Submit"}
			</Button>
		</Form>
	);
}
