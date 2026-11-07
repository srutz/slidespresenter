import { useEffect } from "react";
import { useIsFullscreen } from "@/lib/fullscreen";
import { useSettings } from "@/lib/settings";

const IDLE_MS = 2000;

/**
 * In fullscreen (when enabled in the settings) sets `data-chrome-hidden` on
 * <html> after the mouse has been idle for a moment; index.css hides the
 * header, sidebar and footer for it. Moving the mouse brings them back.
 */
export function ChromeAutoHide() {
	const isFullscreen = useIsFullscreen();
	const [{ hideChromeInFullscreen }] = useSettings();
	const active = isFullscreen && hideChromeInFullscreen;

	useEffect(() => {
		const root = document.documentElement;
		if (!active) return;
		let timer: number;
		const hide = () => root.setAttribute("data-chrome-hidden", "");
		const onMove = () => {
			root.removeAttribute("data-chrome-hidden");
			window.clearTimeout(timer);
			timer = window.setTimeout(hide, IDLE_MS);
		};
		hide();
		window.addEventListener("mousemove", onMove);
		return () => {
			window.removeEventListener("mousemove", onMove);
			window.clearTimeout(timer);
			root.removeAttribute("data-chrome-hidden");
		};
	}, [active]);

	return null;
}
