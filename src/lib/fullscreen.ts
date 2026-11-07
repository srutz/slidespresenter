import { useSyncExternalStore } from "react";

function subscribe(cb: () => void) {
	document.addEventListener("fullscreenchange", cb);
	return () => document.removeEventListener("fullscreenchange", cb);
}

export function useIsFullscreen() {
	return useSyncExternalStore(
		subscribe,
		() => document.fullscreenElement !== null,
	);
}
