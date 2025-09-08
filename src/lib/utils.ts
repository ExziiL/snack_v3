import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Formats a numeric input value as YNAB-style currency (last two digits as cents)
 * @param value - The raw input value (string or number)
 * @param currency - The currency symbol (default: "€")
 * @returns Formatted currency string (e.g., "123" -> "1,23€", "89" -> "0,89€")
 */
export function formatYNABPrice(value: string | number, currency: string = "€"): string {
	const numericValue = typeof value === "string" ? value.replace(/[^\d]/g, "") : value.toString();

	if (!numericValue || numericValue === "0") {
		return `0,00${currency}`;
	}

	// Convert to cents (divide by 100)
	const cents = parseInt(numericValue, 10);
	const euros = cents / 100;

	// Format with comma as decimal separator
	return `${euros.toFixed(2).replace(".", ",")}`;
}

/**
 * Parses a YNAB-formatted price string back to a numeric value
 * @param formattedValue - The formatted currency string (e.g., "1,23€")
 * @returns The numeric value in cents
 */
export function parseYNABPrice(formattedValue: string): number {
	// Remove currency symbol and replace comma with dot
	const cleanValue = formattedValue.replace(/[^\d,]/g, "").replace(",", ".");
	return Math.round(parseFloat(cleanValue || "0") * 100);
}

/**
 * Formats raw input for display while typing (YNAB style)
 * @param value - The raw input value
 * @param currency - The currency symbol (default: "€")
 * @returns Formatted display string
 */
export function formatYNABInput(value: string, currency: string = "€"): string {
	// Remove all non-digit characters
	const digits = value.replace(/[^\d]/g, "");

	if (!digits) {
		return "";
	}

	// Convert to cents and format
	const cents = parseInt(digits, 10);
	const euros = cents / 100;

	// Format with comma as decimal separator
	return `${euros.toFixed(2).replace(".", ",")}`;
}
