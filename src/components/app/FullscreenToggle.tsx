import { Maximize, Minimize } from "lucide-react";
import { useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useIsFullscreen } from "@/lib/fullscreen";

export function FullscreenToggle() {
	const isFullscreen = useIsFullscreen();

	const toggle = useCallback(() => {
		if (document.fullscreenElement) void document.exitFullscreen();
		else void document.documentElement.requestFullscreen();
	}, []);

	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			if (e.key.toLowerCase() !== "f") return;
			if (e.ctrlKey || e.metaKey || e.altKey) return;
			if (e.target instanceof HTMLElement && e.target.closest("input,textarea"))
				return;
			e.preventDefault();
			toggle();
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [toggle]);

	if (!document.fullscreenEnabled) return null;

	return (
		<Button
			variant="ghost"
			size="icon"
			className="shrink-0"
			onClick={toggle}
			aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
			title={`${isFullscreen ? "Exit fullscreen" : "Enter fullscreen"} (F)`}
		>
			{isFullscreen ? <Minimize /> : <Maximize />}
		</Button>
	);
}
