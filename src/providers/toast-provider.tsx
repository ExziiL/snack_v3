// ToastProvider.tsx
import ToastList from "@/components/ui/toast-list";
import { Toast } from "@base-ui-components/react/toast";
import React from "react";

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => (
	<Toast.Provider>
		{children}
		<Toast.Portal>
			<Toast.Viewport className="fixed z-10 top-auto right-[1rem] bottom-[1rem] mx-auto flex w-[250px] sm:right-[2rem] sm:bottom-[2rem] sm:w-[300px]">
				<ToastList />
			</Toast.Viewport>
		</Toast.Portal>
	</Toast.Provider>
);
