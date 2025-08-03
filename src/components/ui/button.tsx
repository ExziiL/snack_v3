import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import React from "react";

// ("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive");

const buttonVariants = cva(
	"flex h-10 items-center justify-center rounded-md  px-3.5 text-base font-medium  select-none focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800  disabled:cursor-not-allowed ",
	{
		variants: {
			variant: {
				default:
					"border border-gray-200 bg-gray-50 hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 text-gray-900 active:bg-gray-100",
				destructive: "",
				outline: "",
				secondary: "",
				ghost: "",
				link: "text-primary underline-offset-4 hover:underline",
			},
			size: {
				default: "h-9 px-4 py-2 has-[>svg]:px-3",
				sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
				lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
				icon: "size-9",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	}
);

function Button({
	className,
	variant,
	size,
	...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
	return (
		<button
			data-slot="button"
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
