import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { TooltipProvider } from "@/components/ui/tooltip";

import { router } from "./router";

const root = document.getElementById("root");
if (root) {
	createRoot(root).render(
		<StrictMode>
			<TooltipProvider>
				<RouterProvider router={router} />
			</TooltipProvider>
		</StrictMode>,
	);
}
