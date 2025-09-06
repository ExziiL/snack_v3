"use client";

import { ConvexClientProvider } from "@/providers/ConvexClientProvider";
import { ToastProvider } from "@/providers/toast-provider";
import { ClerkProvider } from "@clerk/nextjs";
import type * as React from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
			<ConvexClientProvider>
				<ToastProvider>{children}</ToastProvider>
			</ConvexClientProvider>
		</ClerkProvider>
	);
}
