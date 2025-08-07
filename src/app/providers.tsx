"use client";

import { ConvexClientProvider } from "@/providers/ConvexClientProvider";
import type * as React from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
	return <ConvexClientProvider>{children}</ConvexClientProvider>;
}
