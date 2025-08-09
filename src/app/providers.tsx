"use client";

import { ConvexClientProvider } from "@/providers/ConvexClientProvider";
import { ToastProvider } from "@/providers/toast-provider";
import type * as React from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ConvexClientProvider>
			<ToastProvider>{children}</ToastProvider>
		</ConvexClientProvider>
	);
}
