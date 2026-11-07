import { useCallback, useEffect } from "react";

const KEY = "sidebar-width";
const MIN = 180;
const MAX = 700;

const clamp = (w: number) => Math.min(MAX, Math.max(MIN, w));

function wrapperOf(el: HTMLElement) {
	return el.closest<HTMLElement>('[data-slot="sidebar-wrapper"]');
}

/** Draggable splitter on the right edge of the sidebar; width is persisted. */
export function SidebarResizeHandle() {
	// restore the stored width once
	useEffect(() => {
		try {
			const w = Number(localStorage.getItem(KEY));
			if (w) {
				document
					.querySelector<HTMLElement>('[data-slot="sidebar-wrapper"]')
					?.style.setProperty("--sidebar-width", `${clamp(w)}px`);
			}
		} catch {}
	}, []);

	const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
		const wrapper = wrapperOf(e.currentTarget);
		if (!wrapper) return;
		e.preventDefault();
		const handle = e.currentTarget;
		handle.setPointerCapture(e.pointerId);
		wrapper.dataset.resizing = "true";
		document.body.style.cursor = "col-resize";
		document.body.style.userSelect = "none";
		let width = 0;

		const move = (ev: PointerEvent) => {
			width = clamp(ev.clientX - wrapper.getBoundingClientRect().left);
			wrapper.style.setProperty("--sidebar-width", `${width}px`);
		};
		const up = () => {
			handle.removeEventListener("pointermove", move);
			handle.removeEventListener("pointerup", up);
			handle.removeEventListener("pointercancel", up);
			delete wrapper.dataset.resizing;
			document.body.style.cursor = "";
			document.body.style.userSelect = "";
			if (width) {
				try {
					localStorage.setItem(KEY, String(width));
				} catch {}
			}
		};
		handle.addEventListener("pointermove", move);
		handle.addEventListener("pointerup", up);
		handle.addEventListener("pointercancel", up);
	}, []);

	return (
		// biome-ignore lint/a11y/useSemanticElements: <hr> cannot host the drag styling
		<div
			role="separator"
			aria-orientation="vertical"
			aria-label="Resize sidebar"
			onPointerDown={onPointerDown}
			className="absolute inset-y-0 -right-1 z-20 hidden w-2 cursor-col-resize touch-none after:absolute after:inset-y-0 after:left-1/2 after:w-px hover:after:bg-sidebar-border active:after:w-0.5 active:after:bg-sidebar-ring md:block"
		/>
	);
}
